import { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getMyRentals } from "@/actions/user.actions";
import { getUserOrders } from "@/actions/order.actions";
import { DashboardOverview } from "@/components/storefront/account/dashboard-overview";

export const metadata: Metadata = {
  title: "My Account — TreeKart",
  description: "Manage your heritage tree rentals, track fresh mango orders, and update your orchard concierge preferences.",
  keywords: ["TreeKart account", "manage rentals", "track mango orders", "customer dashboard"],
  alternates: {
    canonical: "/account",
  },
  openGraph: {
    title: "My Account — TreeKart",
    description: "Manage your heritage tree rentals, track fresh mango orders, and update your orchard concierge preferences.",
    url: "https://www.treekart.in/account",
    siteName: "TreeKart",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TreeKart Account",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Account — TreeKart",
    description: "Manage your heritage tree rentals, track fresh mango orders, and update your orchard concierge preferences.",
    images: ["/og-image.png"],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountDashboardPage() {
  const user = await requireUser();
  const [rentals, orders] = await Promise.all([getMyRentals(), getUserOrders()]);

  return <DashboardOverview user={user} rentals={rentals} orders={orders} />;
}
