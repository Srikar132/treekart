import { safeRedirect } from "@/lib/safe-redirect";
import { redirect } from "next/navigation";

// Sign-up and sign-in are one passwordless phone + OTP flow.
// This route only exists so old links keep working.
export default async function RegisterPage({
    searchParams,
}: {
    searchParams: Promise<{ redirectTo?: string }>;
}) {
    const params = await searchParams;
    const redirectTo = safeRedirect(params.redirectTo);
    redirect(`/auth/signin?redirectTo=${encodeURIComponent(redirectTo)}`);
}
