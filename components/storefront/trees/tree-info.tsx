"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Info, Leaf, MapPin, Calendar, Wheat, Share2, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatedButton } from "@/components/shared/animated-button";
import { ShareDialog } from "@/components/shared/share-dialog";
import { useRentalStore } from "@/store/use-rental-store";
import { useRouter } from "next/navigation";
import { Database, Tree, Farmer } from "@/types/database.types";

type PlanType = Database["public"]["Enums"]["plan_type"];

export type TreeWithDetails = Tree & {
  farmers: Pick<Farmer, "id" | "farm_name" | "location" | "is_organic"> | null;
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
  activeRental: ActiveRental;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function TreeInfo({ tree, activeRental }: TreeInfoProps) {
  const router = useRouter();
  const { setPlan } = useRentalStore();

  const handleRentNow = () => {
    setPlan({
      treeId: tree.id,
      planType: (tree.plan_type as PlanType) || "standard",
      variety: tree.variety || "Unknown Variety",
      price: tree.price || 0,
      yieldMinKg: tree.yield_min_kg || 0,
      yieldMaxKg: tree.yield_max_kg || 0,
      photos: Array.isArray(tree.photos) ? (tree.photos as string[]) : [],
      gpsLat: tree.gps_lat || 0,
      gpsLng: tree.gps_lng || 0,
    });
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
              {tree.plan_type} Plan
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
          {tree.variety} Mango Tree
        </h1>
        <div className="flex items-baseline gap-4">
          <span className="text-3xl font-bold text-primary">₹{tree.price?.toLocaleString()}</span>
          <span className="text-muted-foreground text-sm">/ Per Season</span>
        </div>
      </motion.div>

      {/* Description */}
      {tree.description && (
        <motion.div variants={item} className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">About this Tree</h3>
          <p className="text-muted-foreground leading-relaxed">{tree.description}</p>
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
              {activeRental?.profiles ? (
                <>
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    <AvatarImage src={activeRental.profiles.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary uppercase">
                      {activeRental.profiles.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Currently Leased By</p>
                    <p className="text-lg font-bold text-foreground">{activeRental.profiles.full_name}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm">
                    <UserCircle className="text-slate-400" size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Status</p>
                    <p className="text-lg font-bold text-foreground">Already Rented</p>
                  </div>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground italic bg-white/50 p-3 rounded-lg border">
              {activeRental?.profiles?.full_name
                ? `This heritage tree is currently thriving under ${activeRental.profiles.full_name.split(" ")[0]}'s care.`
                : "This heritage tree has been secured for the current season by another member."}
            </p>
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