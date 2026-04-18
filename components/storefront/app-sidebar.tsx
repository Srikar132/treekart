"use client";

import Link from "next/link";
import { Home, Store, Package, FileText, FolderOpen, User, Heart } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
    {
        title: "Home",
        icon: Home,
        url: "/",
    },
    {
        title: "Mango Shop",
        icon: Store,
        url: "/store",
    },
    {
        title: "Rent Trees",
        icon: Package,
        url: "/products",
    },
    {
        title: "Blog",
        icon: FileText,
        url: "/blog",
    },
    {
        title: "About Us",
        icon: FileText,
        url: "/about",
    },
    {
        title: "Contact",
        icon: FileText,
        url: "/contact",
    },
];

export function AppSidebar() {
    return (
        <Sidebar variant="floating" >
            <SidebarContent>

                {/* Logo Section */}
                <div className="px-6 py-8">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl font-bold tracking-tight text-primary">
                            Treekart
                        </span>
                    </Link>
                </div>

                {/* Navigation Menu */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-2 px-3">
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        className="h-12 px-4 text-[15px] font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                                    >
                                        <Link href={item.url} className="flex items-center gap-3">
                                            <item.icon className="w-5 h-5" strokeWidth={1.8} />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

            </SidebarContent>

            {/* Footer with Login & Wishlist */}
            <SidebarFooter className="border-t p-4 w-full">
                <div className="flex items-center w-full gap-3">
                    <Link
                        href="/login"
                        className="flex items-center w-full gap-2 px-4 py-2.5 rounded-md border border-sidebar-border hover:bg-sidebar-accent transition-colors text-sm font-medium"
                    >
                        <User className="w-4 h-4" strokeWidth={2} />
                        <span>Login</span>
                    </Link>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}