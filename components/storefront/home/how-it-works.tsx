"use client";

import { motion } from "framer-motion";
import { TreePine, Video, Truck } from "lucide-react";

const steps = [
    {
        icon: <TreePine className="w-10 h-10 text-primary" strokeWidth={1.5} />,
        title: "1. Choose Your Tree",
        description: "Browse our farms and select the perfect mango tree package that suits your family's needs for the season.",
    },
    {
        icon: <Video className="w-10 h-10 text-primary" strokeWidth={1.5} />,
        title: "2. Watch It Grow",
        description: "Receive regular video and photo updates of your tree. Watch your mangoes grow organically from blossom to harvest.",
    },
    {
        icon: <Truck className="w-10 h-10 text-primary" strokeWidth={1.5} />,
        title: "3. Harvest & Enjoy",
        description: "Once perfectly ripe, we carefully hand-pick your mangoes and deliver the fresh, organic yield directly to your doorstep.",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
};

export function HowItWorks() {
    return (
        <section className="section bg-muted/30">
            <div className="container">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={containerVariants}
                    className="section-header text-center"
                >
                    <motion.h2 variants={itemVariants} className="mb-4">How Tree Leasing Works</motion.h2>
                    <motion.p variants={itemVariants} className="p-base max-w-2xl mx-auto text-muted-foreground">
                        Experience the joy of owning a farm without the hassle. We take care of the farming, you enjoy the freshest organic harvest.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative mt-16"
                >
                    {/* Connecting line for desktop */}
                    <div className="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-[2px] bg-border border-dashed border-t-2" />

                    {steps.map((step, index) => (
                        <motion.div key={index} variants={itemVariants} className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-background border-2 border-border flex items-center justify-center mb-8 shadow-sm relative group hover:border-primary transition-colors duration-300">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-foreground">{step.title}</h3>
                            <p className="p-sm text-muted-foreground leading-relaxed">{step.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
