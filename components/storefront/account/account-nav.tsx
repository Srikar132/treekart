"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, TreePine, ShoppingBag, UserCircle, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth.actions";
import { toast } from "sonner";

interface AccountNavProps {
  rentalsCount: number;
  ordersCount: number;
}

export function AccountNav({ rentalsCount, ordersCount }: AccountNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const items = [
    { href: "/account", label: "Overview", icon: LayoutDashboard },
    { href: "/account/rentals", label: "My Trees", icon: TreePine, count: rentalsCount },
    { href: "/account/orders", label: "Orders", icon: ShoppingBag, count: ordersCount },
    { href: "/account/profile", label: "Profile", icon: UserCircle },
  ];

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to log out");
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="flex w-full items-center gap-3 overflow-hidden">
      <nav className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
        {items.map(({ href, label, icon: Icon, count }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex h-12 shrink-0 items-center gap-2 rounded-2xl border-2 px-4 text-xs font-black uppercase tracking-widest transition-all ${
                active
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-slate-100 text-slate-500 hover:border-slate-200 hover:text-slate-900"
              }`}
            >
              <Icon size={16} />
              {label}
              {count !== undefined && (
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold text-slate-400">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <Dialog>
        <DialogTrigger
          render={
            <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-100 text-slate-400 shadow-sm transition-all hover:border-destructive/20 hover:bg-destructive/5 hover:text-destructive">
              <LogOut size={17} />
            </button>
          }
        />
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-none border-slate-100 bg-white p-8 shadow-2xl ring-0 sm:max-w-[400px]">
          <DialogHeader className="space-y-6">
            <div className="flex h-14 w-14 items-center justify-center bg-destructive/10">
              <LogOut className="text-destructive" size={24} />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">
                Confirm Logout
              </DialogTitle>
              <DialogDescription className="text-sm font-medium leading-relaxed text-slate-500">
                Are you sure you want to end your session?
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-8 flex flex-col gap-3 sm:flex-row-reverse">
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="h-14 w-full rounded-none bg-destructive text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-destructive/20 transition-all hover:bg-destructive/90 sm:flex-1"
            >
              {isLoggingOut ? "Processing..." : "Yes, Logout"}
            </Button>
            <DialogClose
              render={
                <Button
                  variant="ghost"
                  className="h-14 w-full rounded-none text-xs font-black uppercase tracking-widest text-slate-400 sm:flex-1"
                >
                  Cancel
                </Button>
              }
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
