"use client";

import { motion, type Variants } from "framer-motion";
import { PricingCard, type Package } from "@/components/storefront/cards/pricing-card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
} from "@/components/ui/carousel";
import { type TreePlan } from "@/types/database.types";

interface PricingSectionProps {
    treePlans?: TreePlan[];
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
        },
    },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
};

export function PricingSection({ treePlans = [] }: PricingSectionProps) {
    return (
        <section id="plans" className="section relative overflow-hidden">
            <div className="container relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="section-header"
                >
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Leasing Packages</h2>
                </motion.div>

                <Carousel
                    opts={{
                        align: "start",
                        loop: false,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-6">
                        {treePlans.map((plan, index) => {
                            const parsedFeatures = (Array.isArray(plan.features) ? plan.features : []) as { text: string; isHighlight?: boolean; highlightColor?: string }[];
                            const pkg: Package = {
                                title: plan.name,
                                id: plan.id,
                                badge: plan.badge_text || plan.name,
                                badgeColor: plan.badge_color || undefined,
                                status: plan.is_active ? "Available" : "Out of stock",
                                statusColor: plan.is_active ? "text-primary" : "text-destructive",
                                features: parsedFeatures.map(f => ({
                                    text: f.text || "",
                                    isHighlight: f.isHighlight || false,
                                    highlightColor: f.highlightColor || undefined
                                })),
                                buttonText: plan.is_active ? "Rent Now" : "Out of stock",
                                disabled: !plan.is_active,
                            };

                            return (
                                <CarouselItem key={index} className="pl-6 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                    <motion.div
                                        variants={cardVariants}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true }}
                                        className="h-full"
                                    >
                                        <PricingCard pkg={pkg} />
                                    </motion.div>
                                </CarouselItem>
                            );
                        })}

                        {/* Explicitly placed Corporate Bundle */}
                        <CarouselItem className="pl-6 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                            <motion.div
                                variants={cardVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="h-full"
                            >
                                <PricingCard pkg={{
                                    title: "Corporate Bundle",
                                    id: "",
                                    isCustom: true,
                                    pricingText: "Custom",
                                    pricingSub: "pricing",
                                    features: [
                                        { text: "Minimum 10+ trees", isHighlight: false },
                                        { text: "Bulk pricing available", isHighlight: false },
                                        { text: "Flexible terms", isHighlight: false },
                                        { text: "Dedicated support", isHighlight: false },
                                        { text: "Custom delivery options", isHighlight: false },
                                    ],
                                    buttonText: "Contact Us",
                                    disabled: false,
                                }} />
                            </motion.div>
                        </CarouselItem>
                    </CarouselContent>
                    <div className="flex justify-end gap-4 mt-8">
                        <CarouselPrevious className="static translate-y-0" />
                        <CarouselNext className="static translate-y-0" />
                    </div>
                </Carousel>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="mt-14 text-center"
                >
                    <p className="text-sm font-medium text-muted-foreground/70">
                        All package details, prices, and inclusions are subject to change before purchase.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
