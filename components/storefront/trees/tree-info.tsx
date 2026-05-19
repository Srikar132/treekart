"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";
import { CheckCircle, Info, Leaf, MapPin, Calendar, Wheat, Share2, Truck } from "lucide-react";
import { AnimatedButton } from "@/components/shared/animated-button";
import { ShareDialog } from "@/components/shared/share-dialog";
import { useRentalStore } from "@/store/use-rental-store";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Database, Tree, Farmer } from "@/types/database.types";
import { useLoginPrompt } from "@/store/use-login-prompt";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";



export type TreeWithDetails = Tree & {
  farmers: Pick<Farmer, "id" | "farm_name" | "location" | "is_organic"> | null;
  tree_plans?: { name: string; badge_text: string | null; badge_color: string | null } | null;
};

export type ActiveRental = {
  id: string;
  status: string | null;
  user_id: string | null;
  season: string | null;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
} | null;

interface TreeInfoProps {
  tree: TreeWithDetails;
  rentalBadge?: ReactNode;
  rentalDeliveryFee?: number;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function TreeInfo({ tree, rentalBadge, rentalDeliveryFee }: TreeInfoProps) {
  const router = useRouter();
  const { setPlan } = useRentalStore();
  const { openLoginPrompt } = useLoginPrompt();
  const [descExpanded, setDescExpanded] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    if (descExpanded) return;
    const el = descRef.current;
    if (!el) return;
    const check = () => setIsClamped(el.scrollHeight > el.clientHeight);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [descExpanded]);

  const handleRentNow = async () => {
    setPlan({
      treeId: tree.id,
      planId: tree.plan_id || "",
      variety: tree.variety || "Unknown Variety",
      price: tree.price || 0,
      yieldMinKg: tree.yield_min_kg || 0,
      yieldMaxKg: tree.yield_max_kg || 0,
      photos: Array.isArray(tree.photos) ? (tree.photos as string[]) : [],
      gpsLat: tree.gps_lat || 0,
      gpsLng: tree.gps_lng || 0,
    });

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      openLoginPrompt(`/checkout/rental/${tree.id}`);
      return;
    }

    router.push(`/checkout/rental/${tree.id}`);
  };

  const isRented = tree.status === "rented";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col h-full">
      {/* Header badges */}
      <motion.div variants={item} className="space-y-4 mb-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 capitalize font-medium px-4 py-1">
              {tree.tree_plans?.name || "Premium Plan"}
            </Badge>
            {tree.is_verified && (
              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 flex items-center gap-1 font-medium px-4 py-1">
                <CheckCircle size={14} /> Verified
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
            <ShareDialog
              trigger={
                <button className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
              }
              url={`/trees/${tree.id}`}
            />
          </div>
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
          {tree.variety}
        </h1>
        <div className="flex items-baseline gap-4">
          <span className="text-3xl font-bold text-primary">₹{tree.price?.toLocaleString()}</span>
          <span className="text-muted-foreground text-sm">/ Per Season</span>
        </div>
      </motion.div>

      {/* Description */}
      {tree.description && (
        <motion.div variants={item} className="mb-8 space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">About this Tree</h3>
          <p ref={descRef} className={cn("text-muted-foreground leading-relaxed", !descExpanded && "line-clamp-3")}>
            {tree.description}
          </p>
          {(isClamped || descExpanded) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDescExpanded((v) => !v)}
              className="h-auto px-0 text-primary text-xs font-bold uppercase tracking-widest hover:bg-transparent hover:text-primary/70"
            >
              {descExpanded ? "Show Less ↑" : "Show More ↓"}
            </Button>
          )}
        </motion.div>
      )}

      {/* Stats grid */}
      <motion.div variants={item} className="grid grid-cols-2 gap-6 mb-10">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
          <Calendar className="text-primary" size={24} />
          <div>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Age</p>
            <p className="font-bold">{tree.age_years} Years</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
          <Wheat className="text-primary" size={24} />
          <div>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Est. Yield</p>
            <p className="font-bold">{tree.yield_min_kg}-{tree.yield_max_kg} Kg</p>
          </div>
        </div>
        {rentalDeliveryFee !== undefined && (
          <div className={cn("flex items-center gap-3 p-4 rounded-xl border border-border/50", rentalDeliveryFee === 0 ? "bg-secondary/50" : "bg-secondary/30")}>
            <Truck className="text-primary" size={24} />
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Delivery</p>
              <p className={cn("font-bold", rentalDeliveryFee === 0 && "text-primary")}>
                {rentalDeliveryFee === 0 ? "Free" : `₹${rentalDeliveryFee.toLocaleString()}`}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Farm info */}
      <motion.div variants={item} className="space-y-6 mb-10">
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Farm Information</h3>
          <div className="flex items-center gap-2 text-foreground font-medium">
            <MapPin size={18} className="text-primary" />
            <span>{tree.farmers?.farm_name || "BY TREEKART"}, {tree.farmers?.location}</span>
          </div>
          {tree.farmers?.is_organic && (
            <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
              <Leaf size={18} />
              <span>100% Certified Organic Farming</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* CTA / Rented state */}
      <motion.div variants={item} className="pt-8 border-t mb-12">
        {isRented ? (
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-4">
              {rentalBadge}
            </div>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground italic bg-white/50 p-3 rounded-lg border">
                This heritage tree has been secured for the current season by another member.
              </p>
              
              {tree.reserved_until && new Date(tree.reserved_until) > new Date() && (
                <div className="flex items-center gap-2 text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/5 p-2 rounded-md border border-primary/10">
                  <Calendar size={14} />
                  <span>Reserved Until: {new Date(tree.reserved_until).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 w-full">
            <div className="flex items-center gap-2 text-sm bg-amber-50 text-amber-700 p-3 rounded-lg border border-amber-200">
              <Info size={16} />
              <span>Available for immediate lease. Season starts in 2 months.</span>
            </div>
            <AnimatedButton
              onClick={handleRentNow}
              label="Rent This Tree Now"
              className="w-full h-16 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all bg-primary text-white border-transparent tracking-normal uppercase"
              fillClassName="bg-white"
              hoverTextClassName="hover:text-primary"
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}