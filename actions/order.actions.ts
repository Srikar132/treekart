"use server";

import { requireUser, getSupabaseServer } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import Razorpay from "razorpay";
import crypto from "crypto";
import type { CartItem } from "@/store/use-mango-cart";
import type { Database } from "@/types/database.types";

// ── Types ───────────────────────────────────────────────────────────

type OrderStatus = Database["public"]["Enums"]["order_status"];

import { type DeliveryAddress } from "@/types/checkout";
import { paymentAj } from "@/lib/arcjet";
import { headers } from "next/headers";

// Shape stored in orders.items (Json column)
type OrderItemRecord = {
  id: string;
  name: string;
  variety: string;
  pricePerKg: number;
  qty: number;
  imageUrl: string;
  weightKg: number;
  lineTotal: number; // pricePerKg * qty — stored for receipt immutability
};

export type CreateOrderResult = {
  orderId: string;       // our DB orders.id
  rzpOrderId: string;    // Razorpay order id
  amount: number;        // in paise
  currency: string;
  keyId: string;
};

export type VerifyOrderResult = {
  success: true;
  orderId: string;
  status: "confirmed";
};

// ── Razorpay client (singleton) ────────────────────────────────────

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay env vars missing");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// ── Helpers ─────────────────────────────────────────────────────────

function buildOrderItems(items: CartItem[]): OrderItemRecord[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    variety: item.variety,
    pricePerKg: item.pricePerKg,
    qty: item.qty,
    imageUrl: item.imageUrl,
    weightKg: item.weightKg ?? 0,
    lineTotal: item.pricePerKg * item.qty,
  }));
}

const DELIVER_CHARGES = 99;
const MINIMUM_ORDER_AMOUNT = 999;

function computeTotals(items: CartItem[]) {
  const subtotal = items.reduce(
    (sum, i) => sum + i.pricePerKg * i.qty,
    0
  );
  const deliveryFee = subtotal >= MINIMUM_ORDER_AMOUNT ? 0 : DELIVER_CHARGES;
  const grandTotal = subtotal + deliveryFee;
  const grandTotalPaise = Math.round(grandTotal * 100); // Razorpay works in paise
  return { subtotal, deliveryFee, grandTotal, grandTotalPaise };
}

// FIX: This is the correct Razorpay signature verification.
// Razorpay signs: HMAC-SHA256(rzpOrderId + "|" + rzpPaymentId, KEY_SECRET)
function verifyRazorpaySignature(
  rzpOrderId: string,
  rzpPaymentId: string,
  rzpSignature: string
): boolean {
  const body = `${rzpOrderId}|${rzpPaymentId}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
  return expected === rzpSignature;
}

// ── 1. Create Razorpay order + pending DB record ────────────────────

export async function createMangoOrder(
  items: CartItem[],
  deliveryAddress: DeliveryAddress
): Promise<CreateOrderResult> {

  const decision = await paymentAj.protect({ headers: await headers() }, { requested: 1 });
  if (decision.isDenied()) {
    throw new Error("Too many payment requests. Please try again later.");
  }

  if (!items || items.length === 0) {
    throw new Error("Cart is empty");
  }

  const user = await requireUser();
  const supabase = await getSupabaseServer();
  const razorpay = getRazorpay();

  const { grandTotalPaise, grandTotal } = computeTotals(items);

  // Verify product availability
  const productIds = items.map(i => i.id);
  const { data: dbProducts, error: productError } = await supabase
    .from("mango_products")
    .select("id, status, name, weight_kg")
    .in("id", productIds);

  if (productError) {
    throw new Error(`Failed to verify products: ${productError.message}`);
  }

  for (const item of items) {
    const dbProduct = dbProducts?.find(p => p.id === item.id);
    if (!dbProduct) {
      throw new Error(`Product "${item.name}" no longer exists`);
    }
    if (dbProduct.status === "out_of_stock") {
      throw new Error(`Product "${dbProduct.name}" is currently out of stock`);
    }

    // Verify weight variant exists (allow 1kg by default as per new pricing logic)
    if (item.weightKg && item.weightKg !== 1 && !dbProduct.weight_kg.includes(item.weightKg)) {
      throw new Error(`Weight variant ${item.weightKg}kg for "${dbProduct.name}" is no longer available`);
    }
  }

  const orderItems = buildOrderItems(items);
  const receiptId = `mango_${user.id.slice(0, 8)}_${Date.now()}`;

  // Create Razorpay order first (if this fails, nothing is written to DB)
  const rzpOrder = await razorpay.orders.create({
    amount: grandTotalPaise,
    currency: "INR",
    receipt: receiptId,
    notes: {
      user_id: user.id,
      item_count: String(items.length),
      type: "mango_store",
    },
  });

  // Write pending order to DB
  // payment_id temporarily holds the Razorpay order ID until payment is confirmed,
  // at which point it gets overwritten with the actual Razorpay payment ID.
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      items: orderItems as unknown as Database["public"]["Tables"]["orders"]["Insert"]["items"],
      total_amount: grandTotal,
      delivery_address: deliveryAddress as unknown as Database["public"]["Tables"]["orders"]["Insert"]["delivery_address"],
      payment_id: rzpOrder.id,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create order record: ${error.message}`);
  }

  return {
    orderId: order.id,
    rzpOrderId: rzpOrder.id,
    amount: grandTotalPaise,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID!,
  };
}

