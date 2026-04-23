"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { AnimatedButton } from "@/components/shared/animated-button";
import { HeroSlide } from "@/types/database.types";

interface HeroSectionProps {
    slides: HeroSlide[];
}

const bgVariants: Variants = {
    enter: (direction: number) => ({
        scale: 1.1,
        opacity: 0,
    }),
    center: {
        scale: 1,
        opacity: 1,
        transition: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }
    },
    exit: (direction: number) => ({
        scale: 1.05,
        opacity: 0,
        transition: { duration: 0.8, ease: "easeInOut" }
    })
};

const textContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.4
        }
    }
};

const textItemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] }
    }
};

export function HeroSection({ slides: initialSlides }: HeroSectionProps) {
    const slides = initialSlides?.length > 0 ? initialSlides : [
        {
            id: 'default-0',
            image_url: "/hero-mango-farm.png",
            eyebrow: "Farm-to-Doorstep Since 2024",
            title: "Own a Mango Tree.",
            sub_heading: "Taste the Season.",
            description: "Rent a real Alphonso mango tree on our farm. GPS-tracked, 10-day updates, fresh mangoes delivered every season.",
            button_label: "Rent a Tree",
            button_link: "/rent",
            order_index: 0,
        } as HeroSlide
    ];

    const [[page, direction], setPage] = useState([0, 0]);
    const currentIndex = (page % slides.length + slides.length) % slides.length;

    const paginate = useCallback((newDirection: number) => {
        setPage([page + newDirection, newDirection]);
    }, [page]);

    useEffect(() => {
        const timer = setInterval(() => paginate(1), 10000);
        return () => clearInterval(timer);
    }, [paginate]);

    const slide = slides[currentIndex];

    return (
        <section className="relative h-[85vh] md:h-[90vh] w-full overflow-hidden bg-black select-none">
            {/* Background Images */}
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                    key={page}
                    custom={direction}
                    variants={bgVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 z-0"
                >
                    <Image
                        src={slide.image_url}
                        alt={slide.title}
                        fill
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 z-10" />
                </motion.div>
            </AnimatePresence>

            {/* Content Overlay */}
            <div className="relative z-20 h-full container mx-auto px-6 flex flex-col items-center justify-center text-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={page}
                        variants={textContainerVariants}
                        initial="hidden"
                        animate="visible"
                        className="max-w-4xl flex flex-col items-center"
                    >
                        {/* Pill Eyebrow */}
                        <motion.div
                            variants={textItemVariants}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/20 mb-8"
                        >
                            <span className="text-primary text-xs">🌿</span>
                            <span className="text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
                                {slide.eyebrow}
                            </span>
                        </motion.div>

                        {/* Centered Headline */}
                        <div className="space-y-4 mb-10">
                            <motion.h1
                                variants={textItemVariants}
                                className="text-white text-[2.5rem] md:text-[5rem] lg:text-[6.5rem] font-black tracking-tight leading-[1] uppercase drop-shadow-2xl"
                            >
                                {slide.title}
                            </motion.h1>
                            <motion.h2
                                variants={textItemVariants}
                                className="text-secondary text-[1.5rem] md:text-[3rem] lg:text-[4rem] font-black tracking-tight leading-[1] uppercase"
                            >
                                {slide.sub_heading}
                            </motion.h2>
                        </div>

                        {/* Balanced Description */}
                        <motion.p
                            variants={textItemVariants}
                            className="text-white/80 text-xs md:text-sm font-medium leading-relaxed max-w-2xl mb-12 drop-shadow-md"
                        >
                            {slide.description}
                        </motion.p>

                        {/* Outlined CTA */}
                        <motion.div variants={textItemVariants}>
                            <AnimatedButton
                                href={slide.button_link}
                                label={slide.button_label}
                                className="h-14 px-10 border-white text-white hover:text-black group"
                                fillClassName="bg-white"
                            >
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </AnimatedButton>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Side Navigation Arrows */}
            <button
                onClick={() => paginate(-1)}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-30 h-12 w-12 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm border border-white/10 text-white hover:bg-white hover:text-black transition-all"
            >
                <ChevronLeft size={20} />
            </button>
            <button
                onClick={() => paginate(1)}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-30 h-12 w-12 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm border border-white/10 text-white hover:bg-white hover:text-black transition-all"
            >
                <ChevronRight size={20} />
            </button>

            {/* Bottom Dash Indicators */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setPage([i, i > currentIndex ? 1 : -1])}
                        className={`h-1 transition-all duration-500 rounded-full ${i === currentIndex ? "w-10 bg-white" : "w-6 bg-white/30"
                            }`}
                    />
                ))}
            </div>
        </section>
    );
}
