"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { 
  LayoutDashboard,
  TreePine,
  ShoppingBag,
  Users,
  BookOpen,
  Image as ImageIcon,
  TrendingUp,
  PackageCheck,
  History,
  LogOut,
  Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
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
import { toast } from "sonner";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Trees", href: "/admin/trees", icon: TreePine },
  { label: "Tree Rents", href: "/admin/rentals", icon: History },
  { label: "Products", href: "/admin/products", icon: ShoppingBag },
  { label: "Orders", href: "/admin/orders", icon: PackageCheck },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Journal", href: "/admin/blogs", icon: BookOpen },
  { label: "Landing Content", href: "/admin/content", icon: ImageIcon },
  { label: "Settings", href: "/admin/settings", icon: Settings2 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success("Admin session ended");
      router.push("/admin/auth/login");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to log out");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="h-16 flex flex-row items-center px-6 border-b border-sidebar-border/50">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="h-8 w-8 bg-sidebar-primary flex items-center justify-center rounded-lg shadow-lg shadow-sidebar-primary/20">
            <TrendingUp className="text-sidebar-primary-foreground" size={18} />
          </div>
          <span className="text-lg font-black tracking-tight text-sidebar-foreground uppercase">
            TREE<span className="text-sidebar-primary">KART</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-black text-sidebar-foreground/50 uppercase tracking-widest mb-4 px-4">Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      className={cn(
                        "h-11 px-4 transition-all duration-300 rounded-xl",
                        isActive 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm shadow-sidebar-primary/5" 
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                      render={
                        <Link href={item.href} className="flex items-center gap-3 w-full">
                          <item.icon size={18} className={cn("shrink-0", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70")} />
                          <span className="font-black uppercase text-[10px] tracking-widest">{item.label}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border/50 space-y-4">
        <div className="bg-sidebar-accent/50 rounded-2xl p-4 border border-sidebar-border/40 backdrop-blur-sm">
          <p className="text-[10px] font-black text-sidebar-foreground/50 uppercase tracking-widest mb-1">Identity</p>
          <p className="text-xs font-black text-sidebar-foreground truncate uppercase">Root Admin</p>
          <div className="mt-3 h-1 w-full bg-sidebar-border/40 rounded-full overflow-hidden">
            <div className="h-full w-full bg-sidebar-primary rounded-full" />
          </div>
        </div>

        <Dialog>
            <DialogTrigger 
                render={
                    <button className="w-full flex items-center gap-3 px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/5 rounded-xl transition-all border border-transparent hover:border-destructive/10">
                        <LogOut size={16} />
                        Logout Session
                    </button>
                }
            />
            <DialogContent className="max-w-[400px] rounded-2xl border-border shadow-2xl">
                <DialogHeader className="space-y-4">
                    <div className="h-12 w-12 bg-destructive/10 flex items-center justify-center rounded-xl text-destructive mb-2">
                        <LogOut size={24} />
                    </div>
                    <div className="space-y-1">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">End Session</DialogTitle>
                        <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                            Are you sure you want to exit the management portal?
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <DialogFooter className="flex gap-3 mt-6">
                    <DialogClose 
                        render={
                            <Button variant="outline" className="flex-1 rounded-xl h-12 text-[10px] font-black uppercase tracking-widest border-border">
                                Cancel
                            </Button>
                        }
                    />
                    <Button 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex-1 rounded-xl h-12 bg-destructive text-white hover:bg-destructive/90 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-destructive/20"
                    >
                        {isLoggingOut ? "Ending..." : "Confirm Exit"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </SidebarFooter>
    </Sidebar>
  );
}
