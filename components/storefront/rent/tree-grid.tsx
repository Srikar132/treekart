"use client";

import { TreeCard } from "@/components/storefront/cards/tree-card";
import { NoResults } from "@/components/ui/no-results";
import type { Database } from "@/types/database.types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import type { GetTreesOptions } from "@/actions/tree.actions";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

async function fetchTrees(options: GetTreesOptions, page: number) {
  const p = new URLSearchParams();
  p.set("page", String(page));
  if (options.limit) p.set("limit", String(options.limit));
  if (options.sort) p.set("sort", options.sort);
  if (options.excludeId) p.set("excludeId", options.excludeId);
  if (options.filters?.planId?.length) p.set("planId", options.filters.planId.join(","));
  if (options.filters?.status?.length) p.set("status", options.filters.status.join(","));
  if (options.filters?.minPrice !== undefined) p.set("minPrice", String(options.filters.minPrice));
  if (options.filters?.maxPrice !== undefined) p.set("maxPrice", String(options.filters.maxPrice));
  if (options.filters?.minAge !== undefined) p.set("minAge", String(options.filters.minAge));
  if (options.filters?.maxAge !== undefined) p.set("maxAge", String(options.filters.maxAge));
  const res = await fetch(`/api/trees?${p}`);
  if (!res.ok) throw new Error("Failed to fetch trees");
  return res.json() as Promise<{ trees: TreeRow[]; totalCount: number; page: number; limit: number; totalPages: number }>;
}

type TreeRow = Database["public"]["Tables"]["trees"]["Row"] & {
  farmers: {
    id: string;
    farm_name: string | null;
    location: string | null;
    is_organic: boolean | null;
    profile_id: string | null;
  } | null;
};

type Props = {
  initialData: {
    trees: TreeRow[];
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  options: GetTreesOptions;
  rentalDeliveryFee: number;
};

export function TreeGrid({ initialData, options, rentalDeliveryFee }: Props) {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
  } = useInfiniteQuery({
    queryKey: ["trees", options.filters, options.sort],
    queryFn: ({ pageParam = 1 }) => fetchTrees(options, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialData: {
      pages: [initialData],
      pageParams: [1],
    },
    staleTime: 3600_000,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allTrees = data?.pages.flatMap((page) => page.trees) || [];

  if (isError) return (
    <div className="text-center py-20 text-muted-foreground">
      <p className="font-bold">Failed to load trees. Please refresh.</p>
    </div>
  );

  if (allTrees.length === 0) {
    return <NoResults
      title="No trees available"
      description="Available trees will appear here once they are listed by our farmers or as soon as they are in season."
    />;
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {allTrees.map((tree) => {
          return <TreeCard key={tree.id} tree={tree} rentalDeliveryFee={rentalDeliveryFee} />;
        })}
      </div>

      {/* Infinite Scroll Trigger */}
      <div ref={ref} className="flex justify-center py-8">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading more trees...</span>
          </div>
        )}
        {!hasNextPage && allTrees.length > 0 && (
          <p className="text-sm text-muted-foreground">You&apos;ve reached the end of the catalog.</p>
        )}
      </div>
    </div>
  );
}
