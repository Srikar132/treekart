"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Share2, Heart } from "lucide-react";
import { ShareDialog } from "@/components/shared/share-dialog";

interface ProductMediaProps {
  image: string | null;
  name: string;
}

export function ProductMedia({ image, name }: ProductMediaProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative aspect-square overflow-hidden rounded-2xl bg-muted/10 border shadow-sm group"
    >
      <Image
        src={image || "/placeholder-mango.png"}
        alt={name}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        priority
      />

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
    </motion.div>
  );
}
