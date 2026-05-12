export const revalidate = 3600;

import { getAvailableTrees, getTreePlans, type TreeSortOption } from "@/actions/tree.actions";
import { TreeGrid } from "@/components/storefront/rent/tree-grid";
import { TreeFilters } from "@/components/storefront/rent/tree-filters";
import { TreeSort } from "@/components/storefront/rent/tree-sort";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rent a Mango Tree — Exclusive Orchard Ownership",
  description: "Browse our heritage Alphonso orchards. Choose your tree, receive seasonal updates, and enjoy a guaranteed harvest delivered to your doorstep.",
  keywords: ["rent a mango tree", "orchard ownership", "mango tree adoption", "Alphonso tree rental", "track mango growth"],
  alternates: {
    canonical: "/rent",
  },
  openGraph: {
    title: "Rent a Mango Tree — Exclusive Orchard Ownership",
    description: "Browse our heritage Alphonso orchards. Choose your tree, receive seasonal updates, and enjoy a guaranteed harvest delivered to your doorstep.",
    url: "https://treekart.in/rent",
    siteName: "TreeKart",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rent a Tree",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rent a Mango Tree — Exclusive Orchard Ownership",
    description: "Browse our heritage Alphonso orchards. Choose your tree, receive seasonal updates, and enjoy a guaranteed harvest delivered to your doorstep.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

type SearchParams = {
  plan?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  minAge?: string;
  maxAge?: string;
  status?: string;
  page?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function RentPage({ searchParams }: Props) {
  const params = await searchParams;

  const planIds = params.plan
    ? params.plan.split(",").filter(Boolean)
    : [];

  const options = {
    filters: {
      planId: planIds.length > 0 ? planIds : undefined,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      minAge: params.minAge ? Number(params.minAge) : undefined,
      maxAge: params.maxAge ? Number(params.maxAge) : undefined,
      status: params.status ? (params.status.split(",") as any) : undefined,
    },
    sort: (params.sort as TreeSortOption) || "newest",
    page: params.page ? Number(params.page) : 1,
    limit: 12,
  };

  const [initialData, treePlans] = await Promise.all([
    getAvailableTrees(options),
    getTreePlans()
  ]);

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
            activePlans={planIds}
            treePlans={treePlans}
            activeMinPrice={options.filters.minPrice}
            activeMaxPrice={options.filters.maxPrice}
            activeMinAge={options.filters.minAge}
            activeMaxAge={options.filters.maxAge}
            activeStatus={options.filters.status as any}
          />
          <TreeSort activeSort={options.sort} />
        </div>

        {/* Results Info */}
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{initialData.trees.length}</span> of <span className="font-semibold text-foreground">{initialData.totalCount}</span> trees
        </div>

        {/* Grid and Infinite Scroll */}
        <TreeGrid initialData={initialData} options={options} />
      </div>
    </main>
  );
}
