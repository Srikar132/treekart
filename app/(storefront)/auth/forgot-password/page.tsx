import { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/storefront/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset Password — TreeKart",
  description: "Request a password reset link to regain access to your account.",
  keywords: ["reset password", "TreeKart account recovery", "forgot password"],
  alternates: {
    canonical: "/auth/forgot-password",
  },
  openGraph: {
    title: "Reset Password — TreeKart",
    description: "Request a password reset link to regain access to your account.",
    url: "https://treekart.in/auth/forgot-password",
    siteName: "TreeKart",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TreeKart Reset Password",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reset Password — TreeKart",
    description: "Request a password reset link to regain access to your account.",
    images: ["/og-image.png"],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
