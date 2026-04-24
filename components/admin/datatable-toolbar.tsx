// components/admin/data-table-toolbar.tsx
"use client";

import { useQueryStates, parseAsString } from "nuqs";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface FilterOption { label: string; value: string; }

interface DataTableToolbarProps {
    searchPlaceholder?: string;
    filters?: {
        key: string;
        placeholder: string;
        options: FilterOption[];
    }[];
}

export function DataTableToolbar({ searchPlaceholder = "Search...", filters = [] }: DataTableToolbarProps) {
    const [isPending, startTransition] = useTransition();

    const [params, setParams] = useQueryStates(
        {
            q: parseAsString.withDefault(""),
            page: parseAsString.withDefault("1"),
            status: parseAsString.withDefault(""),
            plan_type: parseAsString.withDefault(""),
            season: parseAsString.withDefault(""),
            badge: parseAsString.withDefault(""),
            role: parseAsString.withDefault(""),
        },
        { startTransition, shallow: false }
    );

    const debouncedSearch = useDebouncedCallback((value: string) => {
        setParams({ q: value || null, page: "1" });
    }, 300);

    const hasActiveFilters = params.q !== "" || params.status !== "" || params.plan_type !== "" || params.season !== "" || params.badge !== "" || params.role !== "";

    return (
        <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 group">
                <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                    size={16}
                />
                <Input
                    defaultValue={params.q}
                    onChange={(e) => debouncedSearch(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="pl-10 h-12 bg-card border-border focus-visible:ring-primary/20 rounded-xl text-xs font-medium"
                />
            </div>

            {/* Dynamic filter selects */}
            {filters.map((filter) => (
                <Select
                    key={filter.key}
                    value={(params as any)[filter.key] || ""}
                    onValueChange={(v) => setParams({ [filter.key]: v || null, page: "1" } as any)}
                >
                    <SelectTrigger className="h-12 min-w-[176px] rounded-xl border-border text-xs font-bold uppercase tracking-widest bg-card">
                        <SelectValue placeholder={filter.placeholder} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border shadow-xl">
                        <SelectItem value="" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{filter.placeholder}</SelectItem>
                        {filter.options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-xs font-bold uppercase tracking-tight">{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ))}

            {/* Clear filters */}
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    onClick={() => setParams({ q: null, page: null, status: null, plan_type: null, season: null, badge: null, role: null })}
                    className="h-12 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X size={14} className="mr-1" /> Clear
                </Button>
            )}
        </div>
    );
}
