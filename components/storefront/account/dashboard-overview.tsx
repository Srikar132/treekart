"use client";

import { 
  TreePine, 
  ShoppingBag, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  MapPin
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface DashboardOverviewProps {
  user: any;
  rentals: any[];
  orders: any[];
  onTabChange: (tab: any) => void;
}

export function DashboardOverview({ user, rentals, orders, onTabChange }: DashboardOverviewProps) {
  const stats = [
    { label: "Active Rentals", value: rentals.length, icon: TreePine, color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Member Since", value: new Date(user.created_at).getFullYear(), icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const recentRental = rentals[0];
  const recentOrder = orders[0];

  return (
    <div className="space-y-16">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-6 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100">
            <div className="flex items-center justify-between">
              <div className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={22} className={stat.color} />
              </div>
              <TrendingUp size={16} className="text-slate-200" />
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Recent Activity — Rentals */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Rental</h3>
            <button 
              onClick={() => onTabChange("rentals")}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-2 group"
            >
              View all <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          
          {recentRental ? (
            <div className="group rounded-[2.5rem] border border-slate-100 p-8 space-y-8 hover:bg-slate-50 transition-all hover:shadow-lg hover:shadow-slate-100">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <Badge className="bg-primary/10 text-primary border-0 rounded-full text-[10px] font-black uppercase tracking-widest px-4 py-1">
                    {recentRental.trees?.plan_type} Plan
                  </Badge>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">
                    {recentRental.trees?.variety} Heritage
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <Badge variant="outline" className="rounded-full bg-white text-primary border-primary/20 text-[10px] font-black uppercase px-3 py-0.5">
                    {recentRental.status}
                  </Badge>
                </div>
              </div>
              
              <Separator className="bg-slate-200/50" />
              
              <div className="flex flex-wrap items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100">
                    <MapPin size={14} className="text-slate-400" />
                  </div>
                  <span className="text-sm font-bold text-slate-600">
                    {recentRental.trees?.farmers?.farm_name || 'Our Orchard'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100">
                    <Calendar size={14} className="text-slate-400" />
                  </div>
                  <span className="text-sm font-bold text-slate-600">
                    {new Date(recentRental.rented_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[2.5rem] border-2 border-dashed border-slate-100 py-20 text-center space-y-6">
              <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <TreePine size={28} className="text-slate-200" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No active rentals found</p>
                <button className="text-sm font-black text-primary hover:underline underline-offset-4">Rent your first tree</button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity — Orders */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Latest Order</h3>
            <button 
              onClick={() => onTabChange("orders")}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-2 group"
            >
              View all <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {recentOrder ? (
            <div className="rounded-[2.5rem] border border-slate-100 p-8 space-y-8 hover:bg-slate-50 transition-all hover:shadow-lg hover:shadow-slate-100">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Order #{recentOrder.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                    ₹{recentOrder.total_amount.toLocaleString()}
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-full bg-blue-50 text-blue-600 border-0 uppercase text-[10px] font-black px-4 py-1">
                  {recentOrder.status}
                </Badge>
              </div>

              <Separator className="bg-slate-200/50" />

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100">
                    <ShoppingBag size={14} className="text-slate-400" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shipping to</p>
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {(recentOrder.delivery_address as any)?.name || 'Valued Customer'} • {(recentOrder.delivery_address as any)?.city || 'India'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[2.5rem] border-2 border-dashed border-slate-100 py-20 text-center space-y-6">
              <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <ShoppingBag size={28} className="text-slate-200" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No orders placed yet</p>
                <button className="text-sm font-black text-primary hover:underline underline-offset-4">Explore the mango shop</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
