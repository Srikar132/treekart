"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, CreditCard } from "lucide-react";
import { BsInstagram, BsTwitter, BsFacebook } from "react-icons/bs";
import { motion, type Variants } from "framer-motion";

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
        <footer className="bg-muted/30 pt-16 pb-8 border-t border-border mt-auto overflow-hidden">
            <div className="container">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-16"
                >
                    {/* Explore */}
                    <motion.div variants={itemVariants}>
                        <h4 className="mb-6">Explore</h4>
                        <ul className="space-y-4 p-sm">
                            <li><Link href="/rent" className="hover:text-primary transition-colors font-medium">Rent a Tree</Link></li>
                            <li><Link href="/store" className="hover:text-primary transition-colors font-medium">Shop Mangoes</Link></li>
                            <li><Link href="/trees" className="hover:text-primary transition-colors">Our Farms & Trees</Link></li>
                        </ul>
                    </motion.div>

                    {/* Information */}
                    <motion.div variants={itemVariants}>
                        <h4 className="mb-6">Information</h4>
                        <ul className="space-y-4 p-sm">
                            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="/blog" className="hover:text-primary transition-colors">Our Blog</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                        </ul>
                    </motion.div>

                    {/* Support & Account */}
                    <motion.div variants={itemVariants}>
                        <h4 className="mb-6">Support</h4>
                        <ul className="space-y-4 p-sm">
                            <li><Link href="/login" className="hover:text-primary transition-colors">Your Account</Link></li>
                            <li><Link href="/delivery" className="hover:text-primary transition-colors">Delivery Information</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
                        </ul>
                    </motion.div>

                    {/* Follow Us */}
                    <motion.div variants={itemVariants}>
                        <h4 className="mb-6">Follow Us</h4>
                        <ul className="space-y-4 p-sm mb-6">
                            <li className="flex items-center gap-3">
                                <Phone className="w-4 h-4 shrink-0 text-primary" />
                                <div className="flex flex-col">
                                    <span>+91 99122 17619</span>
                                    <span>+91 98480 62600</span>
                                </div>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4 shrink-0 text-primary" />
                                <span>treekart.in@gmail.com</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                                <span>Rajamundry, Andhra Pradesh, India</span>
                            </li>
                        </ul>
                        <div className="flex gap-3">
                            <Link href="#" className="flex items-center justify-center w-10 h-10 rounded-full border border-border hover:border-primary hover:text-primary transition-colors">
                                <BsTwitter className="w-4 h-4" />
                            </Link>
                            <Link href="#" className="flex items-center justify-center w-10 h-10 rounded-full border border-border hover:border-primary hover:text-primary transition-colors">
                                <BsFacebook className="w-4 h-4" />
                            </Link>
                            <Link href="#" className="flex items-center justify-center w-10 h-10 rounded-full border border-border hover:border-primary hover:text-primary transition-colors">
                                <BsInstagram className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Newsletters */}
                    {/* <motion.div variants={itemVariants}>
                        <h4 className="mb-6">Newsletters</h4>
                        <p className="p-sm mb-4">
                            Be the first who learns about our great promotions!
                        </p>
                        <form className="flex w-full mt-2" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Enter your email..."
                                className="flex-1 min-w-0 bg-background border border-border focus:border-primary outline-none px-4 py-3 text-sm rounded-l-md transition-colors"
                                required
                            />
                            <button
                                type="submit"
                                className="bg-foreground text-background px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors rounded-r-md"
                            >
                                Submit
                            </button>
                        </form>
                    </motion.div> */}
                </motion.div>

                {/* Bottom Bar */}
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-2">
                        {/* Dummy Logo for footer */}
                        <span className="text-xl font-black tracking-tighter text-primary">
                            TreeKart.
                        </span>
                    </div>

                    <div className="flex gap-4 text-muted-foreground">
                        <CreditCard className="w-8 h-6" />
                    </div>

                    <div className="p-xs text-center md:text-right">
                        &copy; Copyright {new Date().getFullYear()} | <span className="font-semibold text-foreground">TreeKart</span>. Powered by Next.js.
                    </div>
                </motion.div>
            </div>
        </footer>
    );
}
