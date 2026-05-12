import { Metadata } from "next";
import { ContactForm } from "@/components/storefront/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact Our Concierge — TreeKart",
  description: "Get in touch with our orchard concierge for questions about tree rentals, bulk orders, or farm visits. We're here to help you experience the joy of owning a mango tree.",
  keywords: ["contact TreeKart", "mango tree rental help", "bulk mango orders", "farm visit inquiry", "orchard concierge"],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Our Concierge — TreeKart",
    description: "Get in touch with our orchard concierge for questions about tree rentals, bulk orders, or farm visits.",
    url: "https://treekart.in/contact",
    siteName: "TreeKart",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Contact TreeKart",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Our Concierge — TreeKart",
    description: "Get in touch with our orchard concierge for questions about tree rentals, bulk orders, or farm visits.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactPage() {
  return (
    <main className="bg-white min-h-screen overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-40">
        <ContactForm />
      </div>

      {/* Location Map */}
      <section className="h-[60vh] bg-slate-100 relative overflow-hidden grayscale-[0.4] hover:grayscale-0 transition-all duration-[2s] border-t border-slate-200">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61053.49132549298!2d81.73715697669527!3d17.005391307613583!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a37a3f9050d5a15%3A0xc6443653199c00b0!2sRajahmundry%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1713560000000!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0"
        />
        <div className="absolute inset-0 pointer-events-none shadow-inner" />
      </section>
    </main>
  );
}
