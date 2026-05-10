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
import { Share2 } from "lucide-react";
import { ShareDialog } from "@/components/shared/share-dialog";
import { cn } from "@/lib/utils";

interface ProductMediaProps {
  image: string[] | null;
  name: string;
}

export function ProductMedia({ image, name }: ProductMediaProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  const images = Array.isArray(image)
    ? (image.length > 0 ? image : ["/placeholder-mango.png"])
    : (image ? [image as unknown as string] : ["/placeholder-mango.png"]);

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
            {images.map((img, idx) => (
              <CarouselItem key={idx} className="h-full">
                <div className="relative h-full aspect-square overflow-hidden rounded-3xl">
                  <Image
                    src={img}
                    alt={`${name} - Image ${idx + 1}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority={idx === 0}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {images.length > 1 && (
            <>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </>
          )}
        </Carousel>

        {/* Overlay Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-3 z-20">
          <ShareDialog
            trigger={
              <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-foreground flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-all duration-300">
                <Share2 size={18} />
              </button>
            }
          />
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex flex-wrap gap-4">
          {images.map((img, idx) => (
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
                alt={`${name} thumb ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

