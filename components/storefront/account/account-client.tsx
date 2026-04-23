"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  TreePine,
  ShoppingBag,
  UserCircle,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  SelectValue,
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
    { id: "rentals" as Tab, label: "Tree Rentals", icon: TreePine, count: rentals.length },
    { id: "orders" as Tab, label: "Mango Orders", icon: ShoppingBag, count: orders.length },
    { id: "profile" as Tab, label: "Profile Settings", icon: UserCircle },
  ];

  const currentTab = navItems.find(item => item.id === activeTab) || navItems[0];
  const CurrentIcon = currentTab.icon;

  return (
    <div className="w-full max-w-7xl mx-auto overflow-x-hidden pb-20 px-4 md:px-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 md:mb-20">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none break-words uppercase">
            Member <span className="text-primary italic font-serif lowercase">Portal</span>
          </h1>
          <div className="flex items-center gap-3">
            <div className="h-1 w-8 rounded-full bg-primary shrink-0" />
            <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] truncate">
              Welcome back, {user.full_name?.split(' ')[0] || 'User'} • Your Orchard is waiting
            </p>
          </div>
        </div>

        {/* Unified Navigation - Select Only */}
        <div className="flex items-center gap-4 w-full md:w-fit">
          <Select value={activeTab} onValueChange={(val) => val && setActiveTab(val as Tab)}>
            <SelectTrigger className="w-full md:w-[280px] h-14 rounded-2xl border-2 border-slate-100 bg-white px-6 focus:ring-primary/20 transition-all shadow-sm">
              <div className="flex items-center gap-3">
                <CurrentIcon size={20} className="text-primary" />
                <span className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-900">
                  {currentTab.label}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2 bg-white min-w-[280px]">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SelectItem 
                    key={item.id} 
                    value={item.id}
                    className="rounded-xl py-4 focus:bg-primary/5 focus:text-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider">
                          {item.label}
                        </span>
                        {item.count !== undefined && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400 font-bold">
                            {item.count}
                          </span>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Logout Button */}
          <Dialog>
            <DialogTrigger
              render={
                <button className="h-14 w-14 shrink-0 rounded-2xl border-2 border-slate-100 text-slate-400 hover:text-destructive hover:bg-destructive/5 hover:border-destructive/20 transition-all flex items-center justify-center shadow-sm">
                  <LogOut size={20} />
                </button>
              }
            />
            <DialogContent className="border-slate-100 max-w-[calc(100vw-2rem)] sm:max-w-[400px] p-8 bg-white ring-0 shadow-2xl rounded-[2.5rem] mx-4">
              <DialogHeader className="space-y-6">
                <div className="w-16 h-16 bg-destructive/10 rounded-[1.5rem] flex items-center justify-center">
                  <LogOut className="text-destructive" size={28} />
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
              <DialogFooter className="mt-8 flex flex-col gap-3">
                <Button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full h-14 rounded-2xl bg-destructive text-white text-xs font-black uppercase tracking-widest hover:bg-destructive/90 transition-all shadow-lg shadow-destructive/20"
                >
                  {isLoggingOut ? "Processing..." : "Yes, Logout"}
                </Button>
                <DialogClose
                  render={
                    <Button
                      variant="ghost"
                      className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400"
                    >
                      Cancel
                    </Button>
                  }
                />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content Area - Conditional Rendering */}
      <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-[400px]">
        {activeTab === "dashboard" && (
          <DashboardOverview 
            user={user} 
            rentals={rentals} 
            orders={orders} 
            onTabChange={(tab: any) => setActiveTab(tab)} 
          />
        )}
        {activeTab === "rentals" && (
          <RentalsList rentals={rentals} />
        )}
        {activeTab === "orders" && (
          <OrdersList orders={orders} />
        )}
        {activeTab === "profile" && (
          <ProfileSettings user={user} />
        )}
      </div>
    </div>
  );
}