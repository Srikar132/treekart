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
import { getHeroSlides, getTestimonials } from "@/actions/admin.actions";
import { getAvailableTrees } from "@/actions/tree.actions";

const Page = async () => {
    // Parallel fetch for maximum performance
    const [heroSlides, testimonials, availableData, rentedData] = await Promise.all([
        getHeroSlides(),
        getTestimonials(),
        getAvailableTrees({ filters: { status: ["available"] }, limit: 8 }),
        getAvailableTrees({ filters: { status: ["rented"] }, limit: 8 })
    ]);

    return (
        <main className="flex flex-col">
            <HeroSection slides={heroSlides} />
            <FeaturedCategories />
            <HowItWorks />
            <AvailableTrees initialTrees={availableData.trees || []} />
            <WhyChooseUs />
            <PricingSection />
            <Testimonials testimonials={testimonials} />
            <RentedTrees initialTrees={rentedData.trees || []} />
            <PromoBanner />
        </main>
    )
}

export default Page
