// app/admin/blogs/columns.tsx
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2, BookOpen, Calendar, User } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useTransition } from "react"
import { adminDeleteBlog } from "@/actions/admin.actions"
import { toast } from "sonner"

export const blogColumns: ColumnDef<any>[] = [
    {
        accessorKey: "title",
        header: "Article Story",
        cell: ({ row }) => {
            const blog = row.original
            return (
                <div className="flex items-center gap-4">
                    <div className="h-12 w-20 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                        {blog.cover_image ? (
                            <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <BookOpen size={16} />
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 truncate max-w-[240px]">{blog.title}</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Calendar size={10} />
                            {new Date(blog.published_at || blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
            <Badge variant="outline" className="rounded-md text-[8px] font-black uppercase tracking-widest border-slate-200 px-2 py-0.5">
                {row.getValue("category")}
            </Badge>
        )
    },
    {
        accessorKey: "author",
        header: "Author",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 text-slate-600">
                <User size={12} />
                <p className="text-xs font-bold uppercase tracking-tight">{row.getValue("author")}</p>
            </div>
        )
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: () => (
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Published</span>
            </div>
        )
    },
    {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => <BlogActions blog={row.original} />
    }
]

function BlogActions({ blog }: { blog: any }) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = async () => {
        if (!confirm("Permanently delete this story from the journal?")) return
        startTransition(async () => {
            try {
                await adminDeleteBlog(blog.id)
                toast.success("Journal entry removed")
            } catch (err: any) {
                toast.error(err.message)
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
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-3">Editorial</DropdownMenuLabel>
                        <DropdownMenuItem
                            className="rounded-lg cursor-pointer"
                            render={(props) => (
                                <Link {...props} href={`/blog/${blog.slug}`} target="_blank" className="w-full flex items-center gap-2" />
                            )}
                        >
                            <Eye size={14} /> Read in Journal
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="rounded-lg cursor-pointer"
                            render={(props) => (
                                <Link {...props} href={`/admin/blogs/${blog.id}`} className="w-full flex items-center gap-2" />
                            )}
                        >
                            <Edit size={14} /> Edit Story
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        onClick={handleDelete}
                        disabled={isPending}
                        className="rounded-lg cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive flex items-center gap-2"
                    >
                        <Trash2 size={14} /> Delete Entry
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
