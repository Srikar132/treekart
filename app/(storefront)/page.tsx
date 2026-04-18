import { HeroSection } from "@/components/storefront/home/hero";
import { FeaturedCategories } from "@/components/storefront/home/featured-categories";
import { TrendingProducts } from "@/components/storefront/home/trending-products";
import { HowItWorks } from "@/components/storefront/home/how-it-works";
import { WhyChooseUs } from "@/components/storefront/home/why-choose-us";
import { PricingSection } from "@/components/storefront/home/pricing";
import { Testimonials } from "@/components/storefront/home/testimonials";
import { PromoBanner } from "@/components/storefront/home/promo-banner";

const Page = () => {
    return (
        <main className="flex flex-col">
            <HeroSection />
            <FeaturedCategories />
            <HowItWorks />
            <TrendingProducts />
            <WhyChooseUs />
            <PricingSection />
            <Testimonials />
            <PromoBanner />
        </main>
    )
}

export default Page