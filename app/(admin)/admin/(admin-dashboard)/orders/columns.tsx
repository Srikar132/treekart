// app/admin/orders/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuGroup, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Truck, CheckCircle, XCircle, ShoppingBag, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { adminUpdateOrderStatus } from "@/actions/admin.actions"
import { useTransition } from "react"
import { toast } from "sonner"

export const orderColumns: ColumnDef<any>[] = [
    {
        accessorKey: "id",
        header: "Order ID",
        cell: ({ row }) => {
            const order = row.original
            return (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 border border-orange-100">
                        <ShoppingBag size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-foreground uppercase">#{order.id.slice(0, 8)}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "Date TBD"}</p>
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "profiles.full_name",
        header: "Customer",
        cell: ({ row }) => {
            const profile = row.original.profiles
            return (
                <div>
                    <p className="text-xs font-bold text-foreground uppercase">{profile?.full_name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                        {profile?.phone || 'No Phone'} • <span className="lowercase">{profile?.email || 'No Email'}</span>
                    </p>
                </div>
            )
        }
    },
    {
        accessorKey: "total_amount",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="hover:bg-transparent p-0 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
            >
                Amount <ArrowUpDown className="ml-2 h-3 w-3" />
            </Button>
        ),
        cell: ({ row }) => (
            <div>
                <p className="text-sm font-black text-foreground uppercase">₹{row.getValue<number>("total_amount").toLocaleString()}</p>
                <p className="text-[9px] font-bold text-green-600 uppercase tracking-widest">Paid via Razorpay</p>
            </div>
        )
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge className={cn(
                    "rounded-md text-[8px] font-black uppercase tracking-widest border-0 px-3 py-1",
                    status === "confirmed" ? "bg-blue-100 text-blue-600" :
                    status === "shipped" ? "bg-orange-100 text-orange-600" :
                    status === "cancelled" ? "bg-red-100 text-red-600" :
                    "bg-green-100 text-green-600"
                )}>
                    {status}
                </Badge>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <OrderActions order={row.original} />
    }
]

function OrderActions({ order }: { order: any }) {
    const [isPending, startTransition] = useTransition()

    const updateStatus = (status: "shipped" | "delivered") => {
        startTransition(async () => {
            try {
                await adminUpdateOrderStatus(order.id, status)
                toast.success(`Order marked as ${status}`)
            } catch (err: any) {
                toast.error(err.message)
            }
        })
    }

    const handleCancel = () => {
        if (!confirm("Cancel this order? A refund will be initiated if the order was paid.")) return
        startTransition(async () => {
            try {
                await adminUpdateOrderStatus(order.id, "cancelled")
                toast.success("Order cancelled. Refund initiated if applicable.")
            } catch (err: any) {
                toast.error(err.message)
            }
        })
    }

    return (
        <div className="text-right">
            <DropdownMenu>
                <DropdownMenuTrigger 
                    className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-lg hover:bg-muted text-muted-foreground")}
                >
                    <MoreHorizontal size={18} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border-border shadow-xl">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 py-3">Fulfillment Action</DropdownMenuLabel>
                        <DropdownMenuItem 
                            className="rounded-lg cursor-pointer flex items-center gap-2"
                            render={(props) => <Link {...props} href={`/admin/orders/${order.id}`} className="w-full flex items-center gap-2" />}
                        >
                            <Eye size={14} /> View Manifest
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={() => updateStatus("shipped")}
                            disabled={isPending || order.status === "shipped" || order.status === "delivered"}
                            className="rounded-lg cursor-pointer flex items-center gap-2 text-orange-600"
                        >
                            <Truck size={14} /> Mark as Shipped
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => updateStatus("delivered")}
                            disabled={isPending || order.status === "delivered"}
                            className="rounded-lg cursor-pointer flex items-center gap-2 text-green-600"
                        >
                            <CheckCircle size={14} /> Mark as Delivered
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={handleCancel}
                        disabled={isPending || order.status === "cancelled" || order.status === "delivered"}
                        className="rounded-lg cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive flex items-center gap-2"
                    >
                        <XCircle size={14} /> Cancel Order
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
