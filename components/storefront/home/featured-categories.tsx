"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { AnimatedButton } from "@/components/shared/animated-button";

const categories = [
    {
        title: "Farm Fresh Mangoes",
        image: "/images/featured_mango_basket.png",
        link: "/store",
        cta: "Shop Now",
    },
    {
        title: "Premium Tree Leasing",
        image: "/images/featured_mango_orchard.png",
        link: "/plans",
        cta: "View Plans",
    },
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
    },
};

export function FeaturedCategories() {
    return (
        <section className="section bg-background">
            <div className="container">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
                >
                    {categories.map((category, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="group relative h-[250px] md:h-[300px] lg:h-[320px] w-full overflow-hidden flex items-center justify-center cursor-pointer"
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 z-0">
                                <Image
                                    src={category.image}
                                    alt={category.title}
                                    fill
                                    quality={100}
                                    className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                />
                            </div>

                            {/* Dark Overlay for better contrast */}
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500 z-10" />

                            {/* Center Content Box */}
                            <div className="relative z-20 bg-white/90 backdrop-blur-sm px-6 py-6 md:px-10 md:py-8 text-center w-full max-w-[60%] transition-transform duration-500 group-hover:-translate-y-2 shadow-xl flex flex-col items-center">
                                <h2 className="text-lg md:text-xl lg:text-2xl font-black uppercase tracking-widest text-foreground mb-4 leading-snug">
                                    {category.title.split(' ').map((word, i) => (
                                        <span key={i} className="block">{word}</span>
                                    ))}
                                </h2>

                                <AnimatedButton
                                    href={category.link}
                                    label={category.cta}
                                    className="border-primary bg-primary text-primary-foreground py-2 px-6 text-[0.7rem]"
                                    fillClassName="bg-foreground"
                                    hoverTextClassName="hover:text-background"
                                    hideArrow
                                />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
