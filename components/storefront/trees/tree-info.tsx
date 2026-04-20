"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Info, Leaf, MapPin, Calendar, Wheat, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatedButton } from "@/components/shared/animated-button";
import { ShareDialog } from "@/components/shared/share-dialog";
import { useRentalStore } from "@/store/use-rental-store";
import { useRouter } from "next/navigation";
import { Database } from "@/types/database.types";

type PlanType = Database["public"]["Enums"]["plan_type"];

interface TreeInfoProps {
  tree: {
    id: string;
    variety: string;
    price: number;
    description: string | null;
    age_years: number;
    yield_min_kg: number;
    yield_max_kg: number;
    status: string;
    is_verified: boolean;
    plan_type: string;
    farmers?: {
      farm_name: string;
      location: string;
      is_organic: boolean;
    };
    rentals?: Array<{
      status: string;
      profiles: {
        full_name: string;
        avatar_url: string;
      };
    }>;
  };
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function TreeInfo({ tree }: TreeInfoProps) {
  const router = useRouter();
  const { setPlan } = useRentalStore();

  const handleRentClick = () => {
    setPlan({
      treeId: tree.id,
      planType: tree.plan_type as PlanType,
      variety: tree.variety,
      price: tree.price,
      yieldMinKg: tree.yield_min_kg,
      yieldMaxKg: tree.yield_max_kg,
      photos: (tree as any).photos || [], // Photos might not be in the tree type but are in the store type
      gpsLat: (tree as any).gps_lat || 0,
      gpsLng: (tree as any).gps_lng || 0,
    });
    router.push(`/checkout/rental/${tree.id}`);
  };
  const isRented = tree.status === "rented";
  const activeRental = tree.rentals?.find(r => r.status === "active") || tree.rentals?.[0];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col h-full"
    >
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

      {/* Description Section */}
      {tree.description && (
        <motion.div variants={item} className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">About this Tree</h3>
          <p className="text-muted-foreground leading-relaxed">
            {tree.description}
          </p>
        </motion.div>
      )}

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

      <motion.div variants={item} className="pt-8 border-t mb-12">
        {isRented && activeRental ? (
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                <AvatarImage src={activeRental.profiles.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary uppercase">
                  {activeRental.profiles.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Currently Leased By</p>
                <p className="text-lg font-bold text-foreground">{activeRental.profiles.full_name}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground italic bg-white/50 p-3 rounded-lg border">
              "This tree is currently thriving under {activeRental.profiles.full_name.split(' ')[0]}'s care for the current season."
            </p>
          </div>
        ) : (
          <div className="space-y-4 w-full">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-amber-50 text-amber-700 p-3 rounded-lg border border-amber-200">
              <Info size={16} />
              <span>Available for immediate lease. Season starts in 2 months.</span>
            </div>
            <AnimatedButton
              onClick={handleRentClick}
              label="Rent This Tree Now"
              className="w-full h-16 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all bg-primary text-white border-transparent tracking-normal uppercase"
              fillClassName="bg-white"
              hoverTextClassName="hover:text-primary"
            />
          </div>
        )}
      </motion.div>

      {/* Ad Image Section (Figma style)
      <motion.div variants={item} className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden group shadow-xl">
        <Image
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80"
          alt="Farm Advertisement"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </motion.div> */}
    </motion.div>
  );
}
