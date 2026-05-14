import { Metadata } from "next";
import { ResetPasswordForm } from "@/components/storefront/auth/reset-password-form";

import { getSupabaseServer } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Set New Password — TreeKart",
  description: "Securely update your account password.",
  keywords: ["set password", "TreeKart security", "update password"],
  alternates: {
    canonical: "/auth/reset-password",
  },
  openGraph: {
    title: "Set New Password — TreeKart",
    description: "Securely update your account password.",
    url: "https://www.treekart.in/auth/reset-password",
    siteName: "TreeKart",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TreeKart Set Password",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Set New Password — TreeKart",
    description: "Securely update your account password.",
    images: ["/og-image.png"],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ResetPasswordPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  return <ResetPasswordForm />;
}
