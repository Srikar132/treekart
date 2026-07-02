import { Metadata } from "next";
import {
  FileCheck, ShoppingBag, TreePine, CreditCard, Truck,
  Home, RefreshCw, Sprout, Copyright, UserCheck,
  ShieldAlert, Share2, History, Scale, Mail, Phone, MapPin,
} from "lucide-react";
import settings from "@/constants/settings";

export const metadata: Metadata = {
  title: "Terms & Conditions — TreeKart",
  description: "Read our terms and conditions for tree leasing, product purchases, delivery, and farm experiences.",
};

type SubSection = {
  title: string;
  body?: string;
  items?: string[];
  footnote?: string;
};

type Section = {
  id: string;
  title: string;
  icon: typeof FileCheck;
  body?: string;
  items?: string[];
  footnote?: string;
  subSections?: SubSection[];
};

const sections: Section[] = [
  {
    id: "1",
    title: "Acceptance of Terms",
    icon: FileCheck,
    body: "By using our website or purchasing any product or service from TreeKart, you agree to these Terms & Conditions and our Privacy Policy. If you do not agree with any part of these terms, please do not use our services.",
  },
  {
    id: "2",
    title: "Services Offered",
    icon: ShoppingBag,
    body: "TreeKart provides the following services, all subject to availability:",
    items: [
      "Mango tree leasing services",
      "Fresh mango sales",
      "Farm product sales",
      "Farm stay experiences",
      "Delivery services",
      "Tree tracking and updates",
      "Seasonal subscription packages",
    ],
  },
  {
    id: "3",
    title: "Mango Tree Leasing",
    icon: TreePine,
    subSections: [
      {
        title: "3.1 Tree Ownership",
        body: "Leasing a tree does not transfer legal ownership of farmland or trees to customers. Customers receive seasonal harvesting rights based on the selected package.",
      },
      {
        title: "3.2 Natural Farming Conditions",
        body: "Mango production depends on:",
        items: [
          "Weather conditions",
          "Seasonal changes",
          "Natural farming factors",
          "Pest and environmental conditions",
        ],
        footnote: "Actual yield may slightly vary from estimated quantities.",
      },
      {
        title: "3.3 Guaranteed Quantity",
        body: "TreeKart will provide the minimum guaranteed quantity mentioned in the selected package whenever applicable.",
      },
    ],
  },
  {
    id: "4",
    title: "Orders & Payments",
    icon: CreditCard,
    items: [
      "All prices are listed in Indian Rupees (INR).",
      "Orders are confirmed only after successful payment.",
      "TreeKart reserves the right to cancel or refuse orders if payment issues occur.",
      "Prices and package details may change without prior notice.",
    ],
  },
  {
    id: "5",
    title: "Delivery Policy",
    icon: Truck,
    items: [
      "Deliveries are available only in selected service areas.",
      "Delivery timelines may vary depending on harvest schedules and logistics.",
      "Customers must provide accurate delivery details.",
      "TreeKart is not responsible for delays caused by weather conditions, transport disruptions, incorrect customer information, or events beyond our control.",
    ],
  },
  {
    id: "6",
    title: "Farm Visits & Farm Stay",
    icon: Home,
    body: "Customers visiting farms must:",
    items: [
      "Follow farm safety guidelines",
      "Respect farm property and workers",
      "Avoid damaging trees or equipment",
      "Supervise children during visits",
    ],
    footnote: "TreeKart reserves the right to deny entry for unsafe or inappropriate behavior.",
  },
  {
    id: "7",
    title: "Refund & Cancellation Policy",
    icon: RefreshCw,
    subSections: [
      {
        title: "Tree Leasing",
        items: [
          "Once flowering or harvesting begins, leasing payments may become non-refundable.",
          "Refund eligibility depends on the package and cancellation timing.",
        ],
      },
      {
        title: "Product Orders",
        items: [
          "Damaged or spoiled deliveries must be reported within 24 hours of delivery with photo proof.",
          "Approved refund or replacement requests will be processed within a reasonable period.",
        ],
      },
    ],
  },
  {
    id: "8",
    title: "Organic Farming Disclaimer",
    icon: Sprout,
    body: "TreeKart follows natural and organic farming practices. However:",
    items: [
      "Shape, size, and appearance of mangoes may naturally vary.",
      "Natural farming may produce seasonal differences in taste and yield.",
    ],
  },
  {
    id: "9",
    title: "Intellectual Property",
    icon: Copyright,
    body: "All website content — including logos, images, videos, designs, text, and branding — belongs to TreeKart and may not be copied, reused, or distributed without written permission.",
  },
  {
    id: "10",
    title: "User Responsibilities",
    icon: UserCheck,
    body: "Users must not:",
    items: [
      "Use the website for illegal activities",
      "Attempt to hack or damage the website",
      "Misuse TreeKart branding or content",
      "Submit false information",
    ],
  },
  {
    id: "11",
    title: "Limitation of Liability",
    icon: ShieldAlert,
    body: "TreeKart shall not be held responsible for:",
    items: [
      "Natural crop variations",
      "Delivery delays beyond control",
      "Temporary website downtime",
      "Indirect or incidental losses",
    ],
    footnote: "Our maximum liability shall not exceed the amount paid by the customer for the relevant service.",
  },
  {
    id: "12",
    title: "Third-Party Services",
    icon: Share2,
    body: "Our website may use third-party services such as:",
    items: [
      "Payment gateways",
      "Delivery providers",
      "Analytics tools",
      "Social media integrations",
    ],
    footnote: "TreeKart is not responsible for third-party service interruptions or policies.",
  },
  {
    id: "13",
    title: "Changes to Terms",
    icon: History,
    body: "TreeKart may update these Terms & Conditions at any time. Updated versions will be published on this page with the revised date. Continued use of the website means acceptance of updated terms.",
  },
  {
    id: "14",
    title: "Governing Law",
    icon: Scale,
    body: "These Terms & Conditions shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Andhra Pradesh, India.",
  },
];

