"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Search, Loader2 } from "lucide-react";
import type { Database } from "@/types/database.types";
import { useState } from "react";
import { motion } from "framer-motion";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type MangoProduct = Database["public"]["Tables"]["mango_products"]["Row"];

interface ProductCardProps {
    product: MangoProduct;
    onAddToCart?: () => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isAdding || !onAddToCart) return;

        setIsAdding(true);

        onAddToCart();

        setIsAdding(false);
    };

    // Calculate discount percentage if original price exists
    const discount = product.original_price && product.original_price > product.price
        ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ y: -5 }}
            className="group flex flex-col h-full"
        >
            {/* Image Container */}
            <div className="relative aspect-square w-full overflow-hidden mb-5 bg-muted/10 rounded-lg">
                {/* Out of Stock Overlay */}
                {product.status === 'out_of_stock' && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center text-white p-4 text-center">
                        <div className="bg-white/10 border border-white/20 px-3 py-1.5 rounded-full mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest">Unavailable</span>
                        </div>
                        <p className="text-sm font-bold uppercase tracking-tight">Out of Stock</p>
                    </div>
                )}

                {/* Pre-order Badge */}
                {product.status === 'pre_order' && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest z-20 rounded-md shadow-lg">
                        Pre-order
                    </div>
                )}

                {/* Badges */}
                {product.badge && product.badge !== 'None' && product.status !== 'out_of_stock' && (
                    <div className={`absolute top-2 ${product.status === 'pre_order' ? 'left-24' : '-left-2'} px-3 py-1 text-white text-xs font-bold uppercase tracking-wider z-10 rounded-r-md ${product.badge === 'Sale' ? 'bg-red-500' :
                        product.badge === 'New' ? 'bg-green-500' : 'bg-blue-500'
                        }`}>
                        {product.badge}
                    </div>
                )}

                {discount > 0 && product.status !== 'out_of_stock' && (
                    <div className="absolute top-2 -right-7 w-30 h-8 bg-red-500 text-white flex items-end justify-center pb-2 rotate-45 z-10 shadow-sm">
                        <span className="text-xs font-heading font-bold uppercase tracking-wider">-{discount}%</span>
                    </div>
                )}

                {/* Product Image */}
                <Link href={`/store/${product.id}`} className="absolute inset-0 ">
                    <Image
                        src={product.image_url || "/placeholder-mango.png"}
                        alt={product.name}
                        width={300}
                        height={300}
                        className={cn(
                            "object-cover w-full h-full drop-shadow-md group-hover:scale-110 transition-transform duration-700 ease-in-out",
                            product.status === 'out_of_stock' && "grayscale-[0.5]"
                        )}
                    />
                </Link>

                {/* Hover Actions */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-3 opacity-100 translate-y-0 lg:opacity-0 lg:translate-y-4 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 transition-all duration-300 z-20">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger
                                render={
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={isAdding || product.status === 'out_of_stock'}
                                        className="w-10 h-10 rounded-full bg-white text-foreground flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                                    />
                                }
                            >
                                {isAdding ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <ShoppingBag className="w-4 h-4" />
                                )}
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-primary text-white border-none font-bold">
                                <p>{product.status === 'out_of_stock' ? 'Unavailable' : 'Add to Cart'}</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger
                                render={
                                    <Link
                                        href={`/store/${product.id}`}
                                        className="w-10 h-10 rounded-full bg-white text-foreground flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-colors"
                                    />
                                }
                            >
                                <Search className="w-4 h-4" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-primary text-white border-none font-bold">
                                <p>Quick View</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* Text Content */}
            <div className="text-center mt-auto">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mb-1">{product.variety}</p>
                <Link href={`/store/${product.id}`} className="inline-block hover:text-primary transition-colors">
                    <h3 className={cn(
                        "text-base font-bold text-foreground mb-1",
                        product.status === 'out_of_stock' && "text-muted-foreground"
                    )}>{product.name}</h3>
                </Link>
                <div className="flex items-center justify-center gap-2 font-medium">
                    <span className={cn(
                        "text-primary",
                        product.status === 'out_of_stock' && "text-muted-foreground"
                    )}>₹{product.price}</span>
                    {product.original_price && product.original_price > product.price && (
                        <span className="text-muted-foreground line-through text-sm">₹{product.original_price}</span>
                    )}
                </div>
                {product.weight_kg && (
                    <p className="text-xs text-muted-foreground mt-1">Weight: {product.weight_kg}kg</p>
                )}
            </div>

        </motion.div>
    );
}
