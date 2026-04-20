"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ─── Slide data ─────────────────────────────────────────────────────────────
const slides = [
    {
        id: 0,
        image: "/hero-mango-farm.png",
        eyebrow: "Farm-to-Doorstep Since 2024",
        headline: ["Own a Mango Tree.", "Taste the Season."],
        sub: "Rent a real Alphonso mango tree on our farm. GPS-tracked, 10-day updates, fresh mangoes delivered every season.",
        cta: { label: "Rent a Tree", href: "/rent" },
    },
    {
        id: 1,
        image: "/hero-mango-close.png",
        eyebrow: "Premium Alphonso · Kesar · Dashehari",
        headline: ["Fresh from the Orchard.", "Straight to Your Home."],
        sub: "Skip the middlemen. Order hand-picked mangoes directly from verified partner farms and enjoy unmatched quality.",
        cta: { label: "Shop Mangoes", href: "/store" },
    },
];

// ─── Animation variants ───────────────────────────────────────────────────────
const bgVariants: Variants = {
    enter: { scale: 1.08, opacity: 0 },
    center: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
    exit: {
        scale: 1.05,
        opacity: 0.7,
        transition: { duration: 0.4, ease: "easeIn" },
    },
};

const eyebrowVariants: Variants = {
    hidden: { opacity: 0, y: -16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: "easeOut", delay: 0.3 },
    },
    exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
};

const headlineVariants: Variants = {
    hidden: { opacity: 0, scale: 1.06, y: 24 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const, delay: 0.45 },
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
};

const subVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: "easeOut", delay: 0.62 },
    },
    exit: { opacity: 0, y: 5, transition: { duration: 0.2 } },
};

const btnVariants: Variants = {
    hidden: { opacity: 0, scale: 1.15, y: 18 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay: 0.78 },
    },
    exit: { opacity: 0, scale: 1.02, transition: { duration: 0.2 } },
};

import { AnimatedButton } from "@/components/shared/animated-button";

// ─── Main component ───────────────────────────────────────────────────────────
export function HeroSection() {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1);
    const [dragStart, setDragStart] = useState<number | null>(null);

    const goTo = useCallback(
        (index: number) => {
            const next = (index + slides.length) % slides.length;
            setDirection(next > current ? 1 : -1);
            setCurrent(next);
        },
        [current]
    );

    const prev = () => goTo(current - 1);
    const next = () => goTo(current + 1);

    // ── Drag handlers ──
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        const x = "touches" in e ? e.touches[0].clientX : e.clientX;
        setDragStart(x);
    };

    const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
        if (dragStart === null) return;
        const x =
            "changedTouches" in e
                ? e.changedTouches[0].clientX
                : e.clientX;
        const delta = dragStart - x;
        if (Math.abs(delta) > 60) {
            delta > 0 ? next() : prev();
        }
        setDragStart(null);
    };

    const slide = slides[current];

    return (
        <section
            className="relative flex items-center justify-center min-h-[88vh] overflow-hidden select-none cursor-grab active:cursor-grabbing"
            onMouseDown={handleDragStart}
            onMouseUp={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchEnd={handleDragEnd}
        >
            {/* ── Background images ── */}
            <AnimatePresence initial={false}>
                <motion.div
                    key={`bg-${slide.id}`}
                    className="absolute inset-0"
                    variants={bgVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                >
                    <Image
                        src={slide.image}
                        alt={slide.headline[0]}
                        fill
                        priority
                        className="object-cover object-center"
                        sizes="100vw"
                        draggable={false}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/60 pointer-events-none" />

            {/* ── Content ── */}
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={`content-${slide.id}`}
                    className="relative z-10 flex flex-col items-center gap-7 px-4 max-w-3xl mx-auto text-center pointer-events-none"
                >
                    {/* Eyebrow */}
                    <motion.span
                        variants={eyebrowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="pointer-events-auto inline-block rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-white/90"
                    >
                        🌿 {slide.eyebrow}
                    </motion.span>

                    {/* Headline */}
                    <motion.h1
                        variants={headlineVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="pointer-events-auto text-white font-bold leading-[1.06]  tracking-tight drop-shadow-xl uppercase"
                    >
                        {slide.headline[0]}
                    </motion.h1>
                    <motion.h3
                        variants={headlineVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="pointer-events-auto text-mango font-bold leading-[1.06]  tracking-tight  uppercase"
                    >
                        {slide.headline[1]}
                    </motion.h3>

                    {/* Subheadline */}
                    <motion.p
                        variants={subVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="pointer-events-auto max-w-xl text-white/80 text-base md:text-lg leading-relaxed"
                    >
                        {slide.sub}
                    </motion.p>

                    {/* CTA Button */}
                    <motion.div
                        variants={btnVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="pointer-events-auto mt-1"
                    >
                        <AnimatedButton
                            href={slide.cta.href}
                            label={slide.cta.label}
                            className="border-white text-white hover:text-foreground"
                            fillClassName="bg-white"
                        />
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            {/* ── Prev / Next arrows ── */}
            <button
                onClick={prev}
                className="absolute left-5 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/20 text-white backdrop-blur-sm transition-all hover:bg-black/40 hover:border-white/70"
                aria-label="Previous slide"
            >
                <ChevronLeft className="w-5 h-5" strokeWidth={1.8} />
            </button>
            <button
                onClick={next}
                className="absolute right-5 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/20 text-white backdrop-blur-sm transition-all hover:bg-black/40 hover:border-white/70"
                aria-label="Next slide"
            >
                <ChevronRight className="w-5 h-5" strokeWidth={1.8} />
            </button>

            {/* ── Dot indicators ── */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
                {slides.map((s, i) => (
                    <button
                        key={s.id}
                        onClick={() => goTo(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-400 ${i === current ? "w-8 bg-white" : "w-2.5 bg-white/45 hover:bg-white/70"
                            }`}
                    />
                ))}
            </div>
        </section>
    );
}
