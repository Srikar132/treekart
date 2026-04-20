"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf, MoveRight, Search, Home, ShoppingBag, TreePine } from "lucide-react";
import { AnimatedButton } from "@/components/shared/animated-button";

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background px-6 py-24 sm:py-32">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-xl mx-auto text-center">
        {/* Stylized 404 Visual */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center mb-10"
        >
          <div className="relative mb-8 flex items-center justify-center gap-4">
            <span className="text-8xl md:text-[11rem] font-black leading-none tracking-tighter text-primary select-none">
              4
            </span>
            <motion.div
              animate={{
                rotate: [12, 8, 12],
                scale: [1, 1.05, 1]
              }}
              transition={{
                repeat: Infinity,
                duration: 5,
                ease: "easeInOut"
              }}
              className="w-20 h-28 md:w-28 md:h-40 border-[10px] md:border-[14px] border-accent rounded-[40%_60%_70%_30%/50%_60%_40%_50%] flex items-center justify-center relative"
            >
              <div className="absolute inset-0 bg-accent/5 rounded-[inherit]" />
            </motion.div>
            <span className="text-8xl md:text-[11rem] font-black leading-none tracking-tighter text-primary select-none">
              4
            </span>
          </div>

          <div className="space-y-3 max-w-md mx-auto">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-foreground leading-tight">
              Lost in the <span className="text-primary italic">Orchard?</span>
            </h1>
            <p className="text-[11px] md:text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] max-w-xs mx-auto leading-relaxed">
              This branch doesn't exist yet, or it might have been harvested already.
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link href="/" className="w-full sm:w-auto">
            <AnimatedButton
              label="Back to Home"
              icon={<Home size={14} />}
              className="w-full sm:w-48 h-12 bg-primary text-primary-foreground border-transparent uppercase tracking-widest text-[9px] font-black"
              fillClassName="bg-white"
              hoverTextClassName="hover:text-primary"
            />
          </Link>
          <Link href="/store" className="w-full sm:w-auto">
            <AnimatedButton
              label="Explore Mangoes"
              icon={<ShoppingBag size={14} />}
              className="w-full sm:w-48 h-12 bg-white text-foreground border-border uppercase tracking-widest text-[9px] font-black shadow-sm"
              fillClassName="bg-secondary/10"
              hoverTextClassName="hover:text-primary"
            />
          </Link>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-16 pt-8 border-t border-border/40"
        >
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-5 block">
            Maybe you were looking for
          </span>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
            {[
              { label: "Rent a Tree", href: "/rent" },
              { label: "Farmer's Blog", href: "/blog" },
              { label: "About Us", href: "/about" },
              { label: "Contact", href: "/contact" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[10px] font-bold uppercase tracking-widest text-foreground/60 hover:text-primary transition-colors flex items-center gap-1.5 group"
              >
                {link.label}
                <MoveRight size={8} className="transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer Text */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center opacity-30">
        <span className="text-[9px] font-bold uppercase tracking-widest">404 ERROR</span>
        <span className="text-[9px] font-bold uppercase tracking-widest">© TreeKart</span>
      </div>
    </main>
  );
}
