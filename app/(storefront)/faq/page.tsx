import { Metadata } from "next";
import settings from "@/constants/settings";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQs — TreeKart",
  description: "Frequently asked questions about tree rentals, Alphonso mango harvesting, and climate-controlled shipping. Get all your queries answered.",
  keywords: ["mango tree rental FAQ", "Alphonso mango delivery questions", "organic farming questions", "tree adoption help", "TreeKart support"],
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "FAQs — TreeKart",
    description: "Frequently asked questions about tree rentals, Alphonso mango harvesting, and climate-controlled shipping.",
    url: "https://www.treekart.in/faq",
    siteName: "TreeKart",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TreeKart FAQs",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQs — TreeKart",
    description: "Frequently asked questions about tree rentals, Alphonso mango harvesting, and climate-controlled shipping.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const FAQ_DATA = [
  {
    category: "The Rental Process",
    questions: [
      {
        q: "How does the tree rental work?",
        a: "When you rent a tree, you are essentially leasing the yield of a specific, heritage Alphonso tree for one season. You receive 10-day visual updates, GPS coordinates, and the entire harvest (min yield guaranteed) delivered to your doorstep."
      },
      {
        q: "Can I visit my tree at the orchard?",
        a: "Absolutely. We encourage orchard visits during the peak harvest season (March–May). You can request a visit through your dashboard, and our farm concierge will coordinate the date and local logistics."
      },
      {
        q: "What happens if my tree produces less than expected?",
        a: "Nature is unpredictable, but your harvest shouldn't be. Every rental comes with a 'Yield Guarantee'. If your specific tree produces less than the minimum weight (e.g., 15kg for Basic Plan), we fulfill the difference from our partner reserve stock."
      }
    ]
  },
  {
    category: "Harvest & Delivery",
    questions: [
      {
        q: "When will I receive my mangoes?",
        a: "Alphonso mangoes are seasonal. Harvest typically begins in late March and continues through May. You will be notified 48 hours before your specific tree is harvested, and shipping follows immediately via climate-controlled logistics."
      },
      {
        q: "How are the mangoes shipped?",
        a: "We use specialized, ventilated packaging and express climate-controlled transit to ensure the fruit stays at optimal temperature. This prevents over-ripening and ensures you receive 'A-Grade' export quality fruit."
      },
      {
        q: "Do you ship internationally?",
        a: "Currently, we only ship within India (tier 1 and tier 2 cities) to ensure the freshness of the fruit. We are working on international logistics for the next season."
      }
    ]
  },
  {
    category: "Organic Practices",
    questions: [
      {
        q: "Is the fruit really organic?",
        a: "Yes. Our orchards follow strictly organic practices. We use only organic compost and natural pest control. No artificial ripening agents (like carbide) are used; the fruit ripens naturally in the box or on the tree."
      },
      {
        q: "How do I track the updates?",
        a: "Once your rental is confirmed, you gain access to a private dashboard. Every 10 days, our farm team uploads high-resolution photos and a status report on your tree's health and flowering progress."
      }
    ]
  }
];

export default function FAQPage() {
  return (
    <main className="bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": FAQ_DATA.flatMap(section => 
              section.questions.map(faq => ({
                "@type": "Question",
                "name": faq.q,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.a
                }
              }))
            )
          })
        }}
      />
      <div className="max-w-4xl mx-auto px-6 py-20 md:py-32 space-y-24">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
              Information
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-foreground uppercase tracking-tighter leading-none">
              Questions &<br />Answers
            </h1>
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium max-w-md mx-auto">
            Everything you need to know about the journey from blossom to box.
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-24">
          {FAQ_DATA.map((section) => (
            <div key={section.category} className="space-y-10">
              <div className="flex items-center gap-6">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-foreground shrink-0">
                  {section.category}
                </h2>
                <div className="h-px w-full bg-border/40" />
              </div>

              <Accordion className="w-full">
                {section.questions.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`${section.category}-${index}`}
                    className="border-b border-border/40 py-2 last:border-0"
                  >
                    <AccordionTrigger className="text-lg md:text-xl font-bold uppercase tracking-tight text-left hover:text-primary hover:no-underline transition-colors py-6">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-8 text-base font-medium">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="bg-secondary/10 p-12 text-center space-y-8 border border-border/40">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Still have questions?</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-widest leading-relaxed">
              Our orchard concierge is available to assist you personally.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`mailto:${settings.EMAIL}`}>
              <button className="h-14 px-10 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all w-full sm:w-auto">
                Email Us
              </button>
            </Link>
            <Link 
              href={`https://wa.me/${settings.PHONE.split("/")[0].replace(/\D/g, "")}`} 
              target="_blank"
            >
              <button className="h-14 px-10 border border-primary text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary/5 transition-all w-full sm:w-auto">
                WhatsApp Support
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
