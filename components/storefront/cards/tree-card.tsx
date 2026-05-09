"use client";

import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
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
import { TreeListItem } from "@/types";

interface TreeCardProps {
    tree: TreeListItem;
}

export function TreeCard({ tree }: TreeCardProps) {

    const images = Array.isArray(tree.photos) && tree.photos.length > 0
        ? (tree.photos as string[])
        : ["/assets/images/placeholder.jpg"];

    const isSale = tree.plan_type === "basic";
    const title = `${tree.variety} Mango Tree`;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            whileHover={{ y: -8 }}
            className="group flex flex-col h-full"
        >
            {/* Image Container */}
            <div className="relative aspect-square w-full overflow-hidden mb-5 bg-muted/10 rounded-lg">
                {/* Sale Ribbon */}
                {isSale && (
                    <div className="absolute top-2 -right-7 w-30 h-8 bg-red-500 text-white flex items-end justify-center pb-2 rotate-45 z-10 shadow-sm pointer-events-none">
                        <span className="text-xs font-heading font-bold uppercase tracking-wider">Sale</span>
                    </div>
                )}

                {/* Product Images Carousel */}
                <Carousel className="w-full h-full" opts={{ loop: true }}>
                    <CarouselContent className="h-full">
                        {images.map((img, index) => (
                            <CarouselItem key={index} className="relative h-full aspect-square">
                                <Link href={`/trees/${tree.id}`} className="absolute inset-0 block">
                                    <Image
                                        src={img}
                                        alt={`${title} - Image ${index + 1}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover drop-shadow-md group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                    />
                                </Link>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {images.length > 1 && (
                        <>
                            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </>
                    )}
                </Carousel>

                {/* Hover Actions */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-3 opacity-100 translate-y-0 lg:opacity-0 lg:translate-y-4 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 transition-all duration-300 z-20">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger
                                render={
                                    <button className="w-10 h-10 rounded-full bg-white text-foreground flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-colors" title="Quick View" />
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
                <Link href={`/trees/${tree.id}`} className="inline-block hover:text-primary transition-colors">
                    <h3 className="text-base font-bold text-foreground mb-1">{title}</h3>
                </Link>
                <div className="flex items-center justify-center gap-2 font-medium">
                    <span className="text-primary">₹{tree.price.toFixed(2)}</span>
                </div>
            </div>
        </motion.div>
    );
}
