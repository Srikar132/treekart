// app/admin/trees/columns.tsx
"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { type Tree, type TreeStatus } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { adminDeleteTree, adminUpdateTreeStatus } from "@/actions/admin.actions";
import { useTransition } from "react";
import { toast } from "sonner";

// Joined type from your select query
export type TreeRow = Pick<Tree,
    "id" | "variety" | "price" | "status" | "plan_id" |
    "photos" | "age_years" | "is_verified" | "created_at"
> & {
    farmers: { farm_name: string | null; location: string | null } | null;
    tree_plans: { name: string; badge_text: string | null; badge_color: string | null } | null;
};

const STATUS_CONFIG: Record<TreeStatus, { label: string; dot: string }> = {
    available: { label: "Available", dot: "bg-green-500" },
    rented: { label: "Rented", dot: "bg-blue-500" },
    inactive: { label: "Inactive", dot: "bg-muted-foreground" },
};



function ActionsCell({ row }: { row: { original: TreeRow } }) {
    const [isPending, startTransition] = useTransition();
    const tree = row.original;

    function handleDelete() {
        if (!confirm(`Delete tree ${tree.variety}? This cannot be undone.`)) return;
        startTransition(async () => {
            try {
                await adminDeleteTree(tree.id);
                toast.success("Tree deleted");
            } catch {
                toast.error("Failed to delete tree");
            }
        });
    }

    function handleStatusToggle() {
        const next: TreeStatus = tree.status === "available" ? "inactive" : "available";
        startTransition(async () => {
            try {
                await adminUpdateTreeStatus(tree.id, next);
                toast.success(`Status updated to ${next}`);
            } catch {
                toast.error("Failed to update status");
            }
        });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button variant="ghost" size="icon" className="rounded-lg hover:bg-muted text-muted-foreground" disabled={isPending}>
                        <MoreHorizontal size={18} />
                    </Button>
                }
            />
            <DropdownMenuContent align="end" className="w-48 rounded-xl border-border shadow-xl">
                <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Management
                </div>
                <DropdownMenuItem
                    render={
                        <Link href={`/rent/${tree.id}`} target="_blank" className="flex items-center gap-2 cursor-pointer">
                            <Eye size={14} /> View Public Page
                        </Link>
                    }
                />
                <DropdownMenuItem
                    render={
                        <Link href={`/admin/trees/${tree.id}`} className="flex items-center gap-2 cursor-pointer">
                            <Edit size={14} /> Edit Details
                        </Link>
                    }
                />
                <DropdownMenuItem onClick={handleStatusToggle} className="cursor-pointer">
                    Toggle Status
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleDelete}
                    className="cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive"
                >
                    <Trash2 size={14} className="mr-2" /> Delete Record
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export const treeColumns: ColumnDef<TreeRow>[] = [
    {
        accessorKey: "variety",
        header: ({ column }) => (
            <button
                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Tree Details 
                {column.getIsSorted() === "asc" ? (
                    <ArrowUp size={12} className="text-primary" />
                ) : column.getIsSorted() === "desc" ? (
                    <ArrowDown size={12} className="text-primary" />
                ) : (
                    <ArrowUpDown size={12} />
                )}
            </button>
        ),
        cell: ({ row }) => {
            const tree = row.original;
            const photo = (tree.photos as string[] | null)?.[0];
            return (
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-muted overflow-hidden shrink-0 border border-border">
                        {photo ? (
                            <img src={photo} alt={tree.variety ?? ""} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-xs font-black">N/A</div>
                        )}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase">#{tree.id.slice(0, 8)}</p>
                        <p className="text-sm font-bold text-foreground">{tree.variety}</p>
                        {tree.age_years && (
                            <p className="text-[10px] text-muted-foreground font-bold">{tree.age_years} yrs old</p>
                        )}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "farmers",
        header: () => <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Farmer / Estate</span>,
        cell: ({ row }) => (
            <div>
                <p className="text-xs font-bold text-foreground uppercase tracking-tight">
                    {row.original.farmers?.farm_name ?? "Individual"}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {row.original.farmers?.location ?? "—"}
                </p>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "plan_id",
        header: () => <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Plan</span>,
        cell: ({ row }) => {
            const plan = row.original.tree_plans;
            if (!plan) return <span className="text-muted-foreground/30">—</span>;
            return (
                <Badge variant="outline" className={cn("rounded-md text-[9px] font-black uppercase tracking-widest px-3 py-1", plan.badge_color || "border-border text-muted-foreground bg-muted/50")}>
                    {plan.name}
                </Badge>
            );
        },
    },
    {
        accessorKey: "price",
        header: ({ column }) => (
            <button
                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Price 
                {column.getIsSorted() === "asc" ? (
                    <ArrowUp size={12} className="text-primary" />
                ) : column.getIsSorted() === "desc" ? (
                    <ArrowDown size={12} className="text-primary" />
                ) : (
                    <ArrowUpDown size={12} />
                )}
            </button>
        ),
        cell: ({ row }) => (
            <div>
                <p className="text-sm font-black text-foreground">₹{row.original.price?.toLocaleString() ?? "—"}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase">Per Season</p>
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: () => <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</span>,
        cell: ({ row }) => {
            const status = row.original.status as TreeStatus | null;
            if (!status) return null;
            const cfg = STATUS_CONFIG[status];
            return (
                <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", cfg.dot)} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{cfg.label}</span>
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ActionsCell,
    },
];