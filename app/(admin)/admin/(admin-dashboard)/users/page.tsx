// app/admin/users/page.tsx
import { type SearchParams } from "nuqs/server";
import { usersSearchParamsCache } from "./search-params";
import { DataTable } from "@/components/admin/data-table";
import { userColumns } from "./columns";
import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/admin/datatable-skeleton";
import { DataTableToolbar } from "@/components/admin/datatable-toolbar";
import { getAdminUsers } from "@/actions/admin.actions";

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await usersSearchParamsCache.parse(searchParams);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Member Directory</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Manage and monitor platform participants
        </p>
      </div>

      {/* Toolbar */}
      <DataTableToolbar
        searchPlaceholder="Search by name or phone..."
        filters={[
          {
            key: "role",
            placeholder: "All Roles",
            options: [
              { label: "Admin", value: "admin" },
              { label: "Farmer", value: "farmer" },
              { label: "User", value: "user" },
            ],
          },
        ]}
      />

      {/* Table */}
      <Suspense key={JSON.stringify(params)} fallback={<DataTableSkeleton cols={3} />}>
        <UsersTable params={params} />
      </Suspense>
    </div>
  );
}

async function UsersTable({ params }: { params: Awaited<ReturnType<typeof usersSearchParamsCache.parse>> }) {
  const { data, count } = await getAdminUsers(params);

  return (
    <DataTable
      columns={userColumns}
      data={data}
      rowCount={count}
      page={params.page}
      pageSize={params.pageSize}
    />
  );
}
