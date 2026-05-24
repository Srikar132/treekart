import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Gavel, CheckCircle2, AlertCircle, ShoppingBag, Truck } from "lucide-react";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description:
    "Read TreeKart's terms and conditions covering tree rentals, mango orders, shipping, and customer rights.",
  path: "/terms",
  keywords: ["TreeKart terms of service", "rental agreement", "refund policy", "mango order terms"],
});

export default function TermsPage() {
  const points = [
    {
      title: "Tree Rentals",
      icon: CheckCircle2,
      content: "Rental of a tree grants you rights to the harvest of that specific tree for the duration of the agreement. While we guarantee professional maintenance, agricultural outcomes can vary based on nature."
    },
    {
      title: "Orders & Shipping",
      icon: Truck,
      content: "Fresh fruit orders are processed based on seasonal availability. Shipping times for mangoes are subject to peak ripening periods to ensure you receive the highest quality produce."
    },
    {
      title: "Payment Terms",
      icon: ShoppingBag,
      content: "All payments must be completed at the time of purchase or rental agreement initiation. We use secure third-party processors and do not store sensitive credit card data."
    },
    {
      title: "Liability",
      icon: AlertCircle,
      content: "TreeKart maintains the orchards to the highest standards. However, we are not liable for harvest variations caused by exceptional weather events or other acts of nature."
    }
  ];

  return (
    <main className="bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-white border-b border-slate-200 pt-32 pb-20 md:pt-48 md:pb-32">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <span className="inline-block text-xs font-black uppercase tracking-[0.4em] text-primary bg-primary/5 px-4 py-1">
            Operating Guidelines
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[0.9]">
            Terms of Service
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Our commitment to transparency and mutual respect. Please review these terms governing your use of the TreeKart platform.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-16 shadow-sm space-y-16">
            <div className="space-y-12">
              {points.map((point, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-6 md:gap-10">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary border border-slate-100 shrink-0">
                    <point.icon size={20} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{point.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                      {point.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-16 border-t border-slate-100 space-y-8">
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                   <Gavel className="text-primary" size={24} />
                   Agreement Overview
                </h2>
                <div className="prose prose-slate prose-sm max-w-none font-medium text-slate-600">
                  <p>
                    By accessing or using our Site, you agree to be bound by these terms of service and all terms incorporated by reference. If you do not agree to all of these terms, do not use our Site or services.
                  </p>
                  <p>
                    We reserve the right to change or modify these terms at any time and in our sole discretion. If we make changes to these terms, we will provide notice of such changes, such as by sending an email notification or providing notice through our services.
                  </p>
                  <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mt-8 mb-4">Governing Law</h4>
                  <p>
                    These terms and your use of the Site are governed by the laws of India. Any legal action or proceeding relating to your access to, or use of, the Site shall be instituted in the courts of Andhra Pradesh.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8 text-center border-t border-slate-50">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Effective Date: May 11, 2024
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
