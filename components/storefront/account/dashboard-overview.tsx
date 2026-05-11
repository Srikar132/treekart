"use client";

import {
  TreePine,
  ShoppingBag,
  Calendar,
  ArrowRight,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface DashboardOverviewProps {
  user: any;
  rentals: any[];
  orders: any[];
  onTabChange: (tab: any) => void;
}

export function DashboardOverview({ user, rentals, orders, onTabChange }: DashboardOverviewProps) {
  const confirmedOrders = orders.filter(o => ["confirmed", "shipped", "delivered"].includes(o.status?.toLowerCase() || ""));

  const stats = [
    { label: "Active Rentals", value: rentals.length, icon: TreePine, color: "text-primary", bg: "bg-primary/10" },
    { label: "Successful Orders", value: confirmedOrders.length, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Member Since", value: new Date(user.created_at).getFullYear(), icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const recentRental = rentals[0];
  const recentOrder = orders[0];

  return (
    <div className="space-y-10 sm:space-y-16">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 sm:p-6 lg:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-50 border border-slate-100 space-y-3 sm:space-y-6 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100"
          >
            <div className="flex items-center justify-between">
              <div className={`h-9 w-9 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={18} className={`${stat.color} sm:hidden`} />
                <stat.icon size={22} className={`${stat.color} hidden sm:block`} />
              </div>
              <TrendingUp size={14} className="text-slate-200 hidden sm:block" />
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <p className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              <p className="text-[8px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
        {/* Recent Rental */}
        <div className="space-y-5 sm:space-y-8">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Recent Rental</h3>
            <button
              onClick={() => onTabChange("rentals")}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5 group"
            >
              View all <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {recentRental ? (
            <Link
              href={`/trees/${recentRental.tree_id}`}
              className="block group rounded-[1.75rem] sm:rounded-[2.5rem] border border-slate-100 p-5 sm:p-8 space-y-5 sm:space-y-8 hover:bg-slate-50 transition-all hover:shadow-lg hover:shadow-slate-100 cursor-pointer"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-2 min-w-0">
                  <Badge className="bg-primary/10 text-primary border-0 rounded-full text-[10px] font-black uppercase tracking-widest px-3 py-0.5">
                    {recentRental.trees?.tree_plans?.name || "Premium Plan"}
                  </Badge>
                  <p className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">
                    {recentRental.trees?.variety} Heritage
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <Badge variant="outline" className="rounded-full bg-white text-primary border-primary/20 text-[10px] font-black uppercase px-3 py-0.5">
                    {recentRental.status}
                  </Badge>
                </div>
              </div>

              <Separator className="bg-slate-200/50" />

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
                      <MapPin size={12} className="text-slate-400" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-600 truncate">
                      {recentRental.trees?.farmers?.farm_name || "Our Orchard"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
                      <Calendar size={12} className="text-slate-400" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-600 truncate">
                      {new Date(recentRental.rented_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm">
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ) : (
            <div className="rounded-[1.75rem] sm:rounded-[2.5rem] border-2 border-dashed border-slate-100 py-14 sm:py-20 text-center space-y-4 sm:space-y-6">
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-slate-50 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <TreePine size={24} className="text-slate-200" />
              </div>
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest">No active rentals found</p>
                <Link href="/rent" className="text-sm font-black text-primary hover:underline underline-offset-4">
                  Rent your first tree
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Recent Order */}
        <div className="space-y-5 sm:space-y-8">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Latest Order</h3>
            <button
              onClick={() => onTabChange("orders")}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5 group"
            >
              View all <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {recentOrder ? (
            <Link
              href={`/account/orders/${recentOrder.id}`}
              className="block group rounded-[1.75rem] sm:rounded-[2.5rem] border border-slate-100 p-5 sm:p-8 space-y-5 sm:space-y-8 hover:bg-slate-50 transition-all hover:shadow-lg hover:shadow-slate-100 cursor-pointer"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-2 min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Order #{recentOrder.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none group-hover:text-primary transition-colors">
                    ₹{recentOrder.total_amount.toLocaleString()}
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-full bg-blue-50 text-blue-600 border-0 uppercase text-[10px] font-black px-3 py-0.5 shrink-0">
                  {recentOrder.status}
                </Badge>
              </div>

              <Separator className="bg-slate-200/50" />

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
                    <ShoppingBag size={12} className="text-slate-400" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Shipping to</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {(recentOrder.delivery_address as any)?.name || "Valued Customer"} ·{" "}
                      {(recentOrder.delivery_address as any)?.locality || (recentOrder.delivery_address as any)?.city || "India"}
                    </p>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm">
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          ) : (
            <div className="rounded-[1.75rem] sm:rounded-[2.5rem] border-2 border-dashed border-slate-100 py-14 sm:py-20 text-center space-y-4 sm:space-y-6">
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-slate-50 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <ShoppingBag size={24} className="text-slate-200" />
              </div>
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest">No orders placed yet</p>
                <Link href="/store" className="text-sm font-black text-primary hover:underline underline-offset-4">
                  Explore the mango shop
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}