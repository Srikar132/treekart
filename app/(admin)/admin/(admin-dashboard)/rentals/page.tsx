// app/(admin)/admin/rentals/page.tsx
import { type SearchParams } from "nuqs/server";
import { rentalsSearchParamsCache } from "./search-params";
import { DataTable } from "@/components/admin/data-table";
import { rentalColumns } from "./columns";
import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/admin/datatable-skeleton";
import { DataTableToolbar } from "@/components/admin/datatable-toolbar";
import { getRentals } from "@/actions/admin.actions";

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function AdminRentalsPage({ searchParams }: Props) {
  const params = await rentalsSearchParamsCache.parse(searchParams);

  // Calculate seasons for filter
  const now = new Date();
  const currentSeason = now.getMonth() >= 3
    ? `${now.getFullYear()}-${(now.getFullYear() + 1).toString().slice(2)}`
    : `${now.getFullYear() - 1}-${now.getFullYear().toString().slice(2)}`;
  
  const lastYear = now.getFullYear() - 1;
  const previousSeason = now.getMonth() >= 3
    ? `${lastYear}-${now.getFullYear().toString().slice(2)}`
    : `${lastYear - 1}-${lastYear.toString().slice(2)}`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Leasing Management</h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Oversee heritage tree rental agreements
        </p>
      </div>

      {/* Toolbar */}
      <DataTableToolbar
        searchPlaceholder="Search Member or Phone..."
        filters={[
          {
            key: "status",
            placeholder: "All Status",
            options: [
              { label: "Active", value: "active" },
              { label: "Completed", value: "completed" },
              { label: "Cancelled", value: "cancelled" },
            ],
          },
          {
            key: "season",
            placeholder: "All Seasons",
            options: [
              { label: `Current (${currentSeason})`, value: currentSeason },
              { label: `Previous (${previousSeason})`, value: previousSeason },
            ],
          },
        ]}
      />

      {/* Table */}
      <Suspense key={JSON.stringify(params)} fallback={<DataTableSkeleton cols={5} />}>
        <RentalsTable params={params} />
      </Suspense>
    </div>
  );
}

async function RentalsTable({ params }: { params: Awaited<ReturnType<typeof rentalsSearchParamsCache.parse>> }) {
  const { data, count } = await getRentals(params);

  return (
    <DataTable
      columns={rentalColumns}
      data={data}
      rowCount={count}
      page={params.page}
      pageSize={params.pageSize}
      sort={params.sort}
      order={params.order}
      rowHrefPrefix="/admin/rentals"
      rowHrefSuffix="/updates"
    />
  );
}
