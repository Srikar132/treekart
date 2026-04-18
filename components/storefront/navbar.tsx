"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, User, ShoppingBag } from "lucide-react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { SidebarTrigger } from "@/components/ui/sidebar";

const navLinks = [
    { name: "Rent Trees", href: "/rent" },
    { name: "Mango Shop", href: "/store" },
    { name: "Blog", href: "/blog" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
];

function NavContent() {
    return (
        <div className="container flex h-16 items-center justify-between">
            {/* Left: Menu Icon + Logo */}
            <div className="flex items-center gap-4 lg:gap-0">
                <div className="lg:hidden">
                    <SidebarTrigger className="text-foreground hover:text-primary transition-colors" />
                </div>
                <Link href="/" className="flex items-center">
                    <Image
                        src="/logo.png"
                        alt="TreeKart Logo"
                        width={280}
                        height={80}
                        quality={100}
                        className="h-8 lg:h-10 w-auto object-contain"
                        priority
                    />
                </Link>
            </div>

            {/* Desktop Center: Navigation Links */}
            <div className="hidden lg:flex items-center">
                <nav className="flex gap-8">
                    {navLinks.map((link) => (
                        <Link key={link.name} href={link.href} className="nav-link line-clamp-1">
                            {link.name}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
                <Tooltip>
                    <TooltipTrigger>
                        <div
                            className="text-foreground hover:text-primary transition-colors cursor-pointer"
                            aria-label="Search"
                        >
                            <Search className="w-5 h-5 lg:w-[22px] lg:h-[22px]" strokeWidth={1.5} />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={5}>
                        <p>Search</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger>
                        <Link
                            href="/account"
                            className="text-foreground hover:text-primary transition-colors inline-flex items-center"
                        >
                            <User className="w-5 h-5 lg:w-[22px] lg:h-[22px]" strokeWidth={1.5} />
                            <span className="sr-only">Account</span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={5}>
                        <p>Account</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger>
                        <Link
                            href="/cart"
                            className="relative text-foreground hover:text-primary transition-colors inline-flex items-center"
                        >
                            <ShoppingBag className="w-5 h-5 lg:w-[22px] lg:h-[22px]" strokeWidth={1.5} />
                            <span className="absolute -top-1.5 -right-2 flex h-4 w-4 lg:h-[18px] lg:w-[18px] items-center justify-center rounded-full bg-primary text-[9px] lg:text-[10px] font-bold text-primary-foreground">
                                0
                            </span>
                            <span className="sr-only">Cart</span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={5}>
                        <p>Cart</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
}

export function Navbar() {
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        // When scrolled past 250px, the fixed blurred navbar slides in
        if (latest > 250) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }
    });

    return (
        <>
            {/* Normal Navbar - sits at the top and scrolls away naturally */}
            <header className="relative z-40 w-full bg-background border-b">
                <NavContent />
            </header>

            {/* Sticky Animated Navbar - slides from top with backdrop blur */}
            <AnimatePresence>
                {isScrolled && (
                    <motion.header
                        initial={{ y: "-100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-100%" }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed top-0 left-0 right-0 z-50 w-full bg-background/80 backdrop-blur-md shadow-sm border-b"
                    >
                        <NavContent />
                    </motion.header>
                )}
            </AnimatePresence>
        </>
    );
}