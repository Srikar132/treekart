"use client";

import { UserCircle } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CommandPalette } from "@/components/admin/command-palette";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function AdminNavbar() {
  return (
    <header className="h-16 border-b border-border bg-card sticky top-0 z-40 flex items-center justify-between px-4 md:px-8">
      {/* Mobile Toggle & Command Palette */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-2 lg:hidden" />
        <CommandPalette />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <ThemeToggle />

        <div className="h-8 w-px bg-border mx-1" />

        <button className="flex items-center gap-3 p-1 hover:bg-secondary rounded-lg transition-all group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-foreground">Admin</p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Root Administrator</p>
          </div>
          <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-colors">
            <UserCircle size={20} />
          </div>
        </button>
      </div>
    </header>
  );
}
