"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface CheckoutHeaderProps {
  title: string;
  backLabel: string;
  onBack?: () => void;
}

export function CheckoutHeader({ title, backLabel, onBack }: CheckoutHeaderProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <button
        onClick={onBack || (() => router.back())}
        className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
      >
        <ChevronLeft size={14} className="transition-transform group-hover:-translate-x-1" />
        {backLabel}
      </button>
      <h1 className="text-4xl font-black text-foreground uppercase tracking-tight">
        {title}
      </h1>
    </div>
  );
}
