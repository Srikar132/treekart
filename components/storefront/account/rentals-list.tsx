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
      <div className="flex flex-col items-center justify-center py-32 space-y-8 text-center animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center shadow-inner">
          <TreePine size={40} className="text-slate-200" />
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">No active rentals</h3>
          <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
            You haven't rented any heritage trees yet. Explore our orchards to start your journey into sustainable farming.
          </p>
        </div>
        <Link
          href="/rent"
          className="h-14 px-10 bg-primary text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          Browse Orchards <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tree Rentals</h2>
        <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-500 border-0 text-[10px] font-black px-4 py-1">
          {rentals.length} {rentals.length === 1 ? 'Tree' : 'Trees'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {rentals.map((rental) => (
          <div
            key={rental.id}
            className="group bg-white rounded-[2rem] border border-slate-100 p-4 sm:p-6 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-slate-100"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Compact Image */}
              <div className="relative w-full sm:w-32 h-48 sm:h-32 bg-slate-50 rounded-2xl overflow-hidden shrink-0">
                {rental.trees?.photos?.[0] ? (
                  <Image
                    src={rental.trees.photos[0]}
                    alt={rental.trees.variety}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TreePine size={32} className="text-slate-100" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/5" />
              </div>

              {/* Simple Info */}
              <div className="flex-1 w-full space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                      {rental.trees?.variety} Heritage
                    </h3>
                    <Badge className="bg-primary/10 text-primary border-0 rounded-full text-[8px] font-black uppercase tracking-widest px-2 py-0.5">
                      {rental.trees?.plan_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-primary" />
                      {rental.trees?.farmers?.farm_name || 'Heritage Farm'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-primary" />
                      ID: #{rental.id.slice(0, 8).toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-4 sm:pt-0 border-t sm:border-0 border-slate-50">
                  <div className="text-right hidden md:block px-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
                    <p className="text-xs font-bold text-slate-900 uppercase">{rental.status}</p>
                  </div>
                  
                  <Link
                    href={`/trees/${rental.tree_id}`}
                    className="flex-1 sm:flex-none h-12 px-8 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl hover:bg-slate-800 transition-all shadow-md shadow-slate-200"
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
      <div className="p-8 rounded-[2rem] bg-blue-50/50 border border-blue-100/50 flex gap-6">
        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0 border border-blue-100">
          <Info size={18} className="text-blue-500" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-blue-900">Digital Orchard Updates</p>
          <p className="text-xs font-medium text-blue-700/70 leading-relaxed">
            Reports are posted every 10 days by our farm team. You will be notified via WhatsApp and Email as soon as a new visual report is available for your heritage tree.
          </p>
        </div>
      </div>
    </div>
  );
}
