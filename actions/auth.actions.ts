"use server";

import { getSupabaseServer } from "@/lib/auth";
import { otpSchema } from "@/lib/validations";
import { toE164 } from "@/lib/phone";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { otpAj } from "@/lib/arcjet";

export type SendOtpState = {
    error?: string;
    success?: boolean;
    /** E.164, echoed back so the verify step can reuse it. */
    phone?: string;
};

export type VerifyOtpState = {
    error?: string;
    success?: boolean;
    /** New user with no full_name yet — caller opens the onboarding dialog. */
    needsProfile?: boolean;
    role?: "user" | "farmer" | "admin";
};

/**
 * Send an OTP.
 *
 * Sign-in and sign-up are one flow: `shouldCreateUser: true` provisions the
 * account on first use. The response is deliberately uniform whether or not the
 * number is registered — otherwise this endpoint enumerates our customers.
 */
export async function sendOtp(
    _prev: SendOtpState,
    formData: FormData
): Promise<SendOtpState> {
    try {
        const decision = await otpAj.protect({ headers: await headers() });
        if (decision.isDenied()) {
            return { error: "Too many requests. Please try again in a few minutes." };
        }

        // toE164 accepts either a raw 10-digit number (first send) or an already
        // normalized +91 number (resend passes the stored E.164), so both paths validate.
        const e164 = toE164((formData.get("phone") as string) ?? "");
        if (!e164) return { error: "Enter a valid 10-digit Indian mobile number." };

        const captchaToken = (formData.get("captchaToken") as string) || undefined;

        const supabase = await getSupabaseServer();
        const { error } = await supabase.auth.signInWithOtp({
            phone: e164,
            options: { channel: "sms", shouldCreateUser: true, captchaToken },
        });

        if (error) {
            // Never surface the provider error verbatim — it distinguishes
            // registered from unregistered numbers.
            console.error("sendOtp:", error.message);
            return { error: "Could not send the code. Please try again." };
        }

        return { success: true, phone: e164 };
    } catch (err) {
        console.error("sendOtp exception:", err);
        return { error: "An unexpected error occurred. Please try again." };
    }
}

/**
 * Verify an OTP and establish the session.
 *
 * Returns whether onboarding is still needed (no full_name) and the user's role,
 * so the caller can route without a second round-trip.
 */
export async function verifyOtp(
    _prev: VerifyOtpState,
    formData: FormData
): Promise<VerifyOtpState> {
    try {
        const e164 = toE164((formData.get("phone") as string) ?? "");
        if (!e164) {
            return { error: "Your session expired. Please request a new code." };
        }

        const parsed = otpSchema.safeParse({ otp: formData.get("otp") as string });
        if (!parsed.success) {
            return { error: parsed.error.flatten().fieldErrors.otp?.[0] ?? "Enter the 6-digit code." };
        }

        const supabase = await getSupabaseServer();
        const { data, error } = await supabase.auth.verifyOtp({
            phone: e164,
            token: parsed.data.otp,
            type: "sms",
        });

        if (error || !data.user) {
            return { error: "That code is incorrect or has expired. Please try again." };
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", data.user.id)
            .single();

        revalidatePath("/", "layout");
        return {
            success: true,
            // Completeness is full_name only — email is optional at this stage.
            needsProfile: !profile?.full_name,
            role: (profile?.role ?? "user") as VerifyOtpState["role"],
        };
    } catch (err) {
        console.error("verifyOtp exception:", err);
        return { error: "An unexpected error occurred. Please try again." };
    }
}

export async function logout() {
    const supabase = await getSupabaseServer();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
}
