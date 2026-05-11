"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, Leaf, TreePine, MapPin, Sprout } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TreeListItem } from "@/types";

interface TreeCardProps {
    tree: TreeListItem;
}

export function TreeCard({ tree }: TreeCardProps) {
    const images =
        Array.isArray(tree.photos) && tree.photos.length > 0
            ? (tree.photos as string[])
            : ["/images/mango_basket.webp"];

    const isSale = tree.tree_plans?.name?.toLowerCase().includes("base");
    const badgeText = tree.tree_plans?.badge_text || (isSale ? "Sale" : null);

    const yieldLabel = tree.yield_min_kg && tree.yield_max_kg
        ? `${tree.yield_min_kg}–${tree.yield_max_kg} kg`
        : tree.yield_min_kg
        ? `~${tree.yield_min_kg} kg`
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="h-full"
        >
            <Card className="group h-full flex flex-col overflow-hidden rounded-2xl border border-border bg-card pt-0 shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">

                {/* ── Images ── */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/30">

                    {/* Top badges */}
                    <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
                        {badgeText && (
                            <Badge className="bg-red-500 text-white border-0 shadow text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                                {badgeText}
                            </Badge>
                        )}
                        {tree.farmers?.is_organic && (
                            <Badge className="bg-emerald-600 text-white border-0 shadow text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                                Organic
                            </Badge>
                        )}
                    </div>

                    {/* Plan name pill — top right */}
                    {tree.tree_plans?.name && (
                        <div className="absolute top-3 right-3 z-20">
                            <span className="bg-black/40 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                                {tree.tree_plans.name}
                            </span>
                        </div>
                    )}

                    {/* Carousel */}
                    <Carousel className="w-full h-full" opts={{ loop: true }}>
                        <CarouselContent>
                            {images.map((img, index) => (
                                <CarouselItem key={index} className="relative aspect-[4/3]">
                                    <Link href={`/trees/${tree.id}`} className="absolute inset-0 block">
                                        <Image
                                            src={img}
                                            alt={`${tree.variety} – view ${index + 1}`}
                                            fill
                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </Link>
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        {images.length > 1 && (
                            <div className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute inset-y-0 left-2 flex items-center pointer-events-auto">
                                    <CarouselPrevious className="static translate-y-0 h-8 w-8 border-0 bg-white/90 shadow-md hover:bg-primary hover:text-primary-foreground transition-colors" />
                                </div>
                                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-auto">
                                    <CarouselNext className="static translate-y-0 h-8 w-8 border-0 bg-white/90 shadow-md hover:bg-primary hover:text-primary-foreground transition-colors" />
                                </div>
                            </div>
                        )}
                    </Carousel>

                    {/* Desktop hover CTA */}
                    <div className="absolute inset-x-0 bottom-0 z-10 hidden lg:block translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <Link
                            href={`/trees/${tree.id}`}
                            className="w-full h-11 bg-primary text-primary-foreground flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                        >
                            <Search className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                                View Details
                            </span>
                        </Link>
                    </div>
                </div>

                {/* ── Info ── */}
                <CardContent className="flex-1 px-5 pt-4 pb-2 space-y-3">
                    {/* Variety & name */}
                    <Link href={`/trees/${tree.id}`} className="block">
                        <h3 className="text-sm font-bold leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                            {tree.variety}
                        </h3>
                    </Link>

                    <Separator className="bg-border/60" />

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                        {tree.age_years != null && (
                            <div className="flex items-center gap-1.5">
                                <TreePine className="w-3 h-3 text-primary/70 flex-shrink-0" />
                                <span className="text-[10px] text-muted-foreground font-semibold">
                                    {tree.age_years} yr old
                                </span>
                            </div>
                        )}
                        {yieldLabel && (
                            <div className="flex items-center gap-1.5">
                                <Sprout className="w-3 h-3 text-primary/70 flex-shrink-0" />
                                <span className="text-[10px] text-muted-foreground font-semibold">
                                    {yieldLabel} yield
                                </span>
                            </div>
                        )}
                        {tree.farmers?.location && (
                            <div className="flex items-center gap-1.5 col-span-2">
                                <MapPin className="w-3 h-3 text-primary/70 flex-shrink-0" />
                                <span className="text-[10px] text-muted-foreground font-semibold truncate">
                                    {tree.farmers.location}
                                </span>
                            </div>
                        )}
                        {tree.farmers?.is_organic && (
                            <div className="flex items-center gap-1.5">
                                <Leaf className="w-3 h-3 text-primary/70 flex-shrink-0" />
                                <span className="text-[10px] text-emerald-600 font-bold">
                                    Organic Farm
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Price */}
                    <div className="flex items-end justify-between gap-2 pt-1">
                        <div>
                            <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide">
                                Annual Rental
                            </p>
                            <span className="text-xl font-black text-primary">
                                ₹{tree.price.toLocaleString("en-IN")}
                            </span>
                        </div>
                        {tree.farmers?.farm_name && (
                            <span className="text-[9px] text-muted-foreground font-medium bg-muted px-2 py-1 rounded-md text-right max-w-[50%] truncate">
                                {tree.farmers.farm_name}
                            </span>
                        )}
                    </div>
                </CardContent>

                {/* ── Mobile CTA ── */}
                <CardFooter className="px-5 pb-5 pt-0 lg:hidden">
                    <Link
                        href={`/trees/${tree.id}`}
                        className="w-full h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
                    >
                        <Search className="w-4 h-4" />
                        <span>View Details</span>
                    </Link>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
