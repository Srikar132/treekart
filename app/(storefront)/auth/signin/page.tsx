import { SigninForm } from "@/components/storefront/auth/signin-form";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ redirectTo?: string }>;
}) {
    try {
        const { redirectTo = "/" } = await searchParams;
        
        // If user is already logged in, send them away
        const user = await getUser();
        if (user) {
            redirect(redirectTo);
        }

        return <SigninForm redirectTo={redirectTo} />;
    } catch (error) {
        // Allow Next.js internal errors (redirects, dynamic signals) to bubble up
        if (
            (error instanceof Error && error.message.includes("NEXT_REDIRECT")) ||
            (error as any)?.digest === "DYNAMIC_SERVER_USAGE"
        ) {
            throw error;
        }
        console.error("Error in LoginPage:", error);
        throw error;
    }
}