import { sendOrderConfirmedEmail } from "@/lib/email";

// ── 2. Verify Razorpay signature + fulfil order ─────────────────────

export async function verifyAndFulfilOrder(payload: {
  orderId: string;
  rzpOrderId: string;
  rzpPaymentId: string;
  rzpSignature: string;
}): Promise<VerifyOrderResult> {
  const user = await requireUser();
  const supabase = await getSupabaseServer();

  // Hard signature check — never skip
  const isValid = verifyRazorpaySignature(
    payload.rzpOrderId,
    payload.rzpPaymentId,
    payload.rzpSignature
  );

  if (!isValid) {
    console.error("[PAYMENT] Invalid signature", {
      orderId: payload.orderId,
      userId: user.id,
    });
    throw new Error(
      "Payment verification failed. If money was deducted, contact support."
    );
  }

  // FIX: Fetch the pending order by our DB id + user_id.
  // Added detailed error logging so we can see exactly why a lookup fails
  // (e.g. user session mismatch, wrong orderId, already confirmed).
  const { data: existing, error: fetchError } = await supabase
    .from("orders")
    .select(`
      id,
      status,
      user_id,
      total_amount,
      profiles (
        email,
        full_name
      )
    `)
    .eq("id", payload.orderId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !existing) {
    // Log the full detail server-side so you can debug without exposing to client
    console.error("[verifyAndFulfilOrder] Order fetch failed", {
      fetchError,
      orderId: payload.orderId,
      requestingUserId: user.id,
    });
    throw new Error("Order not found. Please contact support if payment was deducted.");
  }

  // Idempotency — if already confirmed (e.g. webhook beat us here), just return success
  if (existing.status === "confirmed") {
    return { success: true, orderId: existing.id, status: "confirmed" };
  }

  if (existing.status !== "pending") {
    throw new Error(`Order is in unexpected state: ${existing.status}`);
  }

  // Confirm the order — overwrite payment_id with the actual Razorpay payment ID
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "confirmed",
      payment_id: payload.rzpPaymentId,
    })
    .eq("id", payload.orderId)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("[verifyAndFulfilOrder] Order update failed", {
      updateError,
      orderId: payload.orderId,
    });
    throw new Error(`Failed to confirm order: ${updateError.message}`);
  }

  // Send confirmation email (non-fatal — a failure here must not break the order)
  const profile = existing.profiles as any;
  if (profile?.email) {
    try {
      await sendOrderConfirmedEmail(
        profile.email,
        profile.full_name || "Valued Customer",
        existing.id,
        existing.total_amount
      );
    } catch (err) {
      console.error("[verifyAndFulfilOrder] Failed to send confirmation email:", err);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/orders");
  revalidatePath("/admin/orders");
  revalidatePath("/account");

  return { success: true, orderId: payload.orderId, status: "confirmed" };
}

// ── 3. Get user's orders ────────────────────────────────────────────

export async function getUserOrders() {
  const user = await requireUser();
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getOrderById(orderId: string) {
  const user = await requireUser();
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (error) throw new Error("Order not found");
  return data;
}

// ── 4. Refresh Razorpay Order (for payment retries) ────────────────
//
// Creates a FRESH Razorpay order for an existing pending DB order.
// The new Razorpay order ID is stored back in payment_id so that
// verifyAndFulfilOrder can confirm the order after successful payment.

export async function refreshRazorpayOrder(orderId: string) {
  const user = await requireUser();
  const supabase = await getSupabaseServer();
  const razorpay = getRazorpay();

  // FIX: Fetch by DB order id + user_id (not by payment_id).
  // This is safe and unambiguous — the DB id never changes.
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, status, total_amount, user_id")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (error || !order) {
    console.error("[refreshRazorpayOrder] Order not found", { orderId, userId: user.id, error });
    throw new Error("Order not found");
  }

  if (order.status !== "pending") {
    throw new Error("Order is already processed — no retry needed");
  }

  // Create a fresh Razorpay order (old ones can expire or error if reused)
  const rzpOrder = await razorpay.orders.create({
    amount: Math.round(order.total_amount * 100),
    currency: "INR",
    receipt: `retry_${order.id.slice(0, 8)}_${Date.now().toString().slice(-6)}`,
    notes: {
      user_id: user.id,
      order_id: order.id,
      type: "mango_store_retry",
    },
  });

  // FIX: Update payment_id with the NEW Razorpay order ID so that
  // verifyAndFulfilOrder can find this order after the webhook fires
  // (webhook looks up orders by payment_id = rzpOrderId).
  const { error: updateError } = await supabase
    .from("orders")
    .update({ payment_id: rzpOrder.id })
    .eq("id", order.id)
    .eq("user_id", user.id); // extra guard: only update own order

  if (updateError) {
    console.error("[refreshRazorpayOrder] Failed to update payment_id", { updateError, orderId });
    throw new Error("Failed to update order reference");
  }

  return {
    rzpOrderId: rzpOrder.id,
    amount: rzpOrder.amount as number,
    currency: rzpOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID!,
  };
}