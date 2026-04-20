"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  TreePine, 
  ShoppingBag, 
  Users, 
  BookOpen, 
  Image as ImageIcon, 
  Settings,
  History,
  TrendingUp,
  PackageCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Trees", href: "/admin/trees", icon: TreePine },
  { label: "Tree Rents", href: "/admin/rentals", icon: History },
  { label: "Products", href: "/admin/products", icon: ShoppingBag },
  { label: "Orders", href: "/admin/orders", icon: PackageCheck },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Journal", href: "/admin/blogs", icon: BookOpen },
  { label: "Landing Content", href: "/admin/content", icon: ImageIcon },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar hidden lg:flex flex-col p-4">
      <div className="flex items-center gap-3 px-2 py-6 mb-4">
        <div className="h-8 w-8 bg-primary flex items-center justify-center rounded-lg">
          <TrendingUp className="text-white" size={18} />
        </div>
        <span className="text-lg font-black tracking-tight text-foreground">
          TREE<span className="text-primary">KART</span> <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded ml-1">PRO</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all group",
                isActive 
                  ? "bg-primary/10 text-primary rounded-lg font-bold" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground rounded-lg"
              )}
            >
              <Icon 
                size={18} 
                className={cn(
                  "transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} 
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-2">
        <div className="bg-secondary/50 rounded-xl p-4 border border-border/40">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Signed in as</p>
          <p className="text-xs font-bold text-foreground truncate">Admin Console</p>
        </div>
      </div>
    </aside>
  );
}
