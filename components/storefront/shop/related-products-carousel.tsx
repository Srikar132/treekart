"use client";

import * as React from "react";
import { ProductCard } from "@/components/storefront/cards/product-card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { MangoProduct } from "@/types/database.types";

interface RelatedProductsCarouselProps {
    products: MangoProduct[];
}

export function RelatedProductsCarousel({ products }: RelatedProductsCarouselProps) {
    const [api, setApi] = React.useState<CarouselApi>();
    const [current, setCurrent] = React.useState(0);
    const [count, setCount] = React.useState(0);

    React.useEffect(() => {
        if (!api) return;

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    if (products.length === 0) return null;

    return (
        <section className="space-y-10 py-10">
            <div className="flex items-end justify-between">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">You May Also Like</h2>
                    <p className="text-muted-foreground">Other fresh mango products from our farm.</p>
                </div>

                <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-muted-foreground">
                    <span>{current} of {count}</span>
                    <div className="flex gap-1">
                        {Array.from({ length: count }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-300",
                                    current === i + 1 ? "w-8 bg-primary" : "w-1.5 bg-primary/20"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <Carousel
                setApi={setApi}
                opts={{ align: "start", loop: true }}
                className="w-full"
            >
                <CarouselContent className="-ml-6">
                    {products.map((product) => (
                        <CarouselItem key={product.id} className="pl-6 md:basis-1/2 lg:basis-1/4">
                            <ProductCard product={product} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="-left-12 hidden lg:flex" />
                <CarouselNext className="-right-12 hidden lg:flex" />
            </Carousel>

            <div className="flex sm:hidden justify-center items-center gap-1 mt-6">
                {Array.from({ length: count }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "h-1 rounded-full transition-all duration-300",
                            current === i + 1 ? "w-4 bg-primary" : "w-1 bg-primary/20"
                        )}
                    />
                ))}
            </div>
        </section>
    );
}