import { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/storefront/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset Password — TreeKart",
  description: "Request a password reset link to regain access to your account.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
