"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, CreditCard, ArrowRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import settings from "@/constants/settings";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
};

export function Footer() {
    return (
        <footer className="bg-muted pt-20 pb-10 border-t border-slate-200 mt-auto overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20 mb-20"
                >
                    {/* Explore */}
                    <motion.div variants={itemVariants} className="space-y-8">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Explore</h4>
                        <ul className="space-y-5">
                            <li><Link href="/rent" className="group flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors uppercase tracking-widest"><ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" /> Rent a Tree</Link></li>
                            <li><Link href="/store" className="group flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors uppercase tracking-widest"><ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" /> Shop Mangoes</Link></li>
                        </ul>
                    </motion.div>

                    {/* Information */}
                    <motion.div variants={itemVariants} className="space-y-8">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Information</h4>
                        <ul className="space-y-5">
                            <li><Link href="/about" className="group flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors uppercase tracking-widest"><ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" /> About Us</Link></li>
                            <li><Link href="/blog" className="group flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors uppercase tracking-widest"><ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" /> Our Blog</Link></li>
                            <li><Link href="/contact" className="group flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors uppercase tracking-widest"><ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" /> Contact Us</Link></li>
                        </ul>
                    </motion.div>

                    {/* Legal */}
                    <motion.div variants={itemVariants} className="space-y-8">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Trust & Privacy</h4>
                        <ul className="space-y-5">
                            <li><Link href="/privacy" className="group flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors uppercase tracking-widest"><ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" /> Privacy Policy</Link></li>
                            <li><Link href="/terms" className="group flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors uppercase tracking-widest"><ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" /> Terms of Service</Link></li>
                            <li><Link href="/delivery" className="group flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors uppercase tracking-widest"><ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" /> Shipping Policy</Link></li>
                        </ul>
                    </motion.div>

                    {/* Get In Touch */}
                    <motion.div variants={itemVariants} className="space-y-8">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Get In Touch</h4>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-4 group">
                                <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 transition-all group-hover:bg-primary group-hover:text-white shadow-sm">
                                    <Mail size={16} />
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Concierge Email</p>
                                    <Link href={`mailto:${settings.EMAIL}`} className="text-sm font-bold text-slate-900 hover:text-primary transition-colors">{settings.EMAIL}</Link>
                                </div>
                            </li>
                            <li className="flex items-start gap-4 group">
                                <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 transition-all group-hover:bg-primary group-hover:text-white shadow-sm">
                                    <Phone size={16} />
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Customer Support</p>
                                    <Link href={`tel:${settings.PHONE.split('/')[0].trim().replace(/\s+/g, '')}`} className="text-sm font-bold text-slate-900 hover:text-primary transition-colors">{settings.PHONE}</Link>
                                </div>
                            </li>
                            <li className="flex items-start gap-4 group">
                                <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 transition-all group-hover:bg-primary group-hover:text-white shadow-sm">
                                    <MapPin size={16} />
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">The Headquarters</p>
                                    <a
                                        href="https://maps.google.com/?q=Raja+Mahindra+Varam+Rajamahindra+yJunction+Mark+point"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-bold text-slate-900 hover:text-primary transition-colors"
                                    >
                                        {settings.ADDRESS}
                                    </a>
                                </div>
                            </li>
                        </ul>
                    </motion.div>
                </motion.div>

                {/* Bottom Bar */}
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="pt-10 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8"
                >
                    <Link href="/" className="transition-transform hover:scale-105">
                        <Image
                            src="/logo.webp"
                            alt="TreeKart Logo"
                            width={120}
                            height={40}
                            className="h-10 w-auto object-contain"
                            style={{ width: "auto" }}
                        />
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="h-8 w-12 rounded bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                            <CreditCard size={18} className="text-slate-400" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Payments</p>
                    </div>

                    <div className="text-center md:text-right space-y-1">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                            &copy; {new Date().getFullYear()} <span className="text-slate-900">TreeKart.in</span> — Cultivating Sustainable Futures
                        </p>
                        <p className="text-[9px] font-medium text-slate-300 uppercase tracking-widest">
                            Crafted with passion for the planet
                        </p>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
}
