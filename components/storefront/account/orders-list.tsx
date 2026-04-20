"use client";

import Link from "next/link";
import { ShoppingBag, ArrowRight, Package, Truck, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OrdersListProps {
  orders: any[];
}

export function OrdersList({ orders }: OrdersListProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center">
        <div className="w-20 h-20 bg-secondary/20 flex items-center justify-center">
          <ShoppingBag size={32} className="text-muted-foreground/40" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-foreground uppercase tracking-tight">No Orders Yet</h3>
          <p className="text-xs text-muted-foreground uppercase tracking-widest max-w-xs mx-auto">
            You haven't purchased any fresh mangoes yet. Our seasonal harvest is waiting for you.
          </p>
        </div>
        <Link 
          href="/store" 
          className="h-12 px-8 bg-primary text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 transition-all"
        >
          Shop Fresh Mangoes <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return <CheckCircle2 size={12} className="text-primary" />;
      case "shipped": return <Truck size={12} className="text-blue-600" />;
      case "pending": return <Clock size={12} className="text-amber-600" />;
      default: return <Package size={12} className="text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-foreground">Order History</h2>
        <Badge variant="outline" className="rounded-none text-[8px] font-bold uppercase tracking-widest px-3">
          {orders.length} TRANSACTIONS
        </Badge>
      </div>

      <div className="border border-border/60">
        <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 bg-secondary/5 border-b border-border text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          <div className="col-span-3">Order Details</div>
          <div className="col-span-3">Date</div>
          <div className="col-span-2">Total</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        <div className="divide-y divide-border/40">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="grid grid-cols-1 md:grid-cols-12 gap-4 px-8 py-8 md:py-6 items-center hover:bg-secondary/5 transition-colors group"
            >
              {/* Order ID & Type */}
              <div className="col-span-3 space-y-1">
                <p className="text-xs font-black text-foreground uppercase tracking-tight">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <div className="flex items-center gap-2">
                  <Package size={10} className="text-muted-foreground" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    Mango Harvest Order
                  </span>
                </div>
              </div>

              {/* Date */}
              <div className="col-span-3">
                <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>

              {/* Total */}
              <div className="col-span-2">
                <p className="text-xs font-black text-foreground">
                  ₹{order.total_amount.toLocaleString()}
                </p>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="col-span-2 flex justify-end">
                <Link 
                  href={`/account/orders/${order.id}`}
                  className="p-2 border border-border group-hover:border-primary group-hover:text-primary transition-all"
                >
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support Box */}
      <div className="p-8 bg-secondary/10 border border-border/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <p className="text-xs font-black text-foreground uppercase tracking-tight">Need help with an order?</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Our customer concierge is available 24/7</p>
        </div>
        <button className="h-12 px-8 border border-primary text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary/5 transition-all">
          Contact Support
        </button>
      </div>
    </div>
  );
}
