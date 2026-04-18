"use client";

import { motion, type Variants } from "framer-motion";
import { PricingCard, type Package } from "@/components/storefront/cards/pricing-card";
import { AnimatedButton } from "@/components/shared/animated-button";

const packages: Package[] = [
    {
        title: "Base Tree",
        badge: "Base",
        status: "Out of stock",
        statusColor: "text-destructive",
        features: [
            { text: "10-20 dozen mangoes", isHighlight: false },
            { text: "30-50 kg approximate weight", isHighlight: false },
            { text: "30 kg minimum guaranteed", isHighlight: true, highlightColor: "bg-[#e8f5e9]" },
            { text: "Fresh delivery included", isHighlight: false },
            { text: "Video updates", isHighlight: false },
        ],
        buttonText: "Out of stock",
        disabled: true,
    },
    {
        title: "Standard Tree",
        badge: "Standard",
        badgeColor: "bg-blue-600",
        status: "Out of stock",
        statusColor: "text-destructive",
        features: [
            { text: "15-25 dozen mangoes", isHighlight: false },
            { text: "45-75 kg approximate weight", isHighlight: false },
            { text: "45 kg minimum guaranteed", isHighlight: true, highlightColor: "bg-[#e3f2fd]" },
            { text: "Fresh delivery included", isHighlight: false },
            { text: "Video updates", isHighlight: false },
        ],
        buttonText: "Out of stock",
        disabled: true,
    },
    {
        title: "Max Tree",
        badge: "Max",
        badgeColor: "bg-amber-500",
        status: "Out of stock",
        statusColor: "text-destructive",
        features: [
            { text: "20-30 dozen mangoes", isHighlight: false },
            { text: "60-90 kg approximate weight", isHighlight: false },
            { text: "60 kg minimum guaranteed", isHighlight: true, highlightColor: "bg-[#fff8e1]" },
            { text: "Fresh delivery included", isHighlight: false },
            { text: "Video updates", isHighlight: false },
        ],
        buttonText: "Out of stock",
        disabled: true,
    },
    {
        title: "Corporate Bundle",
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
    },
];

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

export function PricingSection() {
    return (
        <section className="section relative overflow-hidden">

            {/* Subtle decorative background blur */}
            {/* <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" /> */}

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

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
                >
                    {packages.map((pkg, index) => (
                        <motion.div
                            variants={cardVariants}
                            key={index}
                            className="h-full"
                        >
                            <PricingCard pkg={pkg} />
                        </motion.div>
                    ))}
                </motion.div>

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
