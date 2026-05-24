import { SignupForm } from "@/components/storefront/auth/signup-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a free TreeKart account to rent mango trees and buy fresh Alphonso mangoes.",
  robots: { index: false, follow: false },
};


export default async function RegisterPage({
    searchParams,
}: {
    searchParams: Promise<{ redirectTo?: string }>;
}) {
    const { redirectTo = "/" } = await searchParams;
    return <SignupForm redirectTo={redirectTo} />;
}