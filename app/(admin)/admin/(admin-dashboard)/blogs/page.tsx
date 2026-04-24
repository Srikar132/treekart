// app/admin/blogs/page.tsx
import { type SearchParams } from "nuqs/server";
import { blogsSearchParamsCache } from "./search-params";
import { DataTable } from "@/components/admin/data-table";
import { blogColumns } from "./columns";
import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/admin/datatable-skeleton";
import { DataTableToolbar } from "@/components/admin/datatable-toolbar";
import { getAdminBlogs } from "@/actions/admin.actions";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function AdminBlogsPage({ searchParams }: Props) {
  const params = await blogsSearchParamsCache.parse(searchParams);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Journal Management</h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Craft narratives for your orchard stories</p>
        </div>
        <Button
          nativeButton={false}
          render={
            <Link href="/admin/blogs/new" className="flex items-center gap-2 uppercase tracking-widest text-[10px] font-black">
              <Plus size={16} />
              Write New Story
            </Link>
          }
          className="admin-button-primary h-12 px-6"
        />
      </div>

      {/* Toolbar */}
      <DataTableToolbar
        searchPlaceholder="Search by story title..."
        filters={[
          {
            key: "category",
            placeholder: "All Categories",
            options: [
              { label: "Orchard Life", value: "Orchard Life" },
              { label: "Guides", value: "Guides" },
              { label: "News", value: "News" },
            ],
          },
        ]}
      />

      {/* Table */}
      <Suspense key={JSON.stringify(params)} fallback={<DataTableSkeleton cols={5} />}>
        <BlogsTable params={params} />
      </Suspense>
    </div>
  );
}

async function BlogsTable({ params }: { params: Awaited<ReturnType<typeof blogsSearchParamsCache.parse>> }) {
  const { data, count } = await getAdminBlogs(params);

  return (
    <DataTable
      columns={blogColumns}
      data={data}
      rowCount={count}
      page={params.page}
      pageSize={params.pageSize}
    />
  );
}
