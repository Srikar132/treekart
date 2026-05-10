"use client";

import { motion, type Variants } from "framer-motion";
import { TreeDeciduous, Users, ShieldCheck, ShoppingBasket, MapPin, Home } from "lucide-react";
import Image from "next/image";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
};

const leftFeatures = [
    {
        title: "Direct Tree Leasing",
        description: "Experience the joy of owning a real Alphonso tree. We handle the labor; you enjoy the 100% organic harvest.",
        icon: <TreeDeciduous className="w-10 h-10 md:w-12 md:h-12 text-primary" strokeWidth={1.5} />,
    },
    {
        title: "Curated Mango Store",
        description: "Explore a boutique selection of premium mangoes and artisanal farm products, harvested at peak ripeness.",
        icon: <ShoppingBasket className="w-10 h-10 md:w-12 md:h-12 text-primary" strokeWidth={1.5} />,
    },
    {
        title: "Immersive Farm Stays",
        description: "Escape to the orchard. Book luxury farm rooms and witness the journey of your fruit from soil to basket.",
        icon: <Home className="w-10 h-10 md:w-12 md:h-12 text-primary" strokeWidth={1.5} />,
    },
];

const rightFeatures = [
    {
        title: "Certified Organic Care",
        description: "Nurtured in a chemical-free ecosystem where nature does the heavy lifting for unmatched flavor.",
        icon: <ShieldCheck className="w-10 h-10 md:w-12 md:h-12 text-primary" strokeWidth={1.5} />,
    },
    {
        title: "Precision Tracking",
        description: "Transparency at your fingertips. Monitor your tree's health and exact GPS location through our portal.",
        icon: <MapPin className="w-10 h-10 md:w-12 md:h-12 text-primary" strokeWidth={1.5} />,
    },
    {
        title: "Generational Expertise",
        description: "Our community of expert farmers brings ancestral knowledge to ensure every tree reaches its thriving potential.",
        icon: <Users className="w-10 h-10 md:w-12 md:h-12 text-primary" strokeWidth={1.5} />,
    },
];

export function WhyChooseUs() {
    return (
        <section className="section overflow-hidden">
            <div className="container">

                {/* Section Header */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={containerVariants}
                    className="section-header"
                >
                    <motion.h2 variants={itemVariants} className="mb-6">
                        Why Choose Us
                    </motion.h2>
                    <motion.p variants={itemVariants} className="p-base">
                        The fact of the matter is that you really know something&apos;s organic when it&apos;s grown naturally!
                        We nurture our mango trees in a 100% organic growing environment. Better than any certification
                        or seal, the pure taste and vibrant health of our trees let you know the fruit is naturally healthy.
                    </motion.p>
                </motion.div>

                {/* Content Grid */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={containerVariants}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 items-center mt-16 md:mt-24"
                >
                    {/* Left Features */}
                    <div className="flex flex-col gap-10 md:gap-16 order-1">
                        {leftFeatures.map((feature, idx) => (
                            <motion.div key={idx} variants={itemVariants} className="flex gap-4 md:gap-6">
                                <div className="shrink-0">{feature.icon}</div>
                                <div>
                                    <h3 className="text-primary font-bold mb-2 md:mb-3">{feature.title}</h3>
                                    <p className="p-sm text-muted-foreground">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Center Image */}
                    <motion.div
                        variants={itemVariants}
                        className="relative flex justify-center items-center order-2 w-full max-w-md mx-auto lg:max-w-full"
                    >
                        <div className="relative aspect-square w-full">
                            <Image
                                src="/images/mango_basket.webp"
                                alt="Fresh organic mangoes in a woven basket"
                                fill
                                className="object-contain mix-blend-multiply select-none"
                                draggable={false}
                                sizes="(max-width: 1024px) 100vw, 33vw"
                            />
                        </div>
                    </motion.div>

                    {/* Right Features */}
                    <div className="flex flex-col gap-10 md:gap-16 order-3">
                        {rightFeatures.map((feature, idx) => (
                            <motion.div key={idx} variants={itemVariants} className="flex gap-4 md:gap-6 text-right justify-end">
                                <div>
                                    <h3 className="text-primary font-bold mb-2 md:mb-3">{feature.title}</h3>
                                    <p className="p-sm text-muted-foreground">{feature.description}</p>
                                </div>
                                <div className="shrink-0">{feature.icon}</div>
                            </motion.div>
                        ))}
                    </div>

                </motion.div>
            </div>
        </section>
    );
}
