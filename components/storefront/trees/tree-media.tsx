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
      className="space-y-6"
    >
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted/10 border shadow-sm group">
        <Carousel setApi={setApi} className="w-full h-full" opts={{ loop: true }}>
          <CarouselContent className="h-full">
            {displayImages.map((img, idx) => (
              <CarouselItem key={idx} className="h-full">
                <div className="relative h-full aspect-square overflow-hidden rounded-3xl">
                  <Image
                    src={img}
                    alt={`${title} - Image ${idx + 1}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority={idx === 0}
                  />
                </div>
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
        <div className="flex flex-wrap gap-4">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => api?.scrollTo(idx)}
              className={cn(
                "relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all",
                current === idx
                  ? "border-primary ring-2 ring-primary/20 scale-105"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={img}
                alt={`${title} thumb ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
