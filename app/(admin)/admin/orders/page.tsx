// app/admin/orders/page.tsx
import { type SearchParams } from "nuqs/server";
import { ordersSearchParamsCache } from "./search-params";
import { DataTable } from "@/components/admin/data-table";
import { orderColumns } from "./columns";
import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/admin/datatable-skeleton";
import { DataTableToolbar } from "@/components/admin/datatable-toolbar";
import { getAdminOrders } from "@/actions/admin.actions";

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const params = await ordersSearchParamsCache.parse(searchParams);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Fulfillment Center</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Process and track mango shop orders
        </p>
      </div>

      {/* Toolbar — client component, instant render */}
      <DataTableToolbar
        searchPlaceholder="Search by customer name or phone..."
        filters={[
          {
            key: "status",
            placeholder: "All Status",
            options: [
              { label: "Confirmed", value: "confirmed" },
              { label: "Shipped", value: "shipped" },
              { label: "Delivered", value: "delivered" },
            ],
          },
        ]}
      />

      {/* Table — RSC streams in with Suspense */}
      <Suspense key={JSON.stringify(params)} fallback={<DataTableSkeleton cols={5} />}>
        <OrdersTable params={params} />
      </Suspense>
    </div>
  );
}

// Async sub-component — this is where the RSC magic happens
async function OrdersTable({ params }: { params: Awaited<ReturnType<typeof ordersSearchParamsCache.parse>> }) {
  const { data, count } = await getAdminOrders(params);

  return (
    <DataTable
      columns={orderColumns}
      data={data}
      rowCount={count}
      page={params.page}
      pageSize={params.pageSize}
    />
  );
}
