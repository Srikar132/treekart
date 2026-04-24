// app/admin/products/page.tsx
import { type SearchParams } from "nuqs/server";
import { productsSearchParamsCache } from "./search-params";
import { DataTable } from "@/components/admin/data-table";
import { productColumns } from "./columns";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/admin/datatable-skeleton";
import { DataTableToolbar } from "@/components/admin/datatable-toolbar";
import { getAdminProducts } from "@/actions/products.actions";

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const params = await productsSearchParamsCache.parse(searchParams);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Mango Shop</h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Manage your physical product inventory
          </p>
        </div>
        <Link 
            href="/admin/products/new" 
            className={buttonVariants({ className: "admin-button-primary h-12 px-6" })}
        >
          <Plus size={16} className="mr-2" />
          <span className="text-[10px] font-black uppercase tracking-widest">Add Product</span>
        </Link>
      </div>

      {/* Toolbar — client component, instant render */}
      <DataTableToolbar
        searchPlaceholder="Search by name or variety..."
        filters={[
          {
            key: "status",
            placeholder: "All Status",
            options: [
              { label: "In Stock", value: "available" },
              { label: "Out of Stock", value: "out_of_stock" },
              { label: "Pre-Order", value: "pre_order" },
            ],
          },
          {
            key: "badge",
            placeholder: "All Badges",
            options: [
              { label: "New", value: "New" },
              { label: "On Sale", value: "Sale" },
              { label: "Pre-Order", value: "Pre-Order" },
              { label: "Regular", value: "None" },
            ],
          },
        ]}
      />

      {/* Table — RSC streams in with Suspense */}
      <Suspense key={JSON.stringify(params)} fallback={<DataTableSkeleton cols={6} />}>
        <ProductsTable params={params} />
      </Suspense>
    </div>
  );
}

// Async sub-component — this is where the RSC magic happens
async function ProductsTable({ params }: { params: Awaited<ReturnType<typeof productsSearchParamsCache.parse>> }) {
  const { data, count } = await getAdminProducts(params);

  return (
    <DataTable
      columns={productColumns}
      data={data}
      rowCount={count}
      page={params.page}
      pageSize={params.pageSize}
    />
  );
}
