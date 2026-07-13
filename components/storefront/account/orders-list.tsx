"use client";

import Link from "next/link";
import { ShoppingBag, ArrowRight, Package, Truck, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/types/database.types";

interface OrdersListProps {
  orders: Order[];
}

export function OrdersList({ orders }: OrdersListProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center  space-y-6 sm:space-y-8 text-center animate-in fade-in zoom-in duration-700 px-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center shadow-inner">
          <ShoppingBag size={36} className="text-slate-200" />
        </div>
        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">No orders placed yet</h3>
          <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
            You haven&apos;t purchased any fresh mangoes yet. Our seasonal harvest is waiting for you.
          </p>
        </div>
        <Link
          href="/store"
          className="h-12 sm:h-14 px-8 sm:px-10 bg-primary text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          Shop Fresh Mangoes <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return <CheckCircle2 size={14} className="text-primary" />;
      case "shipped": return <Truck size={14} className="text-blue-600" />;
      case "pending": return <Clock size={14} className="text-amber-600" />;
      default: return <Package size={14} className="text-slate-400" />;
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
    <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Order History</h2>
        <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-500 border-0 text-[10px] font-black px-3 py-1">
          {orders.length} {orders.length === 1 ? "Transaction" : "Transactions"}
        </Badge>
      </div>

      {/* Desktop table header — hidden on mobile */}
      <div className="rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 overflow-hidden bg-white shadow-sm">
        <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <div className="col-span-3">Order ID</div>
          <div className="col-span-3">Date</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Details</div>
        </div>

        <div className="divide-y divide-slate-100">
          {orders.map((order) => (
            <div key={order.id} className="group hover:bg-slate-50/50 transition-all">
              {/* Mobile card layout */}
              <div className="flex md:hidden items-center gap-4 px-5 py-5">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-black text-slate-900 tracking-tight">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <Badge className={`rounded-full border-0 text-[9px] font-black uppercase px-3 py-0.5 flex items-center gap-1.5 shrink-0 ${getStatusStyles(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-400">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-base font-black text-slate-900 tracking-tight">
                      ₹{order.total_amount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="h-10 w-10 shrink-0 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm"
                >
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Desktop row layout */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-7 items-center">
                <div className="col-span-3 space-y-1.5">
                  <p className="text-sm font-black text-slate-900 tracking-tight">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <div className="flex items-center gap-2">
                    <Package size={11} className="text-slate-300" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Mango Store
                    </span>
                  </div>
                </div>
                <div className="col-span-3">
                  <p className="text-sm font-bold text-slate-600">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-lg font-black text-slate-900 tracking-tight">
                    ₹{order.total_amount.toLocaleString()}
                  </p>
                </div>
                <div className="col-span-2">
                  <Badge className={`rounded-full border-0 text-[10px] font-black uppercase px-4 py-1 flex items-center w-fit gap-2 ${getStatusStyles(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </Badge>
                </div>
                <div className="col-span-2 flex justify-end">
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="h-11 w-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm"
                  >
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support Box */}
      <div className="p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 shadow-2xl shadow-slate-200 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/30 transition-all duration-1000" />
        <div className="space-y-2 text-center sm:text-left relative z-10">
          <p className="text-lg sm:text-xl font-black tracking-tight">Need help with an order?</p>
          <p className="text-xs sm:text-sm font-medium text-slate-400">
            Our customer concierge is available to assist you with tracking or returns.
          </p>
        </div>
        <Link
          href="/contact"
          className="h-12 sm:h-14 px-8 sm:px-10 bg-white text-slate-900 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-primary hover:text-white transition-all shadow-xl relative z-10 flex items-center justify-center shrink-0 w-full sm:w-auto"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}