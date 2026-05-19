import type { Metadata } from "next";
import { AppSidebar } from "@/components/storefront/app-sidebar";
import { CartSidebar } from "@/components/storefront/cart-sidebar";
import { Footer } from "@/components/storefront/footer";
import { Navbar } from "@/components/storefront/navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getAppSettings } from "@/actions/admin.actions";

export const metadata: Metadata = {
  title: {
    default: "TreeKart — Rent a Mango Tree & Buy Fresh Alphonso Mangoes",
    template: "%s | TreeKart",
  },
  description: "Experience the joy of owning a mango tree. Rent a real Alphonso mango tree, track its growth, and get fresh organic mangoes delivered to your doorstep.",
  keywords: [
    "TreeKart",
    "rent mango tree",
    "Alphonso mangoes",
    "organic mangoes",
    "mango tree rental",
    "fresh mango delivery",
    "buy mangoes online",
  ],
  authors: [{ name: "TreeKart Team" }],
  creator: "TreeKart",
  publisher: "TreeKart",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TreeKart — Rent a Mango Tree & Buy Fresh Alphonso Mangoes",
    description: "Rent a real Alphonso mango tree and enjoy fresh organic mangoes delivered to your doorstep.",
    url: "https://www.treekart.in",
    siteName: "TreeKart",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TreeKart",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TreeKart — Rent a Mango Tree & Buy Fresh Alphonso Mangoes",
    description: "Rent a real Alphonso mango tree and enjoy fresh organic mangoes delivered to your doorstep.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function StorefrontLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const settings = await getAppSettings();

    return (
        <SidebarProvider defaultOpen={false}>
            <div className="flex min-h-screen w-full">
                <AppSidebar />
                <div className="flex-1 flex flex-col overflow-x-hidden max-w-full">
                    <Navbar />
                    <main className="flex-1">
                        {children}
                    </main>
                    <Footer />
                </div>
            </div>
            <CartSidebar
                storeDeliveryFee={settings.store_delivery_fee}
                storeFreeDeliveryThreshold={settings.store_free_delivery_threshold}
            />
        </SidebarProvider>
    );
}