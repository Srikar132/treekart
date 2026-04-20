import { SigninForm } from "@/components/storefront/auth/signin-form";


export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ redirectTo?: string }>;
}) {
    const { redirectTo = "/" } = await searchParams;
    return <SigninForm redirectTo={redirectTo} />;
}