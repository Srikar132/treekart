"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  TreePine,
  ShoppingBag,
  Users,
  Settings,
  Package,
  FileText,
  Search,
  Command as CommandIcon
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex relative items-center gap-2 w-96 px-3 h-10 bg-secondary/50 border border-transparent hover:border-primary/20 hover:bg-white dark:hover:bg-slate-800/50 transition-all rounded-lg text-xs text-muted-foreground group"
      >
        <Search size={16} className="group-hover:text-primary transition-colors" />
        <span className="flex-1 text-left">Search or jump to...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="General">
            <CommandItem onSelect={() => runCommand(() => router.push("/admin"))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/admin/settings"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Inventory & Management">
            <CommandItem onSelect={() => runCommand(() => router.push("/admin/trees"))}>
              <TreePine className="mr-2 h-4 w-4" />
              <span>Trees Management</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/admin/products"))}>
              <Package className="mr-2 h-4 w-4" />
              <span>Products & Harvests</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/admin/rentals"))}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Rental Contracts</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/admin/orders"))}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              <span>Orders History</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Users & Content">
            <CommandItem onSelect={() => runCommand(() => router.push("/admin/users"))}>
              <Users className="mr-2 h-4 w-4" />
              <span>Customers & Staff</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/admin/blogs"))}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Blog Articles</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/admin/content"))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Storefront Content</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
