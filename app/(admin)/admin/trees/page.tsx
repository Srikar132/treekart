import { getAllTreesForAdmin } from "@/actions/tree.actions";
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
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

export default async function AdminTreesPage() {
  const trees = await getAllTreesForAdmin();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Tree Inventory</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manage your heritage mango trees</p>
        </div>
        <Button 
          nativeButton={false}
          render={
            <Link href="/admin/trees/new" className="flex items-center gap-2 uppercase tracking-widest text-[10px] font-black">
              <Plus size={16} />
              Add New Tree
            </Link>
          } 
          className="admin-button-primary h-12 px-6" 
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
          <Input
            placeholder="Search by variety, location or ID..."
            className="pl-10 h-12 bg-white border-slate-200 focus-visible:ring-primary/20 rounded-xl text-xs font-medium"
          />
        </div>
        <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 flex items-center gap-2 uppercase tracking-widest text-[10px] font-black">
          <Filter size={16} />
          Filters
        </Button>
      </div>

      {/* Content Card */}
      <div className="data-card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="admin-table-header border-b border-slate-100">
                <th className="py-5 px-6">Tree Details</th>
                <th className="py-5 px-6">Farmer / Estate</th>
                <th className="py-5 px-6">Plan Type</th>
                <th className="py-5 px-6">Price</th>
                <th className="py-5 px-6">Status</th>
                <th className="py-5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {trees.map((tree: any) => (
                <tr key={tree.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        {tree.photos?.[0] ? (
                          <img src={tree.photos[0]} alt={tree.variety} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Plus size={16} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase">#{tree.id.slice(0, 8)}</p>
                        <p className="text-sm font-bold text-slate-600">{tree.variety}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{tree.farmers?.farm_name || 'Individual'}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tree.farmers?.location}</p>
                  </td>
                  <td className="py-5 px-6">
                    <Badge variant="outline" className="rounded-md text-[9px] font-black uppercase tracking-widest border-slate-200 px-3 py-1">
                      {tree.plan_type}
                    </Badge>
                  </td>
                  <td className="py-5 px-6">
                    <p className="text-sm font-black text-slate-900">₹{tree.price.toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Per Season</p>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        tree.status === "available" ? "bg-green-500" : "bg-orange-500"
                      )} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                        {tree.status}
                      </span>
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
                          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Management</DropdownMenuLabel>
                          <DropdownMenuItem 
                            render={
                              <Link href={`/rent/${tree.id}`} target="_blank" className="flex items-center gap-2">
                                <Eye size={14} /> View Public Page
                              </Link>
                            } 
                            className="rounded-lg cursor-pointer" 
                          />
                          <DropdownMenuItem 
                            render={
                              <Link href={`/admin/trees/${tree.id}`} className="flex items-center gap-2">
                                <Edit size={14} /> Edit Details
                              </Link>
                            } 
                            className="rounded-lg cursor-pointer" 
                          />
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="rounded-lg cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive">
                          <div className="flex items-center gap-2">
                            <Trash2 size={14} /> Delete Record
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {trees.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No trees found in inventory</p>
          </div>
        )}
      </div>
    </div>
  );
}
