import { Metadata } from "next";
import { Shield, Lock, Eye, FileText, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — TreeKart",
  description: "Learn how we protect your data and maintain your privacy at TreeKart.",
};

export default function PrivacyPage() {
  const sections = [
    {
      title: "Information Collection",
      icon: Eye,
      content: "We collect information that you provide directly to us when you rent a tree, shop our products, or communicate with our concierge. This may include your name, email address, phone number, shipping address, and payment information."
    },
    {
      title: "Data Usage",
      icon: Lock,
      content: "The information we collect is used to process your orders, maintain your tree rental records, provide customer support, and send you updates about your harvest. We never sell your personal data to third parties."
    },
    {
      title: "Security Measures",
      icon: Shield,
      content: "We implement industry-standard security protocols to protect your information. Your payment data is encrypted and processed through secure, PCI-compliant payment gateways."
    },
    {
      title: "Cookies & Tracking",
      icon: FileText,
      content: "We use cookies to improve your browsing experience, remember your cart items, and analyze our website traffic. You can manage your cookie preferences through your browser settings."
    }
  ];

  return (
    <main className="bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-white border-b border-slate-200 pt-32 pb-20 md:pt-48 md:pb-32">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <span className="inline-block text-xs font-black uppercase tracking-[0.4em] text-primary bg-primary/5 px-4 py-1">
            Legal Transparency
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[0.9]">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Your trust is our most valuable asset. Here is how we safeguard your information and respect your digital footprint.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-16 shadow-sm space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {sections.map((section, index) => (
                <div key={index} className="space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary border border-slate-100">
                    <section.icon size={20} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{section.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-16 border-t border-slate-100 space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                   <Scale className="text-primary" size={24} />
                   Detailed Compliance
                </h2>
                <div className="prose prose-slate prose-sm max-w-none font-medium text-slate-600">
                  <p>
                    This Privacy Policy describes how TreeKart.in (the "Site" or "we") collects, uses, and discloses your Personal Information when you visit or make a purchase from the Site.
                  </p>
                  <p>
                    When you visit the Site, we collect certain information about your device, your interaction with the Site, and information necessary to process your purchases. We may also collect additional information if you contact us for customer support. In this Privacy Policy, we refer to any information that can uniquely identify an individual as "Personal Information".
                  </p>
                  <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mt-8 mb-4">Contacting Us</h4>
                  <p>
                    For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at <strong>info@treekart.in</strong> or by mail using the details provided in our contact section.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Last Updated: May 11, 2024
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
