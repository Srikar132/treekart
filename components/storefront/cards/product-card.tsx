"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Loader2, Leaf, Scale } from "lucide-react";
import type { Database } from "@/types/database.types";
import { useState } from "react";
import { motion } from "framer-motion";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
            ? Math.round(
                ((product.original_price - product.price) / product.original_price) * 100
            )
            : 0;

    const isOutOfStock = product.status === "out_of_stock";
    const isPreOrder = product.status === "pre_order";

    const weightLabel = Array.isArray(product.weight_kg) && product.weight_kg.length > 0
        ? product.weight_kg.length > 1
            ? `${Math.min(...product.weight_kg)}–${Math.max(...product.weight_kg)} kg`
            : `${product.weight_kg[0]} kg`
        : null;

    const savings = product.original_price && product.original_price > product.price
        ? product.original_price - product.price
        : null;

    // Single priority badge: pre-order > discount > custom badge
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
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/30">

                    {/* Single priority badge */}
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

                    {/* Variety pill — top right */}
                    <div className="absolute top-3 right-3 z-20">
                        <span className="bg-black/40 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                            {product.variety}
                        </span>
                    </div>

                    {/* Out of stock overlay */}
                    {isOutOfStock && (
                        <div className="absolute inset-0 bg-foreground/50 backdrop-blur-[2px] z-20 flex items-center justify-center">
                            <span className="bg-background/90 text-foreground text-[10px] font-black uppercase tracking-widest px-4 py-2 border border-border shadow">
                                Out of Stock
                            </span>
                        </div>
                    )}

                    {/* Image */}
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
                <CardContent className="flex-1 px-5 pt-4 pb-2 space-y-3">
                    {/* Name */}
                    <Link href={`/store/${product.id}`} className="block">
                        <h3 className={cn(
                            "text-sm font-bold leading-snug line-clamp-1 group-hover:text-primary transition-colors",
                            isOutOfStock && "text-muted-foreground"
                        )}>
                            {product.name}
                        </h3>
                    </Link>

                    <Separator className="bg-border/60" />

                    {/* Stats row */}
                    <div className="flex items-center justify-between gap-2 text-[10px]">
                        {weightLabel && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <Scale className="w-3 h-3 text-primary/70 flex-shrink-0" />
                                <span className="font-semibold">{weightLabel}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1 text-muted-foreground ml-auto">
                            <Leaf className="w-3 h-3 text-primary/70 flex-shrink-0" />
                            <span className="font-semibold">Carbide-free</span>
                        </div>
                    </div>

                    {/* Price row */}
                    <div className="flex items-end justify-between gap-2">
                        <div>
                            <div className="flex items-baseline gap-1.5">
                                <span className={cn(
                                    "text-xl font-black text-primary",
                                    isOutOfStock && "text-muted-foreground"
                                )}>
                                    ₹{product.price}
                                </span>
                                {product.original_price && product.original_price > product.price && (
                                    <span className="text-xs text-muted-foreground line-through">
                                        ₹{product.original_price}
                                    </span>
                                )}
                            </div>
                            {savings && (
                                <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wide">
                                    Save ₹{savings}
                                </p>
                            )}
                        </div>
                        <span className="text-[9px] text-muted-foreground font-medium bg-muted px-2 py-1 rounded-md">
                            per box
                        </span>
                    </div>
                </CardContent>

                {/* ── Mobile CTA ── */}
                <CardFooter className="px-5 pb-5 pt-0 lg:hidden">
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
