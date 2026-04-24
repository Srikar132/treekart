import { Metadata } from "next";
import { ResetPasswordForm } from "@/components/storefront/auth/reset-password-form";

import { getSupabaseServer } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Set New Password — TreeKart",
  description: "Securely update your account password.",
};

export default async function ResetPasswordPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  return <ResetPasswordForm />;
}
