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
    { label: "Active Rentals", value: rentals.length, icon: TreePine, color: "text-primary" },
    { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-blue-600" },
    { label: "Member Since", value: new Date(user.created_at).getFullYear(), icon: Calendar, color: "text-amber-600" },
  ];

  const recentRental = rentals[0];
  const recentOrder = orders[0];

  return (
    <div className="space-y-12">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 bg-secondary/10 border border-border/40 space-y-4">
            <div className="flex items-center justify-between">
              <stat.icon size={20} className={stat.color} />
              <TrendingUp size={14} className="text-muted-foreground/30" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-black text-foreground">{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Recent Activity — Rentals */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground">Recent Rental</h3>
            <button 
              onClick={() => onTabChange("rentals")}
              className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-2"
            >
              View All <ArrowRight size={12} />
            </button>
          </div>
          
          {recentRental ? (
            <div className="group border border-border/60 p-6 space-y-6 hover:bg-secondary/5 transition-colors">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <Badge className="bg-primary/10 text-primary border-0 rounded-none text-[8px] font-bold uppercase tracking-widest mb-2">
                    {recentRental.trees?.plan_type} PLAN
                  </Badge>
                  <p className="text-lg font-black text-foreground uppercase tracking-tight">
                    {recentRental.trees?.variety} Heritage
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Status</p>
                  <p className="text-xs font-black text-primary uppercase">{recentRental.status}</p>
                </div>
              </div>
              
              <Separator className="bg-border/30" />
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-muted-foreground" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">
                    {recentRental.trees?.farmers?.farm_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={12} className="text-muted-foreground" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">
                    {new Date(recentRental.rented_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-border py-12 text-center space-y-4">
              <TreePine size={24} className="text-muted-foreground/30 mx-auto" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">No active rentals found</p>
              <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Rent your first tree</button>
            </div>
          )}
        </div>

        {/* Recent Activity — Orders */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground">Latest Order</h3>
            <button 
              onClick={() => onTabChange("orders")}
              className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-2"
            >
              View All <ArrowRight size={12} />
            </button>
          </div>

          {recentOrder ? (
            <div className="border border-border/60 p-6 space-y-6 hover:bg-secondary/5 transition-colors">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    #{recentOrder.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-lg font-black text-foreground uppercase tracking-tight">
                    ₹{recentOrder.total_amount.toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline" className="rounded-none uppercase text-[8px] font-bold tracking-widest border-border">
                  {recentOrder.status}
                </Badge>
              </div>

              <Separator className="bg-border/30" />

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Shipping To</p>
                <p className="text-xs font-bold text-foreground uppercase truncate">
                  {(recentOrder.shipping_address as any)?.name} • {(recentOrder.shipping_address as any)?.city}
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-border py-12 text-center space-y-4">
              <ShoppingBag size={24} className="text-muted-foreground/30 mx-auto" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">No orders placed yet</p>
              <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Explore the mango shop</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
