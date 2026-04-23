// components/admin/data-table.tsx
"use client";

import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    type ColumnDef,
} from "@tanstack/react-table";
import {
    useQueryStates,
    parseAsInteger,
    parseAsString,
} from "nuqs";
import { useTransition } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
    columns: ColumnDef<TData>[];
    data: TData[];
    rowCount: number;
    page: number;
    pageSize: number;
}

export function DataTable<TData>({
    columns, data, rowCount, page, pageSize,
}: DataTableProps<TData>) {
    const [isPending, startTransition] = useTransition();

    const [, setParams] = useQueryStates(
        {
            page: parseAsInteger.withDefault(1),
            sort: parseAsString.withDefault("created_at"),
            order: parseAsString.withDefault("desc"),
        },
        { startTransition }
    );

    const pageCount = Math.ceil(rowCount / pageSize);

    const table = useReactTable({
        data,
        columns,
        rowCount,
        state: {
            pagination: { pageIndex: page - 1, pageSize },
        },
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        onPaginationChange: (updater) => {
            const next = typeof updater === "function"
                ? updater({ pageIndex: page - 1, pageSize })
                : updater;
            setParams({ page: next.pageIndex + 1 });
        },
        onSortingChange: (updater) => {
            const next = typeof updater === "function" ? updater([]) : updater;
            if (next[0]) setParams({ sort: next[0].id, order: next[0].desc ? "desc" : "asc" });
        },
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div
            data-pending={isPending ? "" : undefined}
            className="data-card overflow-hidden !p-0 transition-opacity data-[pending]:opacity-60"
        >
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        {table.getHeaderGroups().map((hg) => (
                            <tr key={hg.id} className="admin-table-header border-b border-slate-100">
                                {hg.headers.map((header) => (
                                    <th key={header.id} className="py-5 px-6">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="py-20 text-center">
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No records found</p>
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="group hover:bg-slate-50/50 transition-colors">
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="py-5 px-6">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {rowCount} total · page {page} of {pageCount}
                </p>
                <div className="flex items-center gap-1">
                    {[
                        { icon: ChevronsLeft, action: () => setParams({ page: 1 }), disabled: page <= 1 },
                        { icon: ChevronLeft, action: () => setParams({ page: page - 1 }), disabled: page <= 1 },
                        { icon: ChevronRight, action: () => setParams({ page: page + 1 }), disabled: page >= pageCount },
                        { icon: ChevronsRight, action: () => setParams({ page: pageCount }), disabled: page >= pageCount },
                    ].map(({ icon: Icon, action, disabled }, i) => (
                        <Button
                            key={i}
                            variant="ghost"
                            size="icon"
                            onClick={action}
                            disabled={disabled || isPending}
                            className={cn("h-8 w-8 rounded-lg", disabled && "opacity-30")}
                        >
                            <Icon size={14} />
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}