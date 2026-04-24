// app/admin/users/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { User, Shield, Tractor, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

export const userColumns: ColumnDef<any>[] = [
    {
        accessorKey: "full_name",
        header: "User",
        cell: ({ row }) => {
            const user = row.original
            return (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground border border-border overflow-hidden">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                        ) : (
                            <User size={20} />
                        )}
                    </div>
                    <div>
                        <p className="text-xs font-black text-foreground uppercase">{user.full_name || 'Anonymous'}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{user.phone || 'No Phone'}</p>
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const role = row.getValue("role") as string
            return (
                <div className="flex items-center gap-2">
                    {role === 'admin' ? <Shield size={12} className="text-primary" /> : role === 'farmer' ? <Tractor size={12} className="text-orange-600" /> : <User size={12} className="text-muted-foreground" />}
                    <Badge className={cn(
                        "rounded-md text-[8px] font-black uppercase tracking-widest border-0 px-3 py-1",
                        role === "admin" ? "bg-primary/10 text-primary" :
                        role === "farmer" ? "bg-orange-100 text-orange-600" :
                        "bg-muted text-muted-foreground"
                    )}>
                        {role}
                    </Badge>
                </div>
            )
        }
    },
    {
        accessorKey: "created_at",
        header: "Joined On",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={12} />
                <p className="text-[10px] font-bold uppercase">
                    {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "Unknown"}
                </p>
            </div>
        )
    }
]
