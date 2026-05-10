"use client";

import Image from "next/image";
import Link from "next/link";
import { TreePine, ArrowRight, MapPin, Calendar, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/types/database.types";

type Rental = Database["public"]["Tables"]["rentals"]["Row"] & {
  trees: (Database["public"]["Tables"]["trees"]["Row"] & {
    farmers: { farm_name: string | null } | null;
    tree_plans: { name: string; badge_text: string | null; badge_color: string | null } | null;
  }) | null;
};

interface RentalsListProps {
  rentals: Rental[];
}

export function RentalsList({ rentals }: RentalsListProps) {
  if (rentals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 sm:py-32 space-y-6 sm:space-y-8 text-center animate-in fade-in zoom-in duration-700 px-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center shadow-inner">
          <TreePine size={36} className="text-slate-200" />
        </div>
        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">No active rentals</h3>
          <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
            You haven&apos;t rented any heritage trees yet. Explore our orchards to start your journey into sustainable farming.
          </p>
        </div>
        <Link
          href="/rent"
          className="h-12 sm:h-14 px-8 sm:px-10 bg-primary text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          Browse Orchards <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Tree Rentals</h2>
        <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-500 border-0 text-[10px] font-black px-3 py-1">
          {rentals.length} {rentals.length === 1 ? "Tree" : "Trees"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {rentals.map((rental) => {
          const photos = rental.trees?.photos as string[] | null;
          const firstPhoto = photos?.[0];

          return (
            <div
              key={rental.id}
              className="group bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 p-4 sm:p-6 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-slate-100"
            >
              <div className="flex gap-4">
                {/* Image */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-slate-50 rounded-xl sm:rounded-2xl overflow-hidden shrink-0">
                  {firstPhoto ? (
                    <Image
                      src={firstPhoto}
                      alt={rental.trees?.variety || "Tree"}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <TreePine size={28} className="text-slate-100" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/5" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                        {rental.trees?.variety} Heritage
                      </h3>
                      <Badge className="bg-primary/10 text-primary border-0 rounded-full text-[8px] font-black uppercase tracking-widest px-2 py-0.5 shrink-0">
                        {rental.trees?.tree_plans?.name || "Premium Plan"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin size={11} className="text-primary shrink-0" />
                        <span className="truncate">{rental.trees?.farmers?.farm_name || "Heritage Farm"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Calendar size={11} className="text-primary" />
                        #{rental.id.slice(0, 8).toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="hidden sm:block">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Status</p>
                      <p className="text-xs font-bold text-slate-900 uppercase">{rental.status}</p>
                    </div>
                    <Link
                      href={`/trees/${rental.tree_id}`}
                      className="h-10 sm:h-11 px-5 sm:px-7 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl hover:bg-slate-800 transition-all shadow-md shadow-slate-200 shrink-0 ml-auto"
                    >
                      Track <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Notice */}
      <div className="p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-blue-50/50 border border-blue-100/50 flex gap-4 sm:gap-6">
        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0 border border-blue-100">
          <Info size={16} className="text-blue-500" />
        </div>
        <div className="space-y-1 min-w-0">
          <p className="text-sm font-bold text-blue-900">Digital Orchard Updates</p>
          <p className="text-xs font-medium text-blue-700/70 leading-relaxed">
            Reports are posted every 10 days by our farm team. You will be notified via WhatsApp and Email as soon as a new visual report is available for your heritage tree.
          </p>
        </div>
      </div>
    </div>
  );
}