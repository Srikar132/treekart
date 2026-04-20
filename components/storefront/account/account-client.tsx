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

type Tab = "dashboard" | "rentals" | "orders" | "profile";

interface AccountClientProps {
  user: any;
  rentals: any[];
  orders: any[];
}

export function AccountClient({ user, rentals, orders }: AccountClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
    <div className="py-12 md:py-20">
      {/* Header */}
      <div className="mb-12 space-y-2">
        <h1 className="text-4xl md:text-6xl font-black text-foreground uppercase tracking-tighter leading-none">
          Member<br />Portal
        </h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">
          Welcome back, {user.full_name?.split(' ')[0] || 'User'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap lg:whitespace-normal group border border-transparent",
                    isActive
                      ? "bg-primary text-white border-primary"
                      : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 1.5} className="shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.count !== undefined && (
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.5 font-bold",
                      isActive ? "bg-white/20" : "bg-secondary"
                    )}>
                      {item.count}
                    </span>
                  )}
                  <ChevronRight
                    size={12}
                    className={cn(
                      "hidden lg:block transition-transform duration-300",
                      isActive ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                    )}
                  />
                </button>
              );
            })}

            <Separator className="my-4 hidden lg:block bg-border/40" />

            <Dialog>
              <DialogTrigger
                render={
                  <button className="flex items-center gap-4 px-6 py-4 text-xs font-black uppercase tracking-widest text-destructive hover:bg-destructive/5 transition-all whitespace-nowrap lg:whitespace-normal">
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                }
              />
              <DialogContent className="rounded-none border-border max-w-[400px] p-8 bg-white ring-0">
                <DialogHeader className="space-y-4">
                  <div className="w-12 h-12 bg-destructive/10 flex items-center justify-center">
                    <LogOut className="text-destructive" size={24} />
                  </div>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight text-foreground">
                    Confirm Logout
                  </DialogTitle>
                  <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-relaxed">
                    Are you sure you want to terminate your session? You will need to sign in again to track your heritage trees.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-8 flex-col sm:flex-row gap-3 border-0 bg-transparent p-0">
                  <DialogClose 
                    render={
                      <Button 
                        variant="outline" 
                        className="flex-1 h-12 rounded-none border-border text-[10px] font-bold uppercase tracking-widest hover:bg-secondary transition-all"
                      >
                        Cancel
                      </Button>
                    }
                  />
                  <Button 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex-1 h-12 rounded-none bg-destructive text-white text-[10px] font-bold uppercase tracking-widest hover:bg-destructive/90 transition-all"
                  >
                    {isLoggingOut ? "Processing..." : "Yes, Logout"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-9">
          <div className="bg-white border border-border/60 p-6 md:p-10 shadow-sm min-h-[600px]">
            {activeTab === "dashboard" && <DashboardOverview user={user} rentals={rentals} orders={orders} onTabChange={setActiveTab} />}
            {activeTab === "rentals" && <RentalsList rentals={rentals} />}
            {activeTab === "orders" && <OrdersList orders={orders} />}
            {activeTab === "profile" && <ProfileSettings user={user} />}
          </div>
        </main>
      </div>
    </div>
  );
}
