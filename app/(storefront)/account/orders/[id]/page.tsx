import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderById } from "@/actions/order.actions";
import { OrderDetails } from "@/components/storefront/account/order-details";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Order } from "@/types/database.types";

export const metadata: Metadata = {
  title: "Track Order — TreeKart",
  description: "Track your fresh mango harvest delivery and view order history.",
  keywords: ["track order", "mango delivery status", "order history"],
  alternates: {
    canonical: "/account/orders",
  },
  openGraph: {
    title: "Track Order — TreeKart",
    description: "Track your fresh mango harvest delivery and view order history.",
    url: "https://www.treekart.in/account/orders",
    siteName: "TreeKart",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Track Order",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Track Order — TreeKart",
    description: "Track your fresh mango harvest delivery and view order history.",
    images: ["/og-image.png"],
  },
  robots: {
    index: false,
    follow: false,
  },
};

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  
  let order;
  try {
    order = await getOrderById(id);
  } catch (error) {
    return notFound();
  }

  if (!order) return notFound();

  return (
    <main className="section container min-h-screen">
      <div className="mb-12">
        <Link 
          href="/account" 
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          Back to Portal
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight">
              Order <span className="text-primary italic">Tracking</span>
            </h1>
            <div className="flex items-center gap-3">
              <div className="h-1 w-8 rounded-full bg-primary" />
              <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                Order ID: #{order.id.slice(0, 8).toUpperCase()} • Placed on {order.created_at ? new Date(order.created_at).toLocaleDateString() : "Date TBD"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <OrderDetails 
        order={order as Order} 
        rzpKey={process.env.RAZORPAY_KEY_ID} 
      />
    </main>
  );
}
