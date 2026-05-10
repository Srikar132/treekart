"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import { AnimatedButton } from "@/components/shared/animated-button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Database } from "@/types/database.types";

type ProductBadge = Database["public"]["Enums"]["product_badge"];
type ProductStatus = Database["public"]["Enums"]["product_status"];

const BADGES: { value: ProductBadge; label: string }[] = [
  { value: "Pre-Order", label: "Pre-Order" },
  { value: "Sale", label: "Sale" },
  { value: "New", label: "New" },
];

const STATUSES: { value: ProductStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "pre_order", label: "Pre-Order" },
  { value: "out_of_stock", label: "Out of Stock" },
];

const MAX_PRICE = 5000;

type Props = {
  activeBadges: ProductBadge[];
  activeStatuses: ProductStatus[];
  activeMinPrice?: number;
  activeMaxPrice?: number;
};

export function ProductFilters({
  activeBadges,
  activeStatuses,
  activeMinPrice,
  activeMaxPrice,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  // Local state for sliders so they update immediately while dragging
  const [priceRange, setPriceRange] = useState([
    activeMinPrice || 0,
    activeMaxPrice || MAX_PRICE,
  ]);

  // Sync sliders if props change externally
  useEffect(() => {
    setPriceRange([activeMinPrice || 0, activeMaxPrice || MAX_PRICE]);
  }, [activeMinPrice, activeMaxPrice]);

  const updateParams = useCallback(
    (updates: { key: string; value: string | null }[]) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const { key, value } of updates) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  function toggleBadge(badge: ProductBadge) {
    const current = new Set(activeBadges);
    if (current.has(badge)) {
      current.delete(badge);
    } else {
      current.add(badge);
    }
    updateParams([
      { key: "badge", value: current.size > 0 ? Array.from(current).join(",") : null },
    ]);
  }

  function toggleStatus(status: ProductStatus) {
    const current = new Set(activeStatuses);
    if (current.has(status)) {
      current.delete(status);
    } else {
      current.add(status);
    }
    updateParams([
      { key: "status", value: current.size > 0 ? Array.from(current).join(",") : null },
    ]);
  }

  function clearAll() {
    startTransition(() => {
      router.push(pathname);
      setIsOpen(false);
    });
  }

  const hasActiveFilters =
    activeBadges.length > 0 ||
    activeStatuses.length > 0 ||
    activeMinPrice ||
    activeMaxPrice;

  const ActivePills = () => (
    <>
      {activeBadges.map((b) => (
        <button
          key={b}
          onClick={() => toggleBadge(b)}
          className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-destructive/10 hover:text-destructive border border-primary/20 transition-colors"
        >
          {b} <X size={12} />
        </button>
      ))}
      {activeStatuses.map((s) => (
        <button
          key={s}
          onClick={() => toggleStatus(s)}
          className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-destructive/10 hover:text-destructive border border-primary/20 transition-colors"
        >
          {s} <X size={12} />
        </button>
      ))}
      {(activeMinPrice || activeMaxPrice) && (
        <button
          onClick={() =>
            updateParams([
              { key: "minPrice", value: null },
              { key: "maxPrice", value: null },
            ])
          }
          className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-destructive/10 hover:text-destructive border border-primary/20 transition-colors"
        >
          ₹{activeMinPrice || 0} - ₹{activeMaxPrice || `${MAX_PRICE}+`} <X size={12} />
        </button>
      )}
    </>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Top bar trigger & active filters */}
      <div className="flex items-center gap-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger
            render={
              <AnimatedButton
                label={
                  <div className="flex items-center gap-2">
                    Filter
                    {hasActiveFilters && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                        {(activeBadges.length > 0 ? 1 : 0) +
                          (activeStatuses.length > 0 ? 1 : 0) +
                          (activeMinPrice || activeMaxPrice ? 1 : 0)}
                      </span>
                    )}
                  </div>
                }
                icon={isPending ? <Loader2 size={16} className="animate-spin" /> : <SlidersHorizontal size={16} />}
                className="h-10 border-sidebar-border px-4"
                fillClassName="bg-primary"
                hoverTextClassName="hover:text-primary-foreground"
                hideArrow
              />
            }
          />
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader className="mb-6">
              <SheetTitle className="flex items-center justify-between">
                <span>Filters</span>
                {hasActiveFilters ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive mr-7"
                  >
                    Clear all
                  </Button>
                ) : null}
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-8 px-4 pb-4">
              {/* Badge */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold tracking-wider uppercase text-foreground">
                  Product Type
                </h4>
                <div className="space-y-3">
                  {BADGES.map((badge) => (
                    <div key={badge.value} className="flex items-center gap-3">
                      <Checkbox
                        id={`badge-${badge.value}`}
                        checked={activeBadges.includes(badge.value)}
                        onCheckedChange={() => toggleBadge(badge.value)}
                      />
                      <Label
                        htmlFor={`badge-${badge.value}`}
                        className="flex-1 cursor-pointer flex items-center justify-between"
                      >
                        <span className="text-sm font-medium">{badge.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Status */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold tracking-wider uppercase text-foreground">
                  Availability
                </h4>
                <div className="space-y-3">
                  {STATUSES.map((status) => (
                    <div key={status.value} className="flex items-center gap-3">
                      <Checkbox
                        id={`status-${status.value}`}
                        checked={activeStatuses.includes(status.value)}
                        onCheckedChange={() => toggleStatus(status.value)}
                      />
                      <Label
                        htmlFor={`status-${status.value}`}
                        className="flex-1 cursor-pointer flex items-center justify-between"
                      >
                        <span className="text-sm font-medium">{status.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Price range */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold tracking-wider uppercase text-foreground">
                    Price Range
                  </h4>
                  <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded">
                    ₹{priceRange[0]} -{" "}
                    {priceRange[1] >= MAX_PRICE ? `₹${MAX_PRICE}+` : `₹${priceRange[1]}`}
                  </span>
                </div>
                <Slider
                  value={priceRange}
                  onValueChange={(vals) => setPriceRange(vals as number[])}
                  onValueCommitted={(vals) => {
                    const v = vals as number[];
                    updateParams([
                      {
                        key: "minPrice",
                        value: v[0] > 0 ? String(v[0]) : null,
                      },
                      {
                        key: "maxPrice",
                        value: v[1] < MAX_PRICE ? String(v[1]) : null,
                      },
                    ]);
                  }}
                  max={MAX_PRICE}
                  step={100}
                  className="w-full"
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Active filter pills inline next to button on desktop */}
        {hasActiveFilters ? (
          <div className="hidden sm:flex items-center flex-wrap gap-2">
            <span className="text-sm text-muted-foreground mr-1">Active:</span>
            <ActivePills />
            <button
               onClick={clearAll}
               className="text-sm underline text-muted-foreground hover:text-foreground ml-2"
             >
               Clear All
             </button>
           </div>
         ) : null}
       </div>
 
       {/* Mobile active pills */}
       {hasActiveFilters ? (
         <div className="flex sm:hidden items-center flex-wrap gap-2">
           <ActivePills />
         </div>
       ) : null}
     </div>
   );
 }
