import { adminGetAllBlogs } from "@/actions/blog.actions";
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, BookOpen } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default async function AdminBlogsPage() {
  const blogs = await adminGetAllBlogs();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Journal Management</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Craft narratives for your orchard stories</p>
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

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
          <Input
            placeholder="Search by title, category or author..."
            className="pl-10 h-12 bg-white border-slate-200 focus-visible:ring-primary/20 rounded-xl text-xs font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <div className="data-card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="admin-table-header border-b border-slate-100">
                <th className="py-5 px-6">Article Story</th>
                <th className="py-5 px-6">Category</th>
                <th className="py-5 px-6">Author</th>
                <th className="py-5 px-6">Status</th>
                <th className="py-5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {blogs.map((blog: any) => (
                <tr key={blog.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 px-6">
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
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(blog.published_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <Badge variant="outline" className="rounded-md text-[8px] font-black uppercase tracking-widest border-slate-200 px-2 py-0.5">
                      {blog.category}
                    </Badge>
                  </td>
                  <td className="py-5 px-6">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-tight">{blog.author}</p>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Published</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right">
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
                            render={
                              <Link href={`/blog/${blog.slug}`} target="_blank" className="flex items-center gap-2">
                                <Eye size={14} /> Read in Journal
                              </Link>
                            }
                            className="rounded-lg cursor-pointer"
                          />
                          <DropdownMenuItem
                            render={
                              <Link href={`/admin/blogs/${blog.id}`} className="flex items-center gap-2">
                                <Edit size={14} /> Edit Story
                              </Link>
                            }
                            className="rounded-lg cursor-pointer"
                          />
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="rounded-lg cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive flex items-center gap-2">
                          <Trash2 size={14} /> Delete Entry
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {blogs.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No stories found in orchard log</p>
          </div>
        )}
      </div>
    </div>
  );
}
