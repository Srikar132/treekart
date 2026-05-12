// app/(storefront)/page.tsx
import { HeroSection } from "@/components/storefront/home/hero";
import { FeaturedCategories } from "@/components/storefront/home/featured-categories";
import { AvailableTrees } from "@/components/storefront/home/available-trees";
import { RentedTrees } from "@/components/storefront/home/rented-trees";
import { HowItWorks } from "@/components/storefront/home/how-it-works";
import { WhyChooseUs } from "@/components/storefront/home/why-choose-us";
import { PricingSection } from "@/components/storefront/home/pricing";
import { Testimonials } from "@/components/storefront/home/testimonials";
import { PromoBanner } from "@/components/storefront/home/promo-banner";
import {
    getCachedHeroSlides,
    getCachedTestimonials,
    getCachedTreePlans,
    getCachedFeaturedAvailableTrees,
    getCachedFeaturedRentedTrees
} from "@/actions/public.actions";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://treekart.in"),

  title:
    "TreeKart — Rent a Mango Tree & Buy Fresh Alphonso Mangoes",

  description:
    "Experience the joy of owning a mango tree. Rent a real Alphonso mango tree, track its growth, and get fresh organic mangoes delivered to your doorstep.",

  keywords: [
    "TreeKart",
    "rent mango tree",
    "Alphonso mangoes",
    "organic mangoes",
    "mango tree rental",
    "fresh mango delivery",
    "buy mangoes online",
  ],

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title:
      "TreeKart — Rent a Mango Tree & Buy Fresh Alphonso Mangoes",

    description:
      "Rent a real Alphonso mango tree and enjoy fresh organic mangoes delivered to your doorstep.",

    url: "https://treekart.in",

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

    title:
      "TreeKart — Rent a Mango Tree & Buy Fresh Alphonso Mangoes",

    description:
      "Rent a real Alphonso mango tree and enjoy fresh organic mangoes delivered to your doorstep.",

    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

const Page = async () => {
    // Parallel fetch for maximum performance
    const [heroSlides, testimonials, availableData, rentedData, treePlans] = await Promise.all([
        getCachedHeroSlides(),
        getCachedTestimonials(),
        getCachedFeaturedAvailableTrees(),
        getCachedFeaturedRentedTrees(),
        getCachedTreePlans()
    ]);

    return (
        <main className="flex flex-col">
            <HeroSection slides={heroSlides} />
            <FeaturedCategories />
            <HowItWorks />
            <AvailableTrees initialTrees={availableData.trees || []} />
            <WhyChooseUs />
            <PricingSection treePlans={treePlans} />
            <Testimonials testimonials={testimonials} />
            <RentedTrees initialTrees={rentedData.trees || []} />
            <PromoBanner />
        </main>
    )
}

export default Page
