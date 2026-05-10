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
