"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  TreePine,
  ShoppingBag,
  UserCircle,
  LogOut
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DashboardOverview } from "@/components/storefront/account/dashboard-overview";
import { RentalsList } from "@/components/storefront/account/rentals-list";
import { OrdersList } from "@/components/storefront/account/orders-list";
import { ProfileSettings } from "@/components/storefront/account/profile-settings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

type Tab = "dashboard" | "rentals" | "orders" | "profile";

interface AccountClientProps {
  user: any;
  rentals: any[];
  orders: any[];
}

export function AccountClient({ user, rentals, orders }: AccountClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
      router.push("/");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to log out");
    } finally {
      setIsLoggingOut(false);
    }
  }

  const navItems = [
    { id: "dashboard" as Tab, label: "Overview", icon: LayoutDashboard },
    { id: "rentals" as Tab, label: "My Trees", icon: TreePine, count: rentals.length },
    { id: "orders" as Tab, label: "Orders", icon: ShoppingBag, count: orders.length },
    { id: "profile" as Tab, label: "Profile", icon: UserCircle },
  ];

  const currentTab = navItems.find(item => item.id === activeTab) ?? navItems[0];
  const CurrentIcon = currentTab.icon;

  return (
    /*
     * TWO-LAYER overflow guard:
     *  1. Tailwind class  — works for Tailwind-aware tooling / SSR
     *  2. inline style    — hard browser override; wins over any cascade
     * Both are needed because a parent `section` with no overflow constraint
     * can still allow a child to scroll horizontally even if that child says
     * overflow-hidden, because overflow-hidden only clips visually when the
     * CONTAINING BLOCK is also constrained.
     */
    <div
      className="w-full max-w-full overflow-x-hidden pb-16"
      style={{ overflowX: "hidden", maxWidth: "100vw" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5 mb-10 md:mb-16">

          {/* Title block */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none uppercase">
              Member <span className="text-primary italic font-serif lowercase">Portal</span>
            </h1>
            {/* overflow:hidden + white-space:nowrap + text-overflow:ellipsis
                applied via inline style — Tailwind `truncate` alone can lose
                the battle when a grand-parent has implicit width */}
            <div className="flex items-center gap-3" style={{ overflow: "hidden" }}>
              {/* <div className="h-1 w-8 rounded-full bg-primary shrink-0" /> */}
              <p
                className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]"
                style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                Welcome back, {user.full_name?.split(" ")[0] ?? "User"} · Your Orchard is waiting
              </p>
            </div>
          </div>

          {/* ── Nav row ──────────────────────────────────────────── */}
          {/*
            Rule summary:
              • Row:    display:flex, width:100%, overflow:hidden
              • Select: flex:1, minWidth:0  → lets it shrink past its content size
              • Trigger: width:100%         → fills the flex-1 div exactly
              • Button:  flexShrink:0, fixed px width → never grows
          */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", overflow: "hidden" }}>

            {/* Select wrapper — minWidth:0 is the critical rule */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <Select value={activeTab} onValueChange={(v) => v && setActiveTab(v as Tab)}>
                <SelectTrigger
                  style={{ width: "100%", height: 48 }}
                  className="rounded-2xl border-2 border-slate-100 bg-white px-4 focus:ring-primary/20 transition-all shadow-sm"
                >
                  {/* Inner label — same min-width:0 + overflow treatment */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, overflow: "hidden" }}>
                    <CurrentIcon size={17} className="text-primary" style={{ flexShrink: 0 }} />
                    <span
                      className="text-xs font-black uppercase tracking-widest text-slate-900"
                      style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {currentTab.label}
                    </span>
                    {currentTab.count !== undefined && (
                      <span
                        className="text-[8px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400 font-bold"
                        style={{ flexShrink: 0 }}
                      >
                        {currentTab.count}
                      </span>
                    )}
                  </div>
                </SelectTrigger>

                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2 bg-white">
                  {navItems.map(({ id, label, icon: Icon, count }) => (
                    <SelectItem key={id} value={id} className="rounded-xl py-3 focus:bg-primary/5 focus:text-primary">
                      <div className="flex items-center gap-3">
                        <Icon size={15} className="shrink-0" />
                        <span className="text-xs font-black uppercase tracking-wider">{label}</span>
                        {count !== undefined && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400 font-bold">
                            {count}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dialog>
              <DialogTrigger render={
                <button
                  style={{ width: 48, height: 48, flexShrink: 0 }}
                  className="rounded-2xl border-2 border-slate-100 text-slate-400 hover:text-destructive hover:bg-destructive/5 hover:border-destructive/20 transition-all flex items-center justify-center shadow-sm"
                >
                  <LogOut size={17} />
                </button>
              }
              />

              <DialogContent className="border-slate-100 max-w-[calc(100vw-2rem)] sm:max-w-[400px] p-8 bg-white ring-0 shadow-2xl rounded-none">
                <DialogHeader className="space-y-6">
                  <div className="w-14 h-14 bg-destructive/10 flex items-center justify-center">
                    <LogOut className="text-destructive" size={24} />
                  </div>
                  <div className="space-y-2">
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                      Confirm Logout
                    </DialogTitle>
                    <DialogDescription className="text-sm font-medium text-slate-500 leading-relaxed">
                      Are you sure you want to end your session?
                    </DialogDescription>
                  </div>
                </DialogHeader>
                <DialogFooter className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
                  <Button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full sm:flex-1 h-14 rounded-none bg-destructive text-white text-xs font-black uppercase tracking-widest hover:bg-destructive/90 transition-all shadow-lg shadow-destructive/20"
                  >
                    {isLoggingOut ? "Processing..." : "Yes, Logout"}
                  </Button>
                  <DialogClose render={
                    <Button variant="ghost" className="w-full sm:flex-1 h-14 rounded-none text-xs font-black uppercase tracking-widest text-slate-400">
                      Cancel
                    </Button>
                  } />
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* ── Content ────────────────────────────────────────────── */}
        <div className="animate-in overflow-x-hidden fade-in slide-in-from-bottom-4 duration-700 min-h-[400px]">
          {activeTab === "dashboard" && (
            <DashboardOverview user={user} rentals={rentals} orders={orders} onTabChange={(tab: any) => setActiveTab(tab)} />
          )}
          {activeTab === "rentals" && <RentalsList rentals={rentals} />}
          {activeTab === "orders" && <OrdersList orders={orders} />}
          {activeTab === "profile" && <ProfileSettings user={user} />}
        </div>

      </div>
    </div>
  );
}