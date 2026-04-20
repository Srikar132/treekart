"use client";

import { CheckCircle2, Loader2, type LucideIcon } from "lucide-react";
import { AnimatedButton } from "@/components/shared/animated-button";

// ── PROCESSING STAGE ──────────────────────────────────────────────

export function CheckoutProcessing({ 
  title = "Processing Harvest", 
  message = "Verifying payment and securing your order..." 
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <Loader2 size={48} className="animate-spin text-primary mx-auto" strokeWidth={1} />
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
            {title}
          </p>
          <p className="text-sm text-muted-foreground italic">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── SUCCESS STAGE ─────────────────────────────────────────────────

interface SuccessItem {
  icon: LucideIcon;
  title: string;
  text: string;
}

interface CheckoutSuccessProps {
  title: string;
  subtitle: string;
  description: string;
  items: SuccessItem[];
  primaryActionLabel: string;
  onPrimaryAction: () => void;
  secondaryActionLabel: string;
  onSecondaryAction: () => void;
}

export function CheckoutSuccess({
  title,
  subtitle,
  description,
  items,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
}: CheckoutSuccessProps) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-xl w-full text-center space-y-10 animate-in fade-in zoom-in duration-700">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-none bg-primary/10 flex items-center justify-center mx-auto border border-primary/20">
            <CheckCircle2 size={48} className="text-primary" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-none" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tight">
            {title}
          </h1>
          <p className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-bold">
            {subtitle}
          </p>
          <div className="h-px w-20 bg-primary mx-auto my-6" />
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {items.map(({ icon: Icon, title, text }) => (
            <div key={title} className="p-5 bg-white border border-border/50 space-y-2">
              <div className="flex items-center gap-2">
                <Icon size={16} className="text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">{title}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 pt-6">
          <AnimatedButton
            label={primaryActionLabel}
            onClick={onPrimaryAction}
            className="w-full h-14 bg-primary text-primary-foreground border-transparent"
            fillClassName="bg-white"
            hoverTextClassName="hover:text-primary"
          />
          <button
            onClick={onSecondaryAction}
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
          >
            {secondaryActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
