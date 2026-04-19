import { getMangoProducts, type ProductSortOption } from "@/actions/products.actions";
import { ProductGrid } from "@/components/storefront/shop/product-grid";
import { ProductFilters } from "@/components/storefront/shop/product-filters";
import { ProductSort } from "@/components/storefront/shop/product-sort";
import type { Database } from "@/types/database.types";

type ProductBadge = Database["public"]["Enums"]["product_badge"];
type ProductStatus = Database["public"]["Enums"]["product_status"];

type SearchParams = {
  badge?: string;
  status?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function StorePage({ searchParams }: Props) {
  const params = await searchParams;

  const activeBadges = params.badge
    ? (params.badge.split(",").filter(Boolean) as ProductBadge[])
    : [];
    
  const activeStatuses = params.status
    ? (params.status.split(",").filter(Boolean) as ProductStatus[])
    : [];

  const options = {
    filters: {
      badge: activeBadges.length > 0 ? activeBadges : undefined,
      status: activeStatuses.length > 0 ? activeStatuses : undefined,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    },
    sort: (params.sort as ProductSortOption) || "newest",
    page: params.page ? Number(params.page) : 1,
    limit: 12,
  };

  const initialData = await getMangoProducts(options);

  return (
    <main className="section container">
      <div className="section-header text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Mango Store</h1>
        <p className="text-xl max-w-2xl mx-auto text-muted-foreground">
          Premium organic mangoes picked fresh from our farms, delivered to your door.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Toolbar: Filters and Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b">
          <ProductFilters 
            activeBadges={activeBadges} 
            activeStatuses={activeStatuses}
            activeMinPrice={options.filters.minPrice}
            activeMaxPrice={options.filters.maxPrice}
          />
          <ProductSort activeSort={options.sort} />
        </div>

        {/* Results Info */}
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{initialData.products.length}</span> of <span className="font-semibold text-foreground">{initialData.totalCount}</span> products
        </div>

        {/* Grid and Infinite Scroll */}
        <ProductGrid initialData={initialData} options={options} />
      </div>
    </main>
  );
}
