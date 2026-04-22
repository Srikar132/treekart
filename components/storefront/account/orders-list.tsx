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
      <div className="flex flex-col items-center justify-center py-32 space-y-8 text-center animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center shadow-inner">
          <ShoppingBag size={40} className="text-slate-200" />
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">No orders placed yet</h3>
          <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
            You haven't purchased any fresh mangoes yet. Our seasonal harvest is waiting for you to taste the heritage.
          </p>
        </div>
        <Link 
          href="/store" 
          className="h-14 px-10 bg-primary text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          Shop Fresh Mangoes <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return <CheckCircle2 size={16} className="text-primary" />;
      case "shipped": return <Truck size={16} className="text-blue-600" />;
      case "pending": return <Clock size={16} className="text-amber-600" />;
      default: return <Package size={16} className="text-slate-400" />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return "bg-primary/10 text-primary";
      case "shipped": return "bg-blue-50 text-blue-600";
      case "pending": return "bg-amber-50 text-amber-600";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Order History</h2>
        <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-500 border-0 text-[10px] font-black px-4 py-1">
          {orders.length} {orders.length === 1 ? 'Transaction' : 'Transactions'}
        </Badge>
      </div>

      <div className="rounded-[2rem] border border-slate-100 overflow-hidden bg-white shadow-sm">
        <div className="hidden md:grid grid-cols-12 gap-4 px-10 py-6 bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <div className="col-span-3">Order ID</div>
          <div className="col-span-3">Date</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Details</div>
        </div>

        <div className="divide-y divide-slate-100">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="grid grid-cols-1 md:grid-cols-12 gap-4 px-10 py-10 md:py-8 items-center hover:bg-slate-50/50 transition-all group"
            >
              {/* Order ID */}
              <div className="col-span-3 space-y-2">
                <p className="text-sm font-black text-slate-900 tracking-tight">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <div className="flex items-center gap-2">
                  <Package size={12} className="text-slate-300" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Mango Store
                  </span>
                </div>
              </div>

              {/* Date */}
              <div className="col-span-3">
                <p className="text-sm font-bold text-slate-600">
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>

              {/* Amount */}
              <div className="col-span-2">
                <p className="text-lg font-black text-slate-900 tracking-tight">
                  ₹{order.total_amount.toLocaleString()}
                </p>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <Badge className={`rounded-full border-0 text-[10px] font-black uppercase px-4 py-1 flex items-center w-fit gap-2 ${getStatusStyles(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </Badge>
              </div>

              {/* Action */}
              <div className="col-span-2 flex justify-end">
                <Link 
                  href={`/account/orders/${order.id}`}
                  className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm"
                >
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support Box */}
      <div className="p-10 rounded-[2.5rem] bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-slate-200 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/30 transition-all duration-1000" />
        
        <div className="space-y-2 text-center md:text-left relative z-10">
          <p className="text-xl font-black tracking-tight">Need help with an order?</p>
          <p className="text-sm font-medium text-slate-400">Our customer concierge is available to assist you with tracking or returns.</p>
        </div>
        <Link 
          href="/contact"
          className="h-14 px-10 bg-white text-slate-900 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-primary hover:text-white transition-all shadow-xl relative z-10 flex items-center justify-center shrink-0"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
