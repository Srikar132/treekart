"use client";

import Image from "next/image";
import Link from "next/link";
import { TreePine, ArrowRight, MapPin, Calendar, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface RentalsListProps {
  rentals: any[];
}

export function RentalsList({ rentals }: RentalsListProps) {
  if (rentals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center">
        <div className="w-20 h-20 bg-secondary/20 flex items-center justify-center">
          <TreePine size={32} className="text-muted-foreground/40" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-foreground uppercase tracking-tight">No Rentals Active</h3>
          <p className="text-xs text-muted-foreground uppercase tracking-widest max-w-xs mx-auto">
            You haven't rented any heritage trees yet. Explore our orchards to start your journey.
          </p>
        </div>
        <Link 
          href="/rent" 
          className="h-12 px-8 bg-primary text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 transition-all"
        >
          Browse Orchards <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-foreground">Active Tree Rentals</h2>
        <Badge variant="outline" className="rounded-none text-[8px] font-bold uppercase tracking-widest px-3">
          {rentals.length} TOTAL
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {rentals.map((rental) => (
          <div 
            key={rental.id} 
            className="group border border-border/60 bg-white overflow-hidden hover:border-primary/40 transition-all duration-500"
          >
            <div className="flex flex-col md:flex-row">
              {/* Image Section */}
              <div className="relative w-full md:w-48 h-48 md:h-auto bg-secondary overflow-hidden">
                {rental.trees?.photos?.[0] ? (
                  <Image
                    src={rental.trees.photos[0]}
                    alt={rental.trees.variety}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TreePine size={32} className="text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
              </div>

              {/* Info Section */}
              <div className="flex-1 p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary text-white border-0 rounded-none text-[8px] font-bold uppercase tracking-widest">
                        {rental.trees?.plan_type}
                      </Badge>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        #{rental.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">
                      {rental.trees?.variety} Heritage
                    </h3>
                  </div>
                  
                  <div className="flex flex-col md:items-end gap-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rental Status</p>
                    <p className="text-sm font-black text-primary uppercase tracking-tight">
                      {rental.status}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Orchard</p>
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-primary" />
                      <span className="text-xs font-bold text-foreground uppercase truncate">
                        {rental.trees?.farmers?.farm_name}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Est. Yield</p>
                    <div className="flex items-center gap-2 text-foreground">
                      <TreePine size={12} className="text-primary" />
                      <span className="text-xs font-bold uppercase">
                        {rental.trees?.yield_min_kg}-{rental.trees?.yield_max_kg} KG
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Next Update</p>
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-primary" />
                      <span className="text-xs font-bold text-foreground uppercase">
                        Every 10 Days
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="w-full sm:max-w-xs space-y-2">
                    <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest">
                      <span className="text-muted-foreground">Season Progress</span>
                      <span className="text-foreground">45%</span>
                    </div>
                    <Progress value={45} className="h-1 rounded-none bg-secondary" />
                  </div>

                  <Link 
                    href={`/account/rentals/${rental.id}`}
                    className="w-full sm:w-auto h-12 px-10 bg-white border border-border text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-secondary/50 transition-all"
                  >
                    Track Progress <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Notice */}
      <div className="p-6 bg-secondary/10 border border-border/40 flex gap-4">
        <Info size={16} className="text-primary shrink-0 mt-0.5" />
        <p className="text-[10px] font-medium text-muted-foreground leading-relaxed uppercase tracking-wider">
          Tree updates are posted every 10 days by our farm team. You will be notified via WhatsApp and Email as soon as a new report is available for your heritage tree.
        </p>
      </div>
    </div>
  );
}
