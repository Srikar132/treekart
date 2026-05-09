import { Suspense } from "react";
import { RelatedProductsCarousel } from "./related-products-carousel";
import { MangoProduct } from "@/types/database.types";
import { Skeleton } from "@/components/ui/skeleton";

interface RelatedProductsProps {
  productsPromise: Promise<{ products: MangoProduct[] }>;
}

export function RelatedProducts({ productsPromise }: RelatedProductsProps) {
  return (
    <Suspense fallback={<RelatedProductsSkeleton />}>
      <RelatedProductsInner productsPromise={productsPromise} />
    </Suspense>
  );
}

async function RelatedProductsInner({ productsPromise }: RelatedProductsProps) {
  const { products } = await productsPromise;
  return <RelatedProductsCarousel products={products} />;
}

function RelatedProductsSkeleton() {
  return (
    <section className="space-y-10 py-10">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <Skeleton className="h-5 w-48 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    </section>
  );
}