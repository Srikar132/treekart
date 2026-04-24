// app/admin/trees/page.tsx
import { type SearchParams } from "nuqs/server";
import { treesSearchParamsCache } from "./search-params";
import { DataTable } from "@/components/admin/data-table";
import { treeColumns } from "./columns";
import { Plus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/admin/datatable-skeleton";
import { DataTableToolbar } from "@/components/admin/datatable-toolbar";
import { getTrees } from "@/actions/admin.actions";

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function AdminTreesPage({ searchParams }: Props) {
  const params = await treesSearchParamsCache.parse(searchParams);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Tree Inventory</h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Manage your heritage mango trees
          </p>
        </div>
        <Link href="/admin/trees/new" className={buttonVariants({ className: "admin-button-primary h-12 px-6" })}>
          <Plus size={16} className="mr-2" />
          <span className="text-[10px] font-black uppercase tracking-widest">Add New Tree</span>
        </Link>
      </div>

      {/* Toolbar — client component, instant render */}
      <DataTableToolbar
        searchPlaceholder="Search by variety..."
        filters={[
          {
            key: "status",
            placeholder: "All Status",
            options: [
              { label: "Available", value: "available" },
              { label: "Rented", value: "rented" },
              { label: "Inactive", value: "inactive" },
            ],
          },
          {
            key: "plan_type",
            placeholder: "All Plans",
            options: [
              { label: "Basic", value: "basic" },
              { label: "Standard", value: "standard" },
              { label: "Max", value: "max" },
            ],
          },
        ]}
      />

      {/* Table — RSC streams in with Suspense */}
      <Suspense key={JSON.stringify(params)} fallback={<DataTableSkeleton cols={6} />}>
        <TreesTable params={params} />
      </Suspense>
    </div>
  );
}

// Async sub-component — this is where the RSC magic happens
async function TreesTable({ params }: { params: Awaited<ReturnType<typeof treesSearchParamsCache.parse>> }) {
  const { data, count } = await getTrees(params);

  return (
    <DataTable
      columns={treeColumns}
      data={data}
      rowCount={count}
      page={params.page}
      pageSize={params.pageSize}
    />
  );
}