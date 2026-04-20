import { adminGetAllRentals } from "@/actions/admin.actions";
import { Search, Filter, MoreHorizontal, TreePine, Eye, ShieldCheck, Mail, Phone, Trash2, Plus } from "lucide-react";
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

export default async function AdminRentalsPage() {
  const rentals = await adminGetAllRentals();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Leasing Management</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Oversee heritage tree rental agreements</p>
      </div>

      {/* Stats/Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
          <Input
            placeholder="Search by Member, Email or Tree ID..."
            className="pl-10 h-12 bg-white border-slate-200 focus-visible:ring-primary/20 rounded-xl text-xs font-medium"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest">
            Export Records
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="data-card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="admin-table-header border-b border-slate-100">
                <th className="py-5 px-6">Member Details</th>
                <th className="py-5 px-6">Heritage Tree</th>
                <th className="py-5 px-6">Season</th>
                <th className="py-5 px-6">Verification</th>
                <th className="py-5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rentals.map((rental: any) => (
                <tr key={rental.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 px-6">
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase">{rental.profiles?.full_name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          <Mail size={10} /> {rental.profiles?.email}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          <Phone size={10} /> {rental.profiles?.phone || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600 border border-green-100">
                        <TreePine size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase">{rental.trees?.variety}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{rental.trees?.location_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <p className="text-xs font-black text-slate-900">{rental.season}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Lease</p>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                        <ShieldCheck size={14} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                        {rental.status}
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
                      <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-200 shadow-xl">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-3">Lease Operations</DropdownMenuLabel>
                          <DropdownMenuItem 
                            render={
                              <Link href={`/account/rentals/${rental.id}`} target="_blank" className="flex items-center gap-2">
                                <Eye size={14} /> View Member Portal
                              </Link>
                            } 
                            className="rounded-lg cursor-pointer" 
                          />
                          <DropdownMenuItem className="rounded-lg cursor-pointer flex items-center gap-2">
                            <Plus size={14} /> Post Growth Update
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="rounded-lg cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive flex items-center gap-2">
                          <Trash2 size={14} /> Terminate Lease
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rentals.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No active tree rental agreements</p>
          </div>
        )}
      </div>
    </div>
  );
}