function ItemList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mt-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-500 font-medium">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/50 flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function TermsPage() {
  return (
    <main className="bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-white border-b border-slate-200 pt-32 pb-16 md:pt-48 md:pb-24">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-5">
          <span className="inline-block text-[10px] font-black uppercase tracking-[0.35em] text-primary bg-primary/5 px-4 py-1.5 rounded-full">
            Operating Guidelines
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[0.9]">
            Terms & Conditions
          </h1>
          <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            By accessing or using our website, services, products, tree leasing programs, and farm experiences, you agree to comply with the following Terms & Conditions.
          </p>
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
            Last Updated: May 21, 2026
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="py-14 md:py-20">
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

                    {section.items && <ItemList items={section.items} />}

                    {section.footnote && (
                      <p className="text-sm text-slate-500 font-medium leading-relaxed mt-3">
                        {section.footnote}
                      </p>
                    )}

                    {section.subSections && (
                      <div className="space-y-6 mt-4">
                        {section.subSections.map((sub, i) => (
                          <div key={i} className="space-y-2">
                            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">
                              {sub.title}
                            </h3>
                            {sub.body && (
                              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                {sub.body}
                              </p>
                            )}
                            {sub.items && <ItemList items={sub.items} />}
                            {sub.footnote && (
                              <p className="text-sm text-slate-500 font-medium leading-relaxed mt-2">
                                {sub.footnote}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* 15. Contact Information */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-primary/8 flex items-center justify-center text-primary border border-primary/10">
                <Mail size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">15</span>
                  <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight">
                    Contact Information
                  </h2>
                </div>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-4">
                  For any questions regarding these Terms & Conditions, reach us at:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                    <Mail size={16} className="text-primary flex-shrink-0" />
                    <a href={`mailto:${settings.EMAIL}`} className="hover:text-primary transition-colors">
                      {settings.EMAIL}
                    </a>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                    <Phone size={16} className="text-primary flex-shrink-0" />
                    <span>{settings.PHONE}</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                    <MapPin size={16} className="text-primary flex-shrink-0" />
                    <span>{settings.ADDRESS}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
