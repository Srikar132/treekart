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
import type { TreeSortOption } from "@/actions/tree.actions";

const SORT_OPTIONS: { value: TreeSortOption; label: string }[] = [
  { value: "newest", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "age_asc", label: "Youngest trees" },
  { value: "age_desc", label: "Oldest trees" },
];

export function TreeSort({ activeSort }: { activeSort: TreeSortOption }) {
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
          <SelectValue />
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
