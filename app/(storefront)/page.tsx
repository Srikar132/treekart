import type { Metadata } from "next";
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

export const metadata: Metadata = {
    title: "Buy Fresh Alphonso Mangoes Online — TreeKart",
    description:
        "Buy fresh Alphonso mangoes online in India. Order organic, naturally ripened Ratnagiri mangoes delivered to your doorstep. Rent your own mango tree and get mangoes every season.",
    keywords: [
        "buy mangoes online",
        "buy Alphonso mangoes online India",
        "fresh mango delivery India",
        "order mangoes online",
        "Ratnagiri Alphonso mangoes",
        "organic mangoes online",
        "mango delivery India",
        "natural ripened mangoes",
        "rent mango tree India",
        "mango tree rental",
        "fresh Alphonso mangoes",
        "buy organic mangoes",
    ],
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "Buy Fresh Alphonso Mangoes Online — TreeKart",
        description:
            "Buy fresh Alphonso mangoes online in India. Order organic, naturally ripened Ratnagiri mangoes delivered to your doorstep.",
        url: "https://www.treekart.in",
        siteName: "TreeKart",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "TreeKart — Fresh Alphonso Mangoes Online",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Buy Fresh Alphonso Mangoes Online — TreeKart",
        description:
            "Order organic Alphonso mangoes from real orchards. Delivered fresh across India.",
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
