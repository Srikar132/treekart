"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
    MoreHorizontal, Plus,
    Mail, Phone, TreePine, ShieldCheck,
    CalendarDays, MapPin, CreditCard,
    HandHelping, Printer,
} from "lucide-react";
import { buttonVariants, Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { startTransition } from "react";
import { adminUpdateRentalStatus } from "@/actions/admin.actions";
import { toast } from "sonner";
import { Rental, Tree, Profile, Farmer, RentalStatus } from "@/types/database.types";
import { buildStickerHTML } from "@/components/admin/shared/print-sticker";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface Address {
    name: string;
    line1: string;
    locality?: string;
    city: string;
    district?: string;
    state: string;
    pincode: string;
    country?: string;
}

export type RentalRow = Rental & {
    profiles: Pick<Profile, "full_name" | "phone" | "email"> | null;
    trees: (Pick<Tree, "variety"> & {
        farmers: Pick<Farmer, "location"> | null;
    }) | null;
};

export const rentalColumns: ColumnDef<RentalRow>[] = [
    {
        accessorKey: "profiles",
        header: "Member Details",
        cell: ({ row }) => {
            const profile = row.original.profiles;
            return (
                <div className="flex flex-col min-w-[180px]">
                    <p className="text-xs font-black text-foreground uppercase tracking-tight">
                        {profile?.full_name || "Unknown Member"}
                    </p>
                    <div className="flex flex-col gap-1 mt-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter bg-muted/50 w-fit px-2 py-0.5 rounded border border-border/40">
                            <Mail size={10} className="text-primary" /> {profile?.email || "N/A"}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter bg-muted/50 w-fit px-2 py-0.5 rounded border border-border/40">
                            <Phone size={10} className="text-primary" /> {profile?.phone || "N/A"}
                        </div>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "delivery_address",
        header: "Destination",
        cell: ({ row }) => {
            const addr = row.original.delivery_address as unknown as Address;
            if (!addr) return <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-30">—</span>;
            
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger 
                            render={
                                <div className="flex items-start gap-2 max-w-[200px] cursor-help group">
                                    <MapPin size={14} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                                    <div className="flex flex-col overflow-hidden">
                                        <p className="text-[10px] font-black text-foreground uppercase truncate">
                                            {addr.name}
                                        </p>
                                        <p className="text-[10px] font-medium text-muted-foreground truncate italic">
                                            {addr.line1}, {addr.city}
                                        </p>
                                    </div>
                                </div>
                            }
                        />
                        <TooltipContent className="bg-card border-border shadow-xl p-4 max-w-[280px]">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase text-primary border-b border-primary/10 pb-1">Delivery Address</p>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-foreground uppercase">{addr.name}</p>
                                    <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                                        {addr.line1}<br />
                                        {addr.locality && `${addr.locality}, `}{addr.city}<br />
                                        {addr.district && `${addr.district}, `}{addr.state}<br />
                                        <span className="font-bold text-foreground">{addr.pincode} • {addr.country || "India"}</span>
                                    </p>
                                </div>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
    },
    {
        accessorKey: "trees",
        header: "Tree / Update",
        cell: ({ row }) => {
            const tree = row.original.trees;
            const visitRequested = row.original.visit_requested;
            return (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 border border-green-100 shrink-0">
                        <TreePine size={18} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-xs font-black text-foreground uppercase tracking-tight">
                            {tree?.variety || "Unknown Variety"}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate max-w-[80px]">
                                {tree?.farmers?.location || "Location..."}
                            </span>
                            {visitRequested && (
                                <Badge className="bg-orange-50 text-orange-600 border-orange-100 text-[8px] font-black uppercase tracking-tighter px-1.5 h-4">
                                    <HandHelping size={8} className="mr-1" /> Visit
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "payment_id",
        header: "Payment",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
                    <span>₹{row.original.amount_paid?.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    <CreditCard size={10} className="text-muted-foreground/50" />
                    <span className="font-mono text-[8px]">{row.original.payment_id?.slice(-8) || "COD/OFFLINE"}</span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "season",
        header: "Season",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-0 rounded-md text-[9px] font-black uppercase px-2 py-0.5">
                        {row.original.season}
                    </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">
                    <CalendarDays size={10} />
                    <span>Annual Lease</span>
                </div>
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
                <div className="flex items-center">
                    <Badge
                        variant="outline"
                        className={cn(
                            "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border shadow-sm",
                            colors[status as keyof typeof colors] || "bg-muted text-muted-foreground border-border"
                        )}
                    >
                        <div className={cn("w-1.5 h-1.5 rounded-full mr-2",
                            status === 'active' ? 'bg-blue-500' :
                                status === 'completed' ? 'bg-green-500' :
                                    'bg-red-500'
                        )} />
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

            function handlePrintSticker() {
                if (!rental.delivery_address) return;
                const html = buildStickerHTML({
                    type: "rental",
                    referenceId: rental.id,
                    date: rental.rented_at ?? "",
                    deliveryAddress: rental.delivery_address as any,
                    treeVariety: rental.trees?.variety ?? "Unknown",
                    season: rental.season ?? "",
                    amountPaid: rental.amount_paid,
                });
                const win = window.open("", "_blank", "width=420,height=630");
                if (!win) return;
                win.document.write(html);
                win.document.close();
                win.onafterprint = () => win.close();
                if (win.document.readyState === "complete") { win.focus(); win.print(); }
                else { win.onload = () => { win.focus(); win.print(); }; }
            }

            function updateStatus(status: RentalStatus) {
                if (!confirm(`Mark this lease as ${status}?`)) return;
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
                            render={
                                <Button variant="ghost" size="icon" className={cn(
                                    "h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground"
                                )}>
                                    <MoreHorizontal size={18} />
                                </Button>
                            }
                        />
                        <DropdownMenuContent align="end" className="w-56 rounded-xl border-border shadow-xl">
                            <DropdownMenuGroup>
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 py-3">
                                    Lease Operations
                                </div>

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
                                        render={
                                            <Link href={`/admin/rentals/${rental.id}/updates`}>
                                                <Plus size={14} /> Post Growth Update
                                            </Link>
                                        }
                                    />
                                )}

                                {rental.delivery_address && (
                                    <DropdownMenuItem
                                        onClick={handlePrintSticker}
                                        className="rounded-lg cursor-pointer flex items-center gap-2"
                                    >
                                        <Printer size={14} className="text-muted-foreground" /> Print Sticker
                                    </DropdownMenuItem>
                                )}

                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
