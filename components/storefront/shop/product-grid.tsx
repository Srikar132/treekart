"use client";

import { ProductCard, type MangoProduct } from "@/components/storefront/cards/product-card";
import { NoResults } from "@/components/ui/no-results";
import { useMangoCart } from "@/store/use-mango-cart";
import { useCallback, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { getMangoProducts, type GetProductsOptions } from "@/actions/products.actions";
import { Loader2 } from "lucide-react";

type Props = {
  initialData: {
    products: MangoProduct[];
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  options: GetProductsOptions;
};

export function ProductGrid({ initialData, options }: Props) {
  const { add, openCart } = useMangoCart();
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["products", options.filters, options.sort],
    queryFn: ({ pageParam = 1 }) => getMangoProducts({ ...options, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => 
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialData: {
      pages: [initialData],
      pageParams: [1],
    },
  });

  const handleAddToCart = useCallback((product: MangoProduct) => {
    const firstImage = product.image_url?.[0] || "/placeholder-mango.png";
    const firstWeight = product.weight_kg?.[0] || 1;

    add({
      id: product.id,
      name: product.name,
      variety: product.variety,
      price: product.price * firstWeight,
      pricePerKg: product.price,
      imageUrl: firstImage,
      badge: product.badge,
      weightKg: firstWeight,
      qty: 1
    });
    
    openCart();
  }, [add, openCart]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allProducts = data?.pages.flatMap((page) => page.products) || [];

  if (allProducts.length === 0) {
    return <NoResults />;
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {allProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={() => handleAddToCart(product)}
          />
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      <div ref={ref} className="flex justify-center py-8">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading more products...</span>
          </div>
        )}
        {!hasNextPage && allProducts.length > 0 && (
          <p className="text-sm text-muted-foreground">You&apos;ve reached the end of the catalog.</p>
        )}
      </div>
    </div>
  );
}
