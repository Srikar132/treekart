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
import type { Database, TreePlan } from "@/types/database.types";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "rented", label: "Rented" },
];

const MAX_PRICE = 15000;
const MAX_AGE = 50;

type Props = {
  activePlans: string[];
  treePlans: TreePlan[];
  activeMinPrice?: number;
  activeMaxPrice?: number;
  activeMinAge?: number;
  activeMaxAge?: number;
  activeStatus?: string[];
};

export function TreeFilters({
  activePlans,
  treePlans = [],
  activeMinPrice,
  activeMaxPrice,
  activeMinAge,
  activeMaxAge,
  activeStatus = ["available"],
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
  const [ageRange, setAgeRange] = useState([
    activeMinAge || 0,
    activeMaxAge || MAX_AGE,
  ]);

  // Sync sliders if props change externally (like clearing all or clicking a pill)
  useEffect(() => {
    setPriceRange([activeMinPrice || 0, activeMaxPrice || MAX_PRICE]);
  }, [activeMinPrice, activeMaxPrice]);

  useEffect(() => {
    setAgeRange([activeMinAge || 0, activeMaxAge || MAX_AGE]);
  }, [activeMinAge, activeMaxAge]);

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

  function togglePlan(plan: string) {
    const current = new Set(activePlans);
    if (current.has(plan)) {
      current.delete(plan);
    } else {
      current.add(plan);
    }
    updateParams([
      { key: "plan", value: current.size > 0 ? Array.from(current).join(",") : null },
    ]);
  }

  function toggleStatus(status: string) {
    const current = new Set(activeStatus);
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
    activePlans.length > 0 ||
    activeMinPrice ||
    activeMaxPrice ||
    activeMinAge ||
    activeMaxAge ||
    (activeStatus.length > 0 && !(activeStatus.length === 1 && activeStatus[0] === "available"));

  const ActivePills = () => (
    <>
      {activePlans.map((pId) => {
        const planName = treePlans.find(tp => tp.id === pId)?.name || pId;
        return (
        <button
          key={pId}
          onClick={() => togglePlan(pId)}
          className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-destructive/10 hover:text-destructive border border-primary/20 transition-colors"
        >
          {planName} <X size={12} />
        </button>
      )})}
      {activeStatus.filter(s => s !== 'available').map((s) => (
        <button
          key={s}
          onClick={() => toggleStatus(s)}
          className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-destructive/10 hover:text-destructive border border-primary/20 transition-colors capitalize"
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
      {(activeMinAge || activeMaxAge) && (
        <button
          onClick={() =>
            updateParams([
              { key: "minAge", value: null },
              { key: "maxAge", value: null },
            ])
          }
          className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-destructive/10 hover:text-destructive border border-primary/20 transition-colors"
        >
          Age: {activeMinAge || 0}-{activeMaxAge || `${MAX_AGE}+`} yrs <X size={12} />
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
                        {(activePlans.length > 0 ? 1 : 0) +
                          (activeMinPrice || activeMaxPrice ? 1 : 0) +
                          (activeMinAge || activeMaxAge ? 1 : 0) +
                          (activeStatus.length > 0 && !(activeStatus.length === 1 && activeStatus[0] === "available") ? 1 : 0)}
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
              {/* Plan type */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold tracking-wider uppercase text-foreground">
                  Plan Type
                </h4>
                <div className="space-y-3">
                  {treePlans.filter(p => p.is_active).map((plan) => (
                    <div key={plan.id} className="flex items-center gap-3">
                      <Checkbox
                        id={`plan-${plan.id}`}
                        checked={activePlans.includes(plan.id)}
                        onCheckedChange={() => togglePlan(plan.id)}
                      />
                      <Label
                        htmlFor={`plan-${plan.id}`}
                        className="flex-1 cursor-pointer flex items-center justify-between"
                      >
                        <span className="text-sm font-medium">{plan.name}</span>
                        {plan.badge_text && (
                          <span className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded">
                            {plan.badge_text}
                          </span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Status type */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold tracking-wider uppercase text-foreground">
                  Status
                </h4>
                <div className="space-y-3">
                  {STATUS_OPTIONS.map((status) => (
                    <div key={status.value} className="flex items-center gap-3">
                      <Checkbox
                        id={`status-${status.value}`}
                        checked={activeStatus.includes(status.value)}
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
                  step={500}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Age range */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold tracking-wider uppercase text-foreground">
                    Tree Age
                  </h4>
                  <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded">
                    {ageRange[0]} -{" "}
                    {ageRange[1] >= MAX_AGE ? `${MAX_AGE}+ yrs` : `${ageRange[1]} yrs`}
                  </span>
                </div>
                <Slider
                  value={ageRange}
                  onValueChange={(vals) => setAgeRange(vals as number[])}
                  onValueCommitted={(vals) => {
                    const v = vals as number[];
                    updateParams([
                      {
                        key: "minAge",
                        value: v[0] > 0 ? String(v[0]) : null,
                      },
                      {
                        key: "maxAge",
                        value: v[1] < MAX_AGE ? String(v[1]) : null,
                      },
                    ]);
                  }}
                  max={MAX_AGE}
                  step={1}
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
