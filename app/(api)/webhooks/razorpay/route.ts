import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseServer } from "@/lib/auth";
import { sendOrderConfirmedEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/webhooks/razorpay
//
// Razorpay calls this endpoint after every significant payment event.
// The primary job here is to handle the case where the user completed
// payment but their browser closed (or the tab crashed) before
// verifyAndFulfilOrder could run — which would leave the order stuck
// in "pending" forever.
//
// Razorpay webhook signature:
//   X-Razorpay-Signature = HMAC-SHA256(rawBody, RAZORPAY_WEBHOOK_SECRET)
//
// Setup in Razorpay Dashboard → Settings → Webhooks:
//   URL:    https://yourdomain.com/api/webhooks/razorpay
//   Events: payment.captured
//   Secret: set RAZORPAY_WEBHOOK_SECRET in your env to match
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    // 1. Read the raw body as text — MUST happen before any .json() call.
    //    Razorpay signs the exact bytes it sent, so we need the original string.
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") ?? "";

    // 2. Verify the webhook signature
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

    // 3. Parse the verified payload
    let event: any;
    try {
        event = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const eventType: string = event?.event;
    console.log("[Webhook] Received event:", eventType);

    // 4. Handle payment.captured — the only event we care about
    //    (payment.authorized fires BEFORE capture; payment.captured = money is ours)
    if (eventType !== "payment.captured") {
        // Acknowledge other events so Razorpay stops retrying them
        return NextResponse.json({ received: true });
    }

    const payment = event?.payload?.payment?.entity;
    if (!payment) {
        console.error("[Webhook] payment.captured event missing payment entity", event);
        return NextResponse.json({ error: "Missing payment entity" }, { status: 400 });
    }

    const rzpPaymentId: string = payment.id;           // pay_xxxxx
    const rzpOrderId: string = payment.order_id;      // order_xxxxx

    if (!rzpPaymentId || !rzpOrderId) {
        console.error("[Webhook] Missing payment ID or order ID", payment);
        return NextResponse.json({ error: "Missing IDs" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();

    // 5. Find the pending order.
    //    During the normal checkout flow, payment_id holds the Razorpay order ID
    //    (written by createMangoOrder / refreshRazorpayOrder).
    //    We look up by that value to find the right row.
    const { data: order, error: fetchError } = await supabase
        .from("orders")
        .select(`
      id,
      status,
      total_amount,
      profiles (
        email,
        full_name
      )
    `)
        .eq("payment_id", rzpOrderId)  // matches the Razorpay order ID stored at checkout
        .maybeSingle();                // maybeSingle: returns null instead of error if not found

    if (fetchError) {
        console.error("[Webhook] DB fetch error", { fetchError, rzpOrderId });
        // Return 500 so Razorpay retries — this might be a transient DB error
        return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    if (!order) {
        // Order not found by rzpOrderId — it may have already been confirmed by
        // verifyAndFulfilOrder (race condition where both ran). Log and acknowledge.
        console.warn("[Webhook] No order found for rzpOrderId", rzpOrderId);
        return NextResponse.json({ received: true });
    }

    // 6. Idempotency — if already confirmed, do nothing
    if (order.status === "confirmed") {
        console.log("[Webhook] Order already confirmed, skipping", order.id);
        return NextResponse.json({ received: true });
    }

    if (order.status !== "pending") {
        console.warn("[Webhook] Order in unexpected state", { orderId: order.id, status: order.status });
        return NextResponse.json({ received: true });
    }

    // 7. Confirm the order — overwrite payment_id with the real Razorpay payment ID
    const { error: updateError } = await supabase
        .from("orders")
        .update({
            status: "confirmed",
            payment_id: rzpPaymentId,  // real payment ID replaces the rzp order ID
        })
        .eq("id", order.id)
        .eq("status", "pending");    // extra guard: only update if still pending (prevents double-confirm)

    if (updateError) {
        console.error("[Webhook] Failed to update order", { updateError, orderId: order.id });
        // Return 500 so Razorpay retries
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }

    console.log("[Webhook] Order confirmed via webhook", { orderId: order.id, rzpPaymentId });

    // 8. Send confirmation email (non-fatal)
    const profile = order.profiles as any;
    if (profile?.email) {
        try {
            await sendOrderConfirmedEmail(
                profile.email,
                profile.full_name || "Valued Customer",
                order.id,
                order.total_amount
            );
        } catch (err) {
            console.error("[Webhook] Failed to send confirmation email", err);
        }
    }

    // 9. Revalidate relevant pages so the next load reflects the new status
    revalidatePath("/account");
    revalidatePath("/dashboard");
    revalidatePath("/admin/orders");

    return NextResponse.json({ received: true });
}