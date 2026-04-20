"use client";

import { Bell, Search, UserCircle, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AdminNavbar() {
  return (
    <header className="h-16 border-b border-border bg-card sticky top-0 z-40 flex items-center justify-between px-4 md:px-8">
      {/* Mobile Toggle */}
      <button className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors">
        <Menu size={20} />
      </button>

      {/* Global Search */}
      <div className="hidden md:flex relative w-96 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
        <Input 
          placeholder="Global Search..." 
          className="pl-10 h-10 bg-secondary/50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-primary/20 rounded-lg text-xs"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" className="relative rounded-lg hover:bg-secondary">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-card" />
        </Button>
        
        <div className="h-8 w-px bg-border mx-1" />
        
        <button className="flex items-center gap-3 p-1 hover:bg-secondary rounded-lg transition-all group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-foreground">Krishna Vamsi</p>
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
