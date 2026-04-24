// app/(admin)/admin/rentals/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
    MoreHorizontal, Eye, Plus, Trash2,
    Mail, Phone, TreePine, ShieldCheck
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    // DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { startTransition } from "react";
import { adminDeleteRental, adminUpdateRentalStatus } from "@/actions/admin.actions";
import { toast } from "sonner";
import { RentalStatus } from "@/types/database.types";

export const rentalColumns: ColumnDef<any>[] = [
    {
        accessorKey: "profiles",
        header: "Member Details",
        cell: ({ row }) => {
            const profile = row.original.profiles;
            return (
                <div className="flex flex-col">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                        {profile?.full_name || "Unknown Member"}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            <Mail size={10} /> {profile?.email || "N/A"}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            <Phone size={10} /> {profile?.phone || "N/A"}
                        </div>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "trees",
        header: "Heritage Tree",
        cell: ({ row }) => {
            const tree = row.original.trees;
            return (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600 border border-green-100 shrink-0">
                        <TreePine size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                            {tree?.variety || "Unknown Variety"}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {tree?.farmers?.location || "Location Unknown"}
                        </p>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "season",
        header: "Season",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <p className="text-xs font-black text-slate-900">{row.getValue("season")}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    Annual Lease
                </p>
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const colors = {
                active: "bg-blue-50 text-blue-600 border-blue-100",
                completed: "bg-green-50 text-green-600 border-green-100",
                cancelled: "bg-red-50 text-red-600 border-red-100",
            };

            return (
                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className={cn(
                            "rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest border",
                            colors[status as keyof typeof colors] || "bg-slate-50 text-slate-600"
                        )}
                    >
                        {status}
                    </Badge>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
            const rental = row.original;

            // function handleDelete() {
            //     if (!confirm("Terminate this lease? This cannot be undone.")) return;
            //     startTransition(async () => {
            //         try {
            //             await adminDeleteRental(rental.id);
            //             toast.success("Lease terminated");
            //         } catch {
            //             toast.error("Failed to terminate lease");
            //         }
            //     });
            // }

            function updateStatus(status: RentalStatus) {
                startTransition(async () => {
                    try {
                        await adminUpdateRentalStatus(rental.id, status);
                        toast.success(`Lease marked as ${status}`);
                    } catch {
                        toast.error("Failed to update status");
                    }
                });
            }

            return (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className={cn(
                                buttonVariants({ variant: "ghost", size: "icon" }),
                                "h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-400"
                            )}
                        >
                            <MoreHorizontal size={18} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-200 shadow-xl">
                            <DropdownMenuGroup>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-3">
                                    Lease Operations
                                </div>
                                {/* <DropdownMenuItem
                                    className="rounded-lg cursor-pointer flex items-center gap-2"
                                    render={(props) => (
                                        <Link {...props} href={`/account/rentals/${rental.id}`} target="_blank">
                                            <Eye size={14} /> View Member Portal
                                        </Link>
                                    )}
                                /> */}

                                {rental.status === 'active' && (
                                    <DropdownMenuItem
                                        onClick={() => updateStatus('completed')}
                                        className="rounded-lg cursor-pointer flex items-center gap-2"
                                    >
                                        <ShieldCheck size={14} className="text-green-600" /> Mark as Completed
                                    </DropdownMenuItem>
                                )}

                                {rental.status === "active" && (
                                    <DropdownMenuItem 
                                        className="rounded-lg cursor-pointer flex items-center gap-2"
                                        render={(props) => (
                                            <Link {...props} href={`/admin/rentals/${rental.id}/updates`}>
                                                <Plus size={14} /> Post Growth Update
                                            </Link>
                                        )}
                                    />
                                )}

                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            {/* <DropdownMenuItem
                                onClick={handleDelete}
                                className="rounded-lg cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive flex items-center gap-2"
                            >
                                <Trash2 size={14} /> Terminate Lease
                            </DropdownMenuItem> */}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
