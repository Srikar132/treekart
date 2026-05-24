import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import {
  Shield, Lock, Eye, FileText, CreditCard,
  Share2, Cookie, UserCheck, ExternalLink, Baby,
  RefreshCw, TreePine, MessageCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnimatedButton } from "@/components/shared/animated-button";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "Learn how TreeKart collects, uses, and protects your personal information when you shop for mangoes or rent a tree.",
  path: "/privacy",
  keywords: ["TreeKart privacy policy", "data protection", "personal information", "cookie policy"],
});

const sections = [
  {
    id: "1",
    title: "Information We Collect",
    icon: Eye,
    items: [
      "Full Name & Phone Number",
      "Email Address & Delivery Address",
      "Payment Information",
      "WhatsApp Contact Details",
      "Order and Booking Details",
      "Farm Visit Requests",
      "Device, Browser & Website Usage Data",
    ],
  },
  {
    id: "2",
    title: "How We Use Your Information",
    icon: FileText,
    items: [
      "Process mango orders and tree leasing bookings",
      "Deliver mangoes and farm products",
      "Send order confirmations and updates",
      "Share tree growth photos and videos",
      "Provide customer support",
      "Send promotional offers and seasonal updates",
      "Maintain website security and prevent fraud",
    ],
  },
  {
    id: "3",
    title: "Mango Tree Tracking & Updates",
    icon: TreePine,
    body: "Customers who lease trees may receive tree growth updates, harvest notifications, farm photos and videos, and GPS tracking information related to leased trees. These updates are provided solely for customer experience purposes.",
  },
  {
    id: "4",
    title: "Payment Security",
    icon: CreditCard,
    body: "We do not directly store sensitive payment details such as debit/credit card numbers, CVV information, or banking passwords. All payments are processed securely through trusted third-party payment providers.",
  },
  {
    id: "5",
    title: "Sharing of Information",
    icon: Share2,
    body: "We do not sell or rent customer information. We may share limited information with delivery partners, payment gateways, customer support providers, and legal authorities if required by law.",
  },
  {
    id: "6",
    title: "Cookies & Analytics",
    icon: Cookie,
    body: "Our website uses cookies and analytics tools to improve website performance, understand visitor behavior, remember customer preferences, and enhance user experience. Users can disable cookies through browser settings.",
  },
  {
    id: "7",
    title: "Data Protection",
    icon: Shield,
    body: "We take reasonable security measures to protect customer information from unauthorized access, misuse, loss, and data leaks. However, no online platform can guarantee 100% security.",
  },
  {
    id: "8",
    title: "Customer Rights",
    icon: UserCheck,
    items: [
      "Request access to your personal data",
      "Ask for correction of your information",
      "Request deletion of your personal data",
      "Opt out of promotional communications",
    ],
  },
  {
    id: "9",
    title: "Third-Party Links",
    icon: ExternalLink,
    body: "Our website may contain links to external websites or social media platforms. We are not responsible for the privacy practices of any third-party websites.",
  },
  {
    id: "10",
    title: "Children's Privacy",
    icon: Baby,
    body: "Our services are not intended for children under 13 years of age. We do not knowingly collect personal data from children.",
  },
  {
    id: "11",
    title: "Changes to This Policy",
    icon: RefreshCw,
    body: "TreeKart may update this Privacy Policy at any time. Updated versions will be posted on this page with the revised date. We encourage you to review this page periodically.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="bg-slate-50 min-h-screen">

      {/* Header */}
      <section className="bg-white border-b border-slate-200 pt-32 pb-16 md:pt-48 md:pb-24">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-5">
          <Badge className="bg-primary/10 text-primary border-0 text-[10px] font-black uppercase tracking-[0.35em] px-4 py-1.5 rounded-full">
            Legal Transparency
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[0.9]">
            Privacy Policy
          </h1>
          <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Your trust is our most valuable asset. Here is how we safeguard your information and respect your privacy.
          </p>
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
            Last Updated: May 21, 2026
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-10 md:py-14">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-primary/5 border border-primary/15 rounded-2xl px-6 py-5 flex gap-4 items-start">
            <Lock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Welcome to TreeKart. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website and services. By using our platform, you agree to the practices described below.
            </p>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="pb-20 md:pb-32">
        <div className="max-w-5xl mx-auto px-6 space-y-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-primary/8 flex items-center justify-center text-primary border border-primary/10">
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">
                        {section.id.padStart(2, "0")}
                      </span>
                      <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight">
                        {section.title}
                      </h2>
                    </div>

                    {section.body && (
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        {section.body}
                      </p>
                    )}

                    {section.items && (
                      <ul className="space-y-2 mt-1">
                        {section.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-500 font-medium">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/50 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}

                  </div>
                </div>
              </div>
            );
          })}
          {/* Contact CTA */}
          <div className="bg-primary rounded-2xl p-8 md:p-14 flex flex-col items-center text-center gap-6 shadow-lg shadow-primary/20">
            <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                Have Privacy Questions?
              </h2>
              <p className="font-medium text-sm max-w-md mx-auto leading-relaxed text-white/80">
                If you have any questions about this policy, want to access your data, or need to make a request — our team is ready to help.
              </p>
            </div>
            <AnimatedButton
              href="/contact"
              label="Get in Touch"
              className="border-white text-white max-w-xs"
              fillClassName="bg-white"
              hoverTextClassName="hover:text-primary"
            />
          </div>
        </div>
      </section>

    </main>
  );
}
