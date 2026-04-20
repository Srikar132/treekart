import { SignupForm } from "@/components/storefront/auth/signup-form";


export default async function RegisterPage({
    searchParams,
}: {
    searchParams: Promise<{ redirectTo?: string }>;
}) {
    const { redirectTo = "/" } = await searchParams;
    return <SignupForm redirectTo={redirectTo} />;
}