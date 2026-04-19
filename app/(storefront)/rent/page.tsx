import { getAvailableTrees, type TreeSortOption } from "@/actions/tree.actions";
import { TreeGrid } from "@/components/storefront/rent/tree-grid";
import { TreeFilters } from "@/components/storefront/rent/tree-filters";
import { TreeSort } from "@/components/storefront/rent/tree-sort";
import { type Database } from "@/types/database.types";

type PlanType = Database["public"]["Enums"]["plan_type"];

type SearchParams = {
  plan?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  minAge?: string;
  maxAge?: string;
  page?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function RentPage({ searchParams }: Props) {
  const params = await searchParams;

  const planTypes = params.plan
    ? (params.plan.split(",").filter(Boolean) as PlanType[])
    : [];

  const options = {
    filters: {
      planType: planTypes.length > 0 ? planTypes : undefined,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      minAge: params.minAge ? Number(params.minAge) : undefined,
      maxAge: params.maxAge ? Number(params.maxAge) : undefined,
    },
    sort: (params.sort as TreeSortOption) || "newest",
    page: params.page ? Number(params.page) : 1,
    limit: 12,
  };

  const initialData = await getAvailableTrees(options);

  return (
    <main className="section container">
      <div className="section-header text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Rent a Mango Tree</h1>
        <p className="text-xl max-w-2xl mx-auto text-muted-foreground">
          Pick your tree, track its growth, get mangoes delivered right to your door.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Toolbar: Filters and Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b">
          <TreeFilters
            activePlans={planTypes}
            activeMinPrice={options.filters.minPrice}
            activeMaxPrice={options.filters.maxPrice}
            activeMinAge={options.filters.minAge}
            activeMaxAge={options.filters.maxAge}
          />
          <TreeSort activeSort={options.sort} />
        </div>

        {/* Results Info */}
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{initialData.trees.length}</span> of <span className="font-semibold text-foreground">{initialData.totalCount}</span> trees available
        </div>

        {/* Grid and Infinite Scroll */}
        <TreeGrid initialData={initialData} options={options} />
      </div>
    </main>
  );
}
