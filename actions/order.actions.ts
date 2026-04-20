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

// Shape stored in orders.items (Json column)
type OrderItemRecord = {
  id: string;
  name: string;
  variety: string;
  pricePerKg: number;
  qty: number;
  imageUrl: string;
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
    lineTotal: item.pricePerKg * item.qty,
  }));
}

function computeTotals(items: CartItem[]) {
  const subtotal = items.reduce(
    (sum, i) => sum + i.pricePerKg * i.qty,
    0
  );
  const deliveryFee = subtotal >= 999 ? 0 : 99;
  const grandTotal = subtotal + deliveryFee;
  const grandTotalPaise = Math.round(grandTotal * 100);
  return { subtotal, deliveryFee, grandTotal, grandTotalPaise };
}

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
  if (!items || items.length === 0) {
    throw new Error("Cart is empty");
  }

  const user = await requireUser();
  const supabase = await getSupabaseServer();
  const razorpay = getRazorpay();

  const { grandTotalPaise, grandTotal } = computeTotals(items);
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

  // Write pending order to DB — stores rzpOrderId as payment_id temporarily
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      items: orderItems as unknown as Database["public"]["Tables"]["orders"]["Insert"]["items"],
      total_amount: grandTotal,
      delivery_address: deliveryAddress as unknown as Database["public"]["Tables"]["orders"]["Insert"]["delivery_address"],
      payment_id: rzpOrder.id,  // Razorpay order id — overwritten with payment id on confirm
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
    // Log suspicious activity — don't expose detail to client
    console.error("[PAYMENT] Invalid signature", {
      orderId: payload.orderId,
      userId: user.id,
    });
    throw new Error(
      "Payment verification failed. If money was deducted, contact support."
    );
  }

  // Fetch the pending order — ensures user owns it
  const { data: existing, error: fetchError } = await supabase
    .from("orders")
    .select("id, status, user_id")
    .eq("id", payload.orderId)
    .eq("user_id", user.id)  // user can only confirm their own order
    .single();

  if (fetchError || !existing) {
    throw new Error("Order not found");
  }

  // Idempotency — if already confirmed (webhook beat us), just return
  if (existing.status === "confirmed") {
    return { success: true, orderId: existing.id, status: "confirmed" };
  }

  if (existing.status !== "pending") {
    throw new Error(`Order is in unexpected state: ${existing.status}`);
  }

  // Confirm the order — overwrite payment_id with actual Razorpay payment id
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "confirmed",
      payment_id: payload.rzpPaymentId, // real payment id replaces rzp order id
    })
    .eq("id", payload.orderId)
    .eq("user_id", user.id);

  if (updateError) {
    throw new Error(`Failed to confirm order: ${updateError.message}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/orders");
  revalidatePath("/admin/orders");

  return { success: true, orderId: payload.orderId, status: "confirmed" };
}

// ── 3. Razorpay webhook handler (called from /api/webhooks/razorpay) ─

export async function handleRazorpayWebhook(payload: {
  event: string;
  paymentId: string;
  rzpOrderId: string;
  signature: string;
  webhookSecret: string;
}) {
  // Webhook has its own signature format using webhook secret
  const expectedSig = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(payload.webhookSecret)
    .digest("hex");

  if (expectedSig !== payload.signature) {
    throw new Error("Invalid webhook signature");
  }

  if (payload.event !== "payment.captured") return;

  const supabase = await getSupabaseServer();

  // Find the pending order by rzp order id (stored in payment_id column)
  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("payment_id", payload.rzpOrderId)
    .single();

  if (!order || order.status === "confirmed") return; // already handled

  await supabase
    .from("orders")
    .update({
      status: "confirmed",
      payment_id: payload.paymentId,
    })
    .eq("id", order.id);

  revalidatePath("/dashboard");
}

// ── 4. Get user's orders ────────────────────────────────────────────

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
    .eq("user_id", user.id) // user can only view their own
    .single();

  if (error) throw new Error("Order not found");
  return data;
}

// ── 5. Admin actions ────────────────────────────────────────────────

export async function adminGetAllOrders(status?: OrderStatus) {
  const { requireAdmin } = await import("@/lib/auth");
  await requireAdmin();

  const supabase = await getSupabaseServer();

  let query = supabase
    .from("orders")
    .select(`
      *,
      profiles (
        full_name,
        phone
      )
    `)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminUpdateOrderStatus(
  orderId: string,
  status: "confirmed" | "shipped" | "delivered",
  trackingId?: string
) {
  const { requireAdmin } = await import("@/lib/auth");
  await requireAdmin();

  const supabase = await getSupabaseServer();

  const { error } = await supabase
    .from("orders")
    .update({
      status,
      ...(trackingId ? { tracking_id: trackingId } : {}),
    })
    .eq("id", orderId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/orders");
  revalidatePath("/dashboard");
}
