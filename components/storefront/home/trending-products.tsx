"use client";

import { motion, type Variants } from "framer-motion";
import { TreeCard, type TreeProduct } from "@/components/storefront/cards/tree-card";
import { AnimatedButton } from "@/components/shared/animated-button";

const trendingProducts: TreeProduct[] = [
    {
        id: 1,
        title: "Banganapalli Tree",
        price: 60.00,
        oldPrice: 70.00,
        images: ["/images/mango_banganapalli.png"],
        isSale: true,
    },
    {
        id: 2,
        title: "Alphonso Tree",
        price: 60.00,
        oldPrice: 70.00,
        images: ["/images/mango_alphonso.png"],
        isSale: true,
    },
    {
        id: 3,
        title: "Kesar Tree",
        price: 60.00,
        oldPrice: 70.00,
        images: ["/images/mango_basket.png"],
        isSale: true,
    },
    {
        id: 4,
        title: "Dasheri Tree",
        price: 60.00,
        oldPrice: 70.00,
        images: ["/images/mango_alphonso.png"],
        isSale: true,
    }
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" },
    },
};

export function TrendingProducts() {
    return (
        <section className="section">
            <div className="container">
                <div className="section-header text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight">Available for Lease</h2>
                    <p className="mt-4 p-base text-muted-foreground">Select a premium organic mango tree and start your farm journey today.</p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12"
                >
                    {trendingProducts.map((product) => (
                        <motion.div key={product.id} variants={itemVariants}>
                            <TreeCard product={product} />
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="flex justify-center"
                >
                    <AnimatedButton
                        href="/trees"
                        label="View All Trees"
                        className="border-foreground bg-foreground text-background"
                        fillClassName="bg-primary"
                        hoverTextClassName="hover:text-primary-foreground"
                    />
                </motion.div>
            </div>
        </section>
    );
}
