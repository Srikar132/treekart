import { PhoneOtpForm } from "@/components/storefront/auth/phone-otp-form";
import { getUser } from "@/lib/auth";
import { safeRedirect } from "@/lib/safe-redirect";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In",
    description: "Sign in to TreeKart with your mobile number.",
    robots: { index: false, follow: false },
};

/**
 * This route serves two states, which is what gives the proxy's onboarding gate
 * a concrete URL to redirect to:
 *   - signed out            → phone + OTP form
 *   - signed in, no name    → profile dialog opens immediately
 *   - signed in, onboarded  → bounced away (handled by the proxy)
 */
export default async function SigninPage({
    searchParams,
}: {
    searchParams: Promise<{ redirectTo?: string }>;
}) {
    const params = await searchParams;
    // Never trust redirectTo from the query string.
    const redirectTo = safeRedirect(params.redirectTo);

    const user = await getUser();

    if (user?.full_name) redirect(redirectTo);

    return (
        <PhoneOtpForm
            redirectTo={redirectTo}
            startWithProfileDialog={!!user && !user.full_name}
        />
    );
}
