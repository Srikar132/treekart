"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Check, LogIn, X } from "lucide-react";
import { useGuestPromo } from "@/store/use-guest-promo";
import { createClient } from "@/utils/supabase/client";
import { Dialog, DialogContent, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AnimatedButton } from "@/components/shared/animated-button";

const PROMO_DELAY_MS = 10_000;
const SHOWN_KEY = "treekart-guest-promo-shown";

const BENEFITS = ["Save your favorites", "Get exclusive discounts", "Faster checkout"];

export function GuestPromoDialog() {
  const { isOpen, open, close } = useGuestPromo();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/auth") || sessionStorage.getItem(SHOWN_KEY)) return;

    const timer = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) return;

      sessionStorage.setItem(SHOWN_KEY, "1");
      open();
    }, PROMO_DELAY_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = () => {
    close();
    router.push(`/auth/signin?redirectTo=${encodeURIComponent(pathname)}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent
        className="flex flex-col md:flex-row gap-0 overflow-hidden rounded-2xl border border-border/40 bg-card p-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] sm:max-w-[800px] animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500 ease-out"
        showCloseButton={false}
      >
        <DialogClose className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-black/40 md:bg-border/50 md:text-muted-foreground md:hover:bg-border md:hover:text-foreground">
          <X size={16} strokeWidth={2.5} />
          <span className="sr-only">Close</span>
        </DialogClose>

        {/* Left side: Image */}
        <div className="relative h-[220px] w-full shrink-0 md:h-auto md:w-5/12">
          <Image
            src="/images/featured_mango_orchard.webp"
            alt="TreeKart mango orchard"
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
          />
          {/* Gradient overlay for mobile text contrast, and side-gradient on desktop for smooth blend */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none md:bg-gradient-to-r md:from-black/10 md:via-transparent md:to-transparent" />

          {/* Title inside image for mobile */}
          <div className="absolute inset-x-0 bottom-0 p-7 pointer-events-none md:hidden">
            <DialogTitle className="font-heading text-[28px] font-bold tracking-tight text-white drop-shadow-md">
              Welcome to TreeKart 👋
            </DialogTitle>
          </div>
        </div>

        {/* Right side: Content */}
        <div className="flex w-full flex-col justify-center space-y-7 p-8 md:w-7/12 md:p-10">
          <DialogTitle className="hidden font-heading text-3xl font-bold tracking-tight text-foreground md:block">
            Welcome to TreeKart 👋
          </DialogTitle>

          <DialogDescription className="text-[15px] leading-relaxed text-muted-foreground">
            You&apos;re browsing as a guest. Sign in to unlock the full premium experience:
          </DialogDescription>

          <ul className="space-y-4">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3.5 text-[15px] font-medium text-foreground">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20 shadow-sm">
                  <Check size={14} strokeWidth={3} />
                </span>
                {benefit}
              </li>
            ))}
          </ul>

          <AnimatedButton
            onClick={handleLogin}
            label="Log In / Sign Up"
            icon={<LogIn size={18} />}
            className="h-14 w-full rounded-2xl border-transparent bg-primary text-base font-bold tracking-wide text-white shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl hover:shadow-primary/30"
            fillClassName="bg-mango"
            hoverTextClassName="hover:text-foreground"
          />

          <div className="flex items-center gap-4">
            <span className="h-px flex-1 bg-border/60" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Or</span>
            <span className="h-px flex-1 bg-border/60" />
          </div>

          <button
            type="button"
            onClick={close}
            className="w-full text-center text-[13px] font-bold uppercase tracking-widest text-muted-foreground transition-all hover:text-primary hover:underline underline-offset-4"
          >
            Continue as Guest
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
