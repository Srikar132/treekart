// Supabase Auth — Send SMS Hook
//
// Supabase generates and verifies the OTP; this function only DELIVERS it, via
// MSG91's SendOTP API. We pass Supabase's code as the custom `otp` parameter so
// MSG91 sends OUR code (not one it generates) — verification still happens in
// Supabase, so the two must be the same value.
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

import { Webhook } from "npm:standardwebhooks@1.0.0";

// MSG91 SendOTP endpoint. Must be control.msg91.com — the OTP API is served there;
// api.msg91.com returns "template invalid" because it can't resolve OTP templates.
// template_id / mobile / otp / <var> go as query params; auth key in the `authkey` header.
const MSG91_OTP_URL = "https://control.msg91.com/api/v5/otp";

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

    // ── 1. Authenticate the caller BEFORE anything that costs money ───────────
    // An unsigned endpoint that sends SMS is an open invoice.
    const rawSecret = Deno.env.get("SEND_SMS_HOOK_SECRET");
    const authKey = Deno.env.get("MSG91_AUTH_KEY");
    const templateId = Deno.env.get("MSG91_TEMPLATE_ID");
    // The template's OTP placeholder name (##var1##, ##number##, ##OTP##, …).
    // Kept as a secret so renaming the template variable needs no redeploy.
    const otpVar = Deno.env.get("MSG91_OTP_VAR") || "otp";

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

    // ── 2. Deliver via MSG91 SendOTP ──────────────────────────────────────────
    // MSG91 wants the number with country code and NO '+': 919876543210
    const mobile = user.phone.replace(/^\+/, "");

    // Everything goes in the QUERY string, NO body. When this endpoint receives a
    // JSON body it reads params from the body and ignores the query — which drops
    // template_id and fails with "Template ID Missing". The code is passed both as
    // `otp` (the SendOTP endpoint's own param) and under the template's variable
    // name (MSG91_OTP_VAR) so whichever the template uses is filled.
    const url = new URL(MSG91_OTP_URL);
    url.searchParams.set("template_id", templateId);
    url.searchParams.set("mobile", mobile);
    url.searchParams.set("otp", sms.otp);
    url.searchParams.set(otpVar, sms.otp);

    let res: Response;
    try {
        res = await fetch(url.toString(), {
            method: "POST",
            headers: { authkey: authKey, "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("send-sms: MSG91 request failed", {
            phone: maskPhone(mobile),
            err: String(err),
        });
        return hookError(502, "Could not reach the SMS provider");
    }

    // MSG91 can return HTTP 200 while reporting a logical failure in the body
    // (DLT template mismatch, insufficient balance). Both paths must fail.
    const text = await res.text();
    let parsed: { type?: string; message?: unknown } = {};
    try {
        parsed = JSON.parse(text);
    } catch {
        // non-JSON body — fall through to the status check below
    }

    const logicalFailure = parsed?.type === "error";
    if (!res.ok || logicalFailure) {
        // Log MSG91's reason (never the OTP) so a template/DLT mismatch is debuggable.
        console.error("send-sms: MSG91 rejected the message", {
            phone: maskPhone(mobile),
            status: res.status,
            providerMessage: parsed?.message ?? text.slice(0, 200),
        });
        return hookError(502, "Could not send the code. Please try again.");
    }

    return new Response(JSON.stringify({}), {
        headers: { "Content-Type": "application/json" },
    });
});
