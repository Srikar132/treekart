import { HeroSection } from "@/components/storefront/home/hero";
import { FeaturedCategories } from "@/components/storefront/home/featured-categories";
import { AvailableTrees } from "@/components/storefront/home/available-trees";
import { RentedTrees } from "@/components/storefront/home/rented-trees";
import { HowItWorks } from "@/components/storefront/home/how-it-works";
import { WhyChooseUs } from "@/components/storefront/home/why-choose-us";
import { PricingSection } from "@/components/storefront/home/pricing";
import { Testimonials } from "@/components/storefront/home/testimonials";
import { PromoBanner } from "@/components/storefront/home/promo-banner";

const Page = async () => {
    return (
        <main className="flex flex-col">
            <HeroSection />
            <FeaturedCategories />
            <AvailableTrees />
            <HowItWorks />
            <WhyChooseUs />
            <RentedTrees />
            <PricingSection />
            <Testimonials />
            <PromoBanner />
        </main>
    )
}

export default Page
