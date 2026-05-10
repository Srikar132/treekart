"use server";

import { getSupabaseServer } from "@/lib/auth";
import { signInSchema, signUpSchema, forgotPasswordSchema, resetPasswordSchema, type ActionState, type SignInFields, type SignUpFields, type ForgotPasswordFields, type ResetPasswordFields } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { authAj, signupAj } from "@/lib/arcjet";

type SignInState = ActionState<SignInFields>;
type SignUpState = ActionState<SignUpFields> & { success?: boolean };


const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export async function loginUser(
    _prev: SignInState,
    formData: FormData
): Promise<SignInState> {
    try {
        const decision = await authAj.protect({ headers: await headers() });
        if (decision.isDenied()) {
            return {
                errors: { _server: "Too many login attempts. Please try again later." },
                values: { email: formData.get("email") as string },
            };
        }

        const raw = {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
        };

        const parsed = signInSchema.safeParse(raw);
        if (!parsed.success) {
            return {
                errors: parsed.error.flatten().fieldErrors as SignInState["errors"],
                values: raw,
            };
        }

        const supabase = await getSupabaseServer();
        const { error } = await supabase.auth.signInWithPassword(parsed.data);

        if (error) {
            // ✅ Don't rely on error.message text
            if (
                error.code === "email_not_confirmed" || // common
                error.message?.toLowerCase().includes("not confirmed")
            ) {
                return {
                    errors: {
                        _server:
                            "Your email address is not verified. Please check your inbox or click below to resend the verification link.",
                    },
                    values: raw,
                    isUnverified: true,
                };
            }

            return {
                errors: {
                    _server:
                        error.message === "Invalid login credentials"
                            ? "Incorrect email or password. Please try again."
                            : error.message,
                },
                values: raw,
            };
        }

        revalidatePath("/", "layout");
        return { success: true };
    } catch (error: any) {
        console.error("Login Error:", error);
        return {
            errors: { _server: error.message || "An unexpected error occurred during login." },
            values: { email: formData.get("email") as string },
        };
    }
}

/**
 * Server Action: Sign Up
 */
export async function registerUser(
    _prev: SignUpState,
    formData: FormData
): Promise<SignUpState> {
    const decision = await signupAj.protect({ headers: await headers() });
    if (decision.isDenied()) {
        return {
            errors: { _server: "Too many signup attempts. Please try again later." },
            values: { email: formData.get("email") as string, fullName: formData.get("fullName") as string },
        };
    }

    const raw = {
        fullName: formData.get("fullName") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        password: formData.get("password") as string,
        confirmPassword: formData.get("confirmPassword") as string,
    };

    const parsed = signUpSchema.safeParse(raw);
    if (!parsed.success) {
        return {
            errors: parsed.error.flatten().fieldErrors as SignUpState["errors"],
            values: raw,
        };
    }

    const supabase = await getSupabaseServer();

    const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
            emailRedirectTo: `${baseUrl}/auth/callback`,
            data: {
                full_name: parsed.data.fullName,
                phone: parsed.data.phone,
                email: parsed.data.email,
            },
        },
    });

    if (error) {
        return {
            errors: { _server: error.message },
            values: raw,
        };
    }



    if (data.session) {
        // Auto-confirmed or already signed in
        revalidatePath("/", "layout");
        return { success: true, values: raw };
    } else {
        // Confirmation email sent
        return { success: true, values: raw };
    }
}
/**
 * Server Action: Forgot Password
 */
export async function requestPasswordReset(
    _prev: ActionState<ForgotPasswordFields>,
    formData: FormData
): Promise<ActionState<ForgotPasswordFields>> {
    const raw = {
        email: formData.get("email") as string,
    };

    const parsed = forgotPasswordSchema.safeParse(raw);
    if (!parsed.success) {
        return {
            errors: parsed.error.flatten().fieldErrors as any,
            values: raw,
        };
    }

    const supabase = await getSupabaseServer();

    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
        redirectTo: `${baseUrl}/auth/reset-password`,
    });

    if (error) {
        return {
            errors: { _server: error.message },
            values: raw,
        };
    }

    return { success: true, values: raw };
}


/**
 * Server Action: Reset Password
 */
export async function updatePassword(
    _prev: ActionState<ResetPasswordFields>,
    formData: FormData
): Promise<ActionState<ResetPasswordFields>> {
    const raw = {
        password: formData.get("password") as string,
        confirmPassword: formData.get("confirmPassword") as string,
    };

    const parsed = resetPasswordSchema.safeParse(raw);
    if (!parsed.success) {
        return {
            errors: parsed.error.flatten().fieldErrors as any,
            values: raw,
        };
    }

    const supabase = await getSupabaseServer();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return {
            errors: { _server: "Your reset session has expired or is invalid. Please request a new link." },
            values: raw,
        };
    }

    const { error } = await supabase.auth.updateUser({
        password: parsed.data.password,
    });

    if (error) {
        return {
            errors: { _server: error.message },
            values: raw,
        };
    }

    return { success: true };
}

/**
 * Server Action: Resend Verification Email
 */
export async function resendVerificationEmail(email: string) {
    if (!email) return { error: "Email is required" };

    const decision = await authAj.protect({ headers: await headers() });
    if (decision.isDenied()) {
        return { error: "Too many requests. Please try again later." };
    }

    const supabase = await getSupabaseServer();


    const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
            emailRedirectTo: `${baseUrl}/auth/callback`,
        },
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}
