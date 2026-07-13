"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LayoutDashboard, TreePine, ShoppingBag, UserCircle, LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/actions/auth.actions";
import { toast } from "sonner";
import type { AuthUser } from "@/lib/auth";

const LINKS = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/rentals", label: "My Trees", icon: TreePine },
  { href: "/account/orders", label: "Orders", icon: ShoppingBag },
  { href: "/account/profile", label: "Profile", icon: UserCircle },
];

export function ProfileDropdown({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initials = user.full_name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  function handleLogout() {
    startTransition(async () => {
      await logout();
      toast.success("Logged out successfully");
      router.push("/");
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center outline-none">
        <Avatar>
          <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name ?? "Account"} />
          <AvatarFallback>{initials || <UserCircle size={16} />}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate px-2 py-1.5 text-sm font-semibold text-foreground">
            {user.full_name ?? "My Account"}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {LINKS.map(({ href, label, icon: Icon }) => (
            <DropdownMenuItem
              key={href}
              className="cursor-pointer gap-2 rounded-lg"
              render={(props) => <Link {...props} href={href} className="flex w-full items-center gap-2" />}
            >
              <Icon size={14} />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isPending}
          onClick={handleLogout}
          className="cursor-pointer gap-2 rounded-lg"
        >
          <LogOut size={14} />
          {isPending ? "Logging out..." : "Log Out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
