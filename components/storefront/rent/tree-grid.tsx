"use client";

import { TreeCard, type TreeProduct } from "@/components/storefront/cards/tree-card";
import { NoResults } from "@/components/ui/no-results";
import type { Database } from "@/types/database.types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { getAvailableTrees, type GetTreesOptions } from "@/actions/tree.actions";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

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
};

export function TreeGrid({ initialData, options }: Props) {
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["trees", options.filters, options.sort],
    queryFn: ({ pageParam = 1 }) => getAvailableTrees({ ...options, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => 
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialData: {
      pages: [initialData],
      pageParams: [1],
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allTrees = data?.pages.flatMap((page) => page.trees) || [];

  if (allTrees.length === 0) {
    return <NoResults />;
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {allTrees.map((tree) => {
          const photos = Array.isArray(tree.photos) && tree.photos.length > 0
            ? (tree.photos as string[])
            : ["/assets/images/placeholder.jpg"];

          const product: TreeProduct = {
            id: tree.id,
            title: `${tree.variety ?? "Alphonso"} Mango Tree`,
            price: tree.price ?? 0,
            images: photos,
            isSale: true,
          };

          return <TreeCard key={tree.id} product={product} />;
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
