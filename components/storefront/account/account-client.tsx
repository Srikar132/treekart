"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  TreePine,
  ShoppingBag,
  UserCircle,
  LogOut,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState<string>("dashboard");

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

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-10 md:mb-16 space-y-4 px-2 md:px-0">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight">
          Member <span className="text-primary italic">Portal</span>
        </h1>
        <div className="flex items-center gap-3">
          <div className="h-1 w-8 rounded-full bg-primary" />
          <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
            Welcome back, {user.full_name?.split(' ')[0] || 'User'} • Your Orchard is waiting
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-4">
          <TabsList variant="line" className="h-auto p-0 gap-8 justify-start overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <TabsTrigger
                  key={item.id}
                  value={item.id}
                  className="data-active:text-primary rounded-none h-14 px-0 flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 transition-all hover:text-slate-900 after:bg-primary"
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  {item.count !== undefined && (
                    <span className="ml-1 text-[8px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      {item.count}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <Dialog>
            <DialogTrigger
              render={
                <button className="h-10 px-6 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/5 transition-all flex items-center gap-2 w-fit">
                  <LogOut size={14} />
                  <span>Logout Session</span>
                </button>
              }
            />
            <DialogContent className="border-slate-100 max-w-[440px] p-10 bg-white ring-0 shadow-2xl">
              <DialogHeader className="space-y-6">
                <div className="w-16 h-16 bg-destructive/10 rounded-[1.5rem] flex items-center justify-center">
                  <LogOut className="text-destructive" size={28} />
                </div>
                <div className="space-y-2">
                  <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">
                    Confirm Logout
                  </DialogTitle>
                  <DialogDescription className="text-sm font-medium text-slate-500 leading-relaxed">
                    Are you sure you want to end your session? You'll need to sign in again to access your orchard dashboard and updates.
                  </DialogDescription>
                </div>
              </DialogHeader>
              <DialogFooter className="mt-10 flex-col sm:flex-row gap-4 border-0 bg-transparent p-0">
                <DialogClose
                  render={
                    <Button
                      variant="outline"
                      className="flex-1 h-14 rounded-2xl border-slate-200 text-sm font-bold hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </Button>
                  }
                />
                <Button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex-1 h-14 rounded-2xl bg-destructive text-white text-sm font-bold hover:bg-destructive/90 transition-all shadow-lg shadow-destructive/20"
                >
                  {isLoggingOut ? "Processing..." : "Yes, Logout"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700">
          <TabsContent value="dashboard" className="m-0 border-0 p-0 shadow-none">
            <DashboardOverview user={user} rentals={rentals} orders={orders} onTabChange={(tab: any) => setActiveTab(tab)} />
          </TabsContent>
          <TabsContent value="rentals" className="m-0 border-0 p-0 shadow-none">
            <RentalsList rentals={rentals} />
          </TabsContent>
          <TabsContent value="orders" className="m-0 border-0 p-0 shadow-none">
            <OrdersList orders={orders} />
          </TabsContent>
          <TabsContent value="profile" className="m-0 border-0 p-0 shadow-none">
            <ProfileSettings user={user} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
