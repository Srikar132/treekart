import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, ArrowLeft, ShieldCheck } from "lucide-react";

export default function CheckoutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen  flex flex-col">
            <header className="bg-white border-b border-border/50">
                <div className="max-w-5xl mx-auto h-20 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-3 group transition-transform active:scale-95">
                            <Image
                                src="/logo.webp"
                                alt="TreeKart Logo"
                                width={180}
                                height={50}
                                className="h-7 w-auto object-contain"
                                priority
                            />
                        </Link>
                        <div className="hidden md:flex items-center gap-2 text-muted-foreground">
                            <div className="h-4 w-px bg-border" />
                            <ShieldCheck size={14} className="text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Secure Checkout</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="hidden lg:flex flex-col items-end">
                            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Concierge Support</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">+91 98480 62600</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Checkout Footer */}
            <footer className="border-t border-border/40 py-10 bg-white">
                <div className="container">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <Link href="/terms" className="hover:text-foreground transition-colors underline decoration-border underline-offset-4">Terms</Link>
                            <Link href="/privacy" className="hover:text-foreground transition-colors underline decoration-border underline-offset-4">Privacy</Link>
                            <Link href="/contact" className="hover:text-foreground transition-colors underline decoration-border underline-offset-4">Support</Link>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60 italic">Razorpay Secure</span>
                            <div className="h-4 w-px bg-border" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                © {new Date().getFullYear()} TreeKart Orchard
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}