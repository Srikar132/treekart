"use client";

import * as React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TreeMediaProps {
  images: string[];
  title: string;
}

export function TreeMedia({ images, title }: TreeMediaProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  const displayImages = images.length > 0 ? images : ["/assets/images/placeholder.jpg"];

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-4"
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted/20 border">
        <Carousel setApi={setApi} className="w-full h-full" opts={{ loop: true }}>
          <CarouselContent className="h-full">
            {displayImages.map((img, index) => (
              <CarouselItem key={index} className="relative h-full aspect-square">
                <Image
                  src={img}
                  alt={`${title} - ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {displayImages.length > 1 && (
            <>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </>
          )}
        </Carousel>
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {displayImages.map((img, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "relative flex-shrink-0 w-24 aspect-square rounded-lg overflow-hidden border-2 transition-all",
                current === index ? "border-primary scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image src={img} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
