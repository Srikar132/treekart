"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductSortOption } from "@/actions/products.actions";

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: "newest", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "weight_asc", label: "Weight: Low to High" },
  { value: "weight_desc", label: "Weight: High to Low" },
];

export function ProductSort({ activeSort }: { activeSort: ProductSortOption }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function onSortChange(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden sm:inline-block text-sm text-muted-foreground font-medium">Sort by:</span>
      <Select value={activeSort} onValueChange={onSortChange} disabled={isPending}>
        <SelectTrigger className="w-[180px] bg-background">
          {/* SelectValue can only read a label off a mounted SelectItem, which
              only exists once the popup has opened at least once — on first
              load (e.g. reloading a URL with ?sort=price_asc already set) it
              falls back to the raw value. Map the label explicitly instead. */}
          <SelectValue>
            {(value: string) => SORT_OPTIONS.find((opt) => opt.value === value)?.label ?? value}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
