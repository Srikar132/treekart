"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Loader2, Scale, Leaf } from "lucide-react";
import type { Database } from "@/types/database.types";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type MangoProduct = Database["public"]["Tables"]["mango_products"]["Row"];

interface ProductCardProps {
    product: MangoProduct;
    onAddToCart?: () => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isAdding || !onAddToCart) return;
        setIsAdding(true);
        onAddToCart();
        setIsAdding(false);
    };

    const discount =
        product.original_price && product.original_price > product.price
            ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
            : 0;

    const isOutOfStock = product.status === "out_of_stock";
    const isPreOrder = product.status === "pre_order";

    const weights: number[] = Array.isArray(product.weight_kg) && product.weight_kg.length > 0
        ? product.weight_kg
        : [];
    const firstWeight = weights[0] ?? 1;

    const boxPrice = product.price * firstWeight;
    const originalBoxPrice = product.original_price ? product.original_price * firstWeight : null;
    const savings = originalBoxPrice && originalBoxPrice > boxPrice ? originalBoxPrice - boxPrice : null;

    const primaryBadge = isPreOrder
        ? { label: "Pre-Order", style: "bg-blue-600 text-white" }
        : discount > 0 && !isOutOfStock
            ? { label: `-${discount}%`, style: "bg-red-500 text-white" }
            : product.badge && product.badge !== "None" && !isOutOfStock
                ? { label: product.badge, style: "bg-primary text-primary-foreground" }
                : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="h-full"
        >
            <Card className="group h-full flex flex-col overflow-hidden rounded-2xl border border-border bg-card pt-0 shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">

                {/* ── Image ── */}
                <div className="relative aspect-square w-full overflow-hidden bg-muted/30">

                    {primaryBadge && (
                        <div className="absolute top-3 left-3 z-20">
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm",
                                primaryBadge.style
                            )}>
                                {primaryBadge.label}
                            </span>
                        </div>
                    )}

                    <div className="absolute top-3 right-3 z-20">
                        <span className="bg-black/40 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                            {product.variety}
                        </span>
                    </div>

                    {isOutOfStock && (
                        <div className="absolute inset-0 bg-foreground/50 backdrop-blur-[2px] z-20 flex items-center justify-center">
                            <span className="bg-background/90 text-foreground text-[10px] font-black uppercase tracking-widest px-4 py-2 border border-border shadow">
                                Out of Stock
                            </span>
                        </div>
                    )}

                    <Link href={`/store/${product.id}`} className="absolute inset-0 block">
                        <Image
                            src={product.image_url?.[0] || "/placeholder-mango.png"}
                            alt={product.name}
                            fill
                            className={cn(
                                "object-cover transition-transform duration-500 group-hover:scale-105",
                                isOutOfStock && "grayscale-[0.4]"
                            )}
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    </Link>

                    {/* Bottom gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent z-[5] pointer-events-none group-hover:opacity-0 transition-opacity duration-300" />

                    {/* Desktop hover CTA */}
                    <div className="absolute inset-x-0 bottom-0 z-10 hidden lg:block translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <button
                            onClick={handleAddToCart}
                            disabled={isAdding || isOutOfStock}
                            className="w-full h-11 bg-primary text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                        >
                            {isAdding ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <ShoppingBag className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                                        {isOutOfStock ? "Unavailable" : "Add to Cart"}
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* ── Info ── */}
                <CardContent className="flex-1 px-4 pt-3 pb-2 space-y-2">
                    <Link href={`/store/${product.id}`} className="block">
                        <h3 className={cn(
                            "text-sm font-bold leading-snug line-clamp-1 group-hover:text-primary transition-colors",
                            isOutOfStock && "text-muted-foreground"
                        )}>
                            {product.name}
                        </h3>
                    </Link>

                    {/* Quality tag */}
                    <div className="flex items-center gap-1">
                        <Leaf className="w-3 h-3 text-leaf flex-shrink-0" />
                        <span className="text-[9px] font-bold text-leaf uppercase tracking-wide">
                            Carbide-free · Farm Fresh
                        </span>
                    </div>

                    {/* Price block */}
                    <div className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-xl px-3 py-2">
                        <div>
                            <div className="flex items-baseline gap-1.5">
                                <span className={cn(
                                    "text-lg font-black text-primary",
                                    isOutOfStock && "text-muted-foreground"
                                )}>
                                    ₹{boxPrice.toLocaleString("en-IN")}
                                </span>
                                {originalBoxPrice && originalBoxPrice > boxPrice && (
                                    <span className="text-xs text-muted-foreground line-through">
                                        ₹{originalBoxPrice.toLocaleString("en-IN")}
                                    </span>
                                )}
                            </div>
                            {savings ? (
                                <p className="text-[9px] text-leaf font-bold uppercase tracking-wide">
                                    Save ₹{savings.toLocaleString("en-IN")}
                                </p>
                            ) : (
                                <p className="text-[9px] text-muted-foreground/70 font-medium">
                                    ₹{product.price.toLocaleString("en-IN")}/kg
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-1 bg-white rounded-lg px-2.5 py-1 border border-border/50 shadow-sm">
                            <Scale className="w-3 h-3 text-primary/70" />
                            <span className="text-[10px] font-black text-foreground">
                                {firstWeight} kg
                            </span>
                        </div>
                    </div>

                </CardContent>

                {/* ── Mobile CTA ── */}
                <CardFooter className="px-4 pb-4 pt-0 lg:hidden">
                    <button
                        onClick={handleAddToCart}
                        disabled={isAdding || isOutOfStock}
                        className="w-full h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
                    >
                        {isAdding ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <ShoppingBag className="w-4 h-4" />
                                <span>{isOutOfStock ? "Unavailable" : "Add to Cart"}</span>
                            </>
                        )}
                    </button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
