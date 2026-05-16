import { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getAppSettings } from "@/actions/admin.actions";
import StoreCheckoutClient from "./store-checkout-client";

export const metadata: Metadata = {
  title: "Checkout — TreeKart Store",
  description: "Finalize your order for fresh, organic Alphonso mangoes.",
  keywords: ["checkout", "buy mangoes", "TreeKart payment"],
  alternates: {
    canonical: "/checkout/store",
  },
  openGraph: {
    title: "Checkout — TreeKart Store",
    description: "Finalize your order for fresh, organic Alphonso mangoes.",
    url: "https://www.treekart.in/checkout/store",
    siteName: "TreeKart",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TreeKart Checkout",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Checkout — TreeKart Store",
    description: "Finalize your order for fresh, organic Alphonso mangoes.",
    images: ["/og-image.png"],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function StoreCheckoutPage() {
  const [user, settings] = await Promise.all([requireUser(), getAppSettings()]);

  return (
    <StoreCheckoutClient
      user={{
        full_name: user.full_name || "",
        phone: user.phone || "",
        email: user.email || "",
      }}
      storeDeliveryFee={settings.store_delivery_fee}
      storeFreeDeliveryThreshold={settings.store_free_delivery_threshold}
    />
  );
}