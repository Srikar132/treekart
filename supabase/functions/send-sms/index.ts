// Supabase Auth — Send SMS Hook
//
// Supabase generates and verifies the OTP; this function only DELIVERS it,
// via MSG91 (which is not a Supabase-native SMS provider).
//
// Contract (https://supabase.com/docs/guides/auth/auth-hooks/send-sms-hook):
//   Request : { user: { phone, ... }, sms: { otp: "123456" } } + webhook signature
//   Success : 200 {}
//   Failure : non-2xx { error: { http_code, message } }
//
// Deploy with --no-verify-jwt (or verify_jwt = false in config.toml): Supabase
// authenticates this call with a webhook signature, NOT a user JWT.
//
// This runs on Deno, not Node. It is excluded from the app's tsconfig; the
// reference below gives editors the Deno + edge-runtime globals.

/// <reference types="jsr:@supabase/functions-js/edge-runtime.d.ts" />

import { Webhook } from "standardwebhooks";

const MSG91_FLOW_URL = "https://control.msg91.com/api/v5/flow";

/** Never log a full phone number or an OTP. */
function maskPhone(phone: string): string {
    return phone.length > 4 ? `${phone.slice(0, 3)}****${phone.slice(-3)}` : "****";
}

function hookError(status: number, message: string): Response {
    return new Response(
        JSON.stringify({ error: { http_code: status, message } }),
        { status, headers: { "Content-Type": "application/json" } },
    );
}

Deno.serve(async (req) => {
    if (req.method !== "POST") return hookError(405, "Method not allowed");

    // ── 1. Authenticate the caller BEFORE doing anything that costs money ──────
    // An unsigned endpoint that sends SMS is an open invoice.
    const rawSecret = Deno.env.get("SEND_SMS_HOOK_SECRET");
    const authKey = Deno.env.get("MSG91_AUTH_KEY");
    const templateId = Deno.env.get("MSG91_TEMPLATE_ID");

    if (!rawSecret || !authKey || !templateId) {
        console.error("send-sms: missing required secrets");
        return hookError(500, "SMS service is not configured");
    }

    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);

    let user: { phone?: string };
    let sms: { otp?: string };
    try {
        // The dashboard stores the secret as "v1,whsec_<base64>"; the library wants
        // only the base64 portion.
        const wh = new Webhook(rawSecret.replace("v1,whsec_", ""));
        ({ user, sms } = wh.verify(payload, headers) as {
            user: { phone?: string };
            sms: { otp?: string };
        });
    } catch {
        // Do not echo the reason — it helps an attacker probe the signature scheme.
        return hookError(401, "Invalid signature");
    }

    if (!user?.phone || !sms?.otp) {
        return hookError(400, "Malformed hook payload");
    }

    // ── 2. Deliver via MSG91 ──────────────────────────────────────────────────
    // MSG91 expects the number without a leading '+': 91XXXXXXXXXX
    const mobiles = user.phone.replace(/^\+/, "");

    // NOTE: the recipient variable key below ("OTP") MUST match the variable name
    // in the DLT-registered template. If the template declares ##var1##, use "var1".
    const body = {
        template_id: templateId,
        short_url: "0",
        recipients: [{ mobiles, OTP: sms.otp }],
    };

    let res: Response;
    try {
        res = await fetch(MSG91_FLOW_URL, {
            method: "POST",
            headers: { authkey: authKey, "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
    } catch (err) {
        console.error("send-sms: MSG91 request failed", {
            phone: maskPhone(mobiles),
            err: String(err),
        });
        return hookError(502, "Could not reach the SMS provider");
    }

    // MSG91 can return HTTP 200 while reporting a logical failure in the body
    // (e.g. DLT template mismatch, insufficient balance). Both paths must fail.
    const text = await res.text();
    let parsed: { type?: string; message?: unknown } = {};
    try {
        parsed = JSON.parse(text);
    } catch {
        // non-JSON body — fall through to the status check below
    }

    const logicalFailure = parsed?.type === "error";
    if (!res.ok || logicalFailure) {
        // Log the provider's reason (never the OTP) so a template mismatch is debuggable.
        console.error("send-sms: MSG91 rejected the message", {
            phone: maskPhone(mobiles),
            status: res.status,
            providerMessage: parsed?.message ?? text.slice(0, 200),
        });
        return hookError(502, "Could not send the code. Please try again.");
    }

    return new Response(JSON.stringify({}), {
        headers: { "Content-Type": "application/json" },
    });
});
