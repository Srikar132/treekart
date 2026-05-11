"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Home, Store, Package, Newspaper, Info, Phone, User, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { type User as SupabaseUser } from "@supabase/supabase-js";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
    useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const menuItems = [
    {
        title: "Home",
        icon: Home,
        url: "/",
    },
    {
        title: "Mango Store",
        icon: Store,
        url: "/store",
    },
    {
        title: "Rent Trees",
        icon: Package,
        url: "/rent",
    },
    {
        title: "Blog",
        icon: Newspaper,
        url: "/blog",
    },
    {
        title: "About Us",
        icon: Info,
        url: "/about",
    },
    {
        title: "Contact",
        icon: Phone,
        url: "/contact",
    },
];

export function AppSidebar() {
    const { setOpenMobile } = useSidebar();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };


        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);


    const handleClose = () => {
        setOpenMobile(false);
    };

    return (
        <Sidebar variant="floating">
            <SidebarContent>
                {/* Header with Logo and Close Button */}
                <div className="flex items-center justify-between px-6 py-8">
                    <Link href="/" onClick={handleClose} className="flex items-center gap-2">
                        <span className="text-2xl font-bold tracking-tight text-primary">
                            Treekart
                        </span>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden -mr-2"
                        onClick={handleClose}
                    >
                        <X className="w-5 h-5" />
                        <span className="sr-only">Close Sidebar</span>
                    </Button>
                </div>

                {/* Navigation Menu */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-2 px-3">
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        render={<Link href={item.url} onClick={handleClose} className="flex items-center gap-3" />}
                                        className="h-12 px-4 text-[15px] font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                                    >
                                        <item.icon className="w-5 h-5" strokeWidth={1.8} />
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

            </SidebarContent>

            {/* Footer with Login or Account */}
            <SidebarFooter className="border-t p-4 w-full">
                <div className="flex items-center w-full gap-3">
                    <Link
                        href={user ? "/account" : "/auth/signin"}
                        onClick={handleClose}
                        className="flex items-center w-full gap-2 px-4 py-2.5 rounded-md border border-sidebar-border hover:bg-sidebar-accent transition-colors text-sm font-medium"
                    >
                        <User className="w-4 h-4" strokeWidth={2} />
                        <span>{user ? "Account" : "Login"}</span>
                    </Link>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}