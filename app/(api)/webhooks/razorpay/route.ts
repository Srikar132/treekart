import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseServer } from "@/lib/auth";
import { sendOrderConfirmedEmail, sendRentalConfirmedEmail } from "@/lib/email";
import { revalidatePath, revalidateTag } from "next/cache";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/webhooks/razorpay
//
// Handles payment.captured events. Two paths:
//   1. Order payment  — confirm_order_by_order_id RPC (SECURITY DEFINER)
//   2. Rental payment — fulfil_rental_by_order_id RPC (SECURITY DEFINER)
//
// Both RPCs bypass RLS so the anon-key webhook client works without a
// service role key. Both are idempotent — safe if Razorpay retries.
//
// Setup in Razorpay Dashboard → Settings → Webhooks:
//   URL:    https://yourdomain.com/api/webhooks/razorpay
//   Events: payment.captured
//   Secret: set RAZORPAY_WEBHOOK_SECRET in your env to match
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    // 1. Read raw body — MUST happen before any .json() call.
    //    Razorpay signs the exact bytes it sent.
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") ?? "";

    // 2. Verify webhook signature
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
        console.error("[Webhook] RAZORPAY_WEBHOOK_SECRET is not set");
        return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

    if (expectedSignature !== signature) {
        console.warn("[Webhook] Invalid signature — possible spoofed request");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 3. Parse verified payload
    let event: any;
    try {
        event = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const eventType: string = event?.event;
    console.log("[Webhook] Received event:", eventType);

    // 4. Only handle payment.captured
    if (eventType !== "payment.captured") {
        return NextResponse.json({ received: true });
    }

    const payment = event?.payload?.payment?.entity;
    if (!payment) {
        console.error("[Webhook] payment.captured event missing payment entity", event);
        return NextResponse.json({ error: "Missing payment entity" }, { status: 400 });
    }

    const rzpPaymentId: string = payment.id;       // pay_xxxxx
    const rzpOrderId: string = payment.order_id;   // order_xxxxx

    if (!rzpPaymentId || !rzpOrderId) {
        console.error("[Webhook] Missing payment ID or order ID", payment);
        return NextResponse.json({ error: "Missing IDs" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();

    // ── Path 1: Order payment ─────────────────────────────────────────────────
    // SECURITY DEFINER RPC — bypasses RLS, works with anon key
    const { data: orderRows, error: orderRpcErr } = await supabase.rpc(
        "confirm_order_by_order_id",
        { p_rzp_order_id: rzpOrderId, p_rzp_payment_id: rzpPaymentId }
    );

    if (orderRpcErr) {
        console.error("[Webhook] confirm_order_by_order_id failed", orderRpcErr);
        return NextResponse.json({ error: "Order RPC failed" }, { status: 500 });
    }

    const orderResult = orderRows?.[0];

    if (orderResult?.order_id) {
        console.log("[Webhook] Order confirmed via webhook", { orderId: orderResult.order_id, rzpPaymentId });

        if (orderResult.user_email) {
            sendOrderConfirmedEmail(
                orderResult.user_email,
                orderResult.user_name || "Valued Customer",
                orderResult.order_id,
                orderResult.total_amount ?? 0
            ).catch((err) => console.error("[Webhook] Order email failed", err));
        }

        revalidatePath("/account");
        revalidatePath("/dashboard");
        revalidatePath("/admin/orders");

        return NextResponse.json({ received: true });
    }

    // ── Path 2: Rental payment ────────────────────────────────────────────────
    // No matching order — check if this is a rental payment
    const { data: rentalRows, error: rentalRpcErr } = await supabase.rpc(
        "fulfil_rental_by_order_id",
        { p_rzp_order_id: rzpOrderId, p_rzp_payment_id: rzpPaymentId }
    );

    if (rentalRpcErr) {
        console.error("[Webhook] fulfil_rental_by_order_id failed", rentalRpcErr);
        return NextResponse.json({ error: "Rental RPC failed" }, { status: 500 });
    }

    const rentalResult = rentalRows?.[0];

    if (rentalResult?.rental_id) {
        console.log("[Webhook] Rental fulfilled via webhook", { rentalId: rentalResult.rental_id, rzpPaymentId });

        if (rentalResult.user_email) {
            sendRentalConfirmedEmail(
                rentalResult.user_email,
                rentalResult.user_name || "Valued Customer",
                rentalResult.rental_id,
                "Mango Tree",
                rentalResult.amount_paid ?? 0,
                rentalResult.season ?? ""
            ).catch((err) => console.error("[Webhook] Rental email failed", err));
        }

        revalidatePath("/account");
        revalidateTag("trees", "max");
    } else {
        // Neither order nor rental — may have already been fulfilled by the client
        console.warn("[Webhook] No pending order or rental found for rzpOrderId", rzpOrderId);
    }

    return NextResponse.json({ received: true });
}
