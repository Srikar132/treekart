"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { AnimatedButton } from "@/components/shared/animated-button";

export function PromoBanner() {
    return (
        <section className="relative w-full overflow-hidden h-screen md:min-h-[600px] lg:min-h-[700px] flex items-center justify-center">
            {/* Background Image */}
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/images/mango_banner_bg.png"
                    alt="Fresh vibrant mangoes background"
                    fill
                    className="object-cover object-center"
                    quality={90}
                    sizes="100vw"
                />
            </div>

            {/* Central Content Box */}
            <div className="container px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="mx-auto max-w-2xl bg-white/85 backdrop-blur-md px-6 py-12 text-center shadow-2xl"
                >
                    <h2 className="mb-4 md:mb-6 uppercase tracking-wider text-foreground">
                        Live Your Happy Life!
                    </h2>

                    <p className="p-base mb-8 md:mb-10 text-muted-foreground">
                        When you've got nature's best, you've got everything. Treat yourself to the freshest, 100% organic mangoes straight from our farms.
                    </p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <AnimatedButton
                            href="/store"
                            label="SHOP NOW"
                            className="bg-primary text-primary-foreground border-transparent w-full sm:w-auto"
                            fillClassName="bg-foreground"
                            hoverTextClassName="hover:text-background"
                            hideArrow={true}
                        />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
