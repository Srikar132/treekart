// app/admin/products/columns.tsx
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
import { MoreHorizontal, Eye, Edit, Trash2, Package, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { deleteProduct } from "@/actions/products.actions"
import { useTransition } from "react"
import { toast } from "sonner"
import { MangoProduct } from "@/types/database.types"

export const productColumns: ColumnDef<MangoProduct>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="hover:bg-transparent p-0 text-[10px] font-black uppercase tracking-widest text-slate-400"
            >
                Product <ArrowUpDown className="ml-2 h-3 w-3" />
            </Button>
        ),
        cell: ({ row }) => {
            const product = row.original
            return (
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Package size={16} />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase truncate">#{product.id.slice(0, 8)}</p>
                        <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{product.name}</p>
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "weight_kg",
        header: "Weight",
        cell: ({ row }) => <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{row.getValue("weight_kg")} KG</span>
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
            const product = row.original
            return (
                <div>
                    <p className="text-sm font-black text-slate-900 uppercase">₹{product.price.toLocaleString()}</p>
                    {product.original_price && (
                        <p className="text-[9px] font-bold text-slate-400 uppercase line-through decoration-destructive/30">₹{product.original_price.toLocaleString()}</p>
                    )}
                </div>
            )
        }
    },
    {
        accessorKey: "badge",
        header: "Badge",
        cell: ({ row }) => {
            const badge = row.getValue("badge") as string
            if (!badge || badge === "None") return <span className="text-[10px] text-slate-300">—</span>
            return (
                <Badge className={cn(
                    "rounded-md text-[8px] font-black uppercase tracking-widest border-0 shadow-none",
                    badge === "Sale" ? "bg-orange-100 text-orange-600" :
                    badge === "New" ? "bg-blue-100 text-blue-600" :
                    badge === "Pre-Order" ? "bg-purple-100 text-purple-600" :
                    "bg-green-100 text-green-600"
                )}>
                    {badge}
                </Badge>
            )
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "h-2 w-2 rounded-full",
                        status === "available" ? "bg-green-500" : 
                        status === "pre_order" ? "bg-purple-500" : 
                        "bg-destructive"
                    )} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                        {status === "available" ? "In Stock" : 
                         status === "pre_order" ? "Pre-Order" : 
                         "Out of Stock"}
                    </span>
                </div>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <ProductActions product={row.original} />
    }
]

function ProductActions({ product }: { product: MangoProduct }) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this product?")) return
        startTransition(async () => {
            try {
                await deleteProduct(product.id)
                toast.success("Product deleted successfully")
            } catch (err: any) {
                toast.error(err.message || "Failed to delete product")
            }
        })
    }

    return (
        <div className="text-right">
            <DropdownMenu>
                <DropdownMenuTrigger 
                    className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-lg hover:bg-slate-100 text-slate-400")}
                >
                    <MoreHorizontal size={18} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-200 shadow-xl">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Management</DropdownMenuLabel>
                        <DropdownMenuItem 
                            render={
                                <Link href={`/store`} target="_blank" className="flex items-center gap-2 cursor-pointer w-full">
                                    <Eye size={14} /> View in Shop
                                </Link>
                            } 
                            className="rounded-lg cursor-pointer" 
                        />
                        <DropdownMenuItem 
                            render={
                                <Link href={`/admin/products/${product.id}`} className="flex items-center gap-2 cursor-pointer w-full">
                                    <Edit size={14} /> Edit Details
                                </Link>
                            } 
                            className="rounded-lg cursor-pointer" 
                        />
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        onClick={handleDelete}
                        disabled={isPending}
                        className="rounded-lg cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive flex items-center gap-2"
                    >
                        <Trash2 size={14} /> {isPending ? "Deleting..." : "Delete Product"}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
