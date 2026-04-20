import { adminGetAllUsers } from "@/actions/admin.actions";
import { Search, Shield, UserCircle, MoreHorizontal, Mail, Phone, Calendar } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

export default async function AdminUsersPage() {
  const users = await adminGetAllUsers();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Identity Management</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Control platform access and user roles</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
          <Input
            placeholder="Search by Name, Email or Phone..."
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
                <th className="py-5 px-6">User / Identity</th>
                <th className="py-5 px-6">Role</th>
                <th className="py-5 px-6">Joined Date</th>
                <th className="py-5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user: any) => (
                <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200 shrink-0">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.full_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <UserCircle size={20} />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase">{user.full_name}</p>
                        <div className="flex items-center gap-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                            <Mail size={10} /> {user.email}
                          </p>
                          {user.phone && (
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                              <Phone size={10} /> {user.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <Badge className={cn(
                      "rounded-md text-[8px] font-black uppercase tracking-widest border-0 px-3 py-1",
                      user.role === "admin" ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-600"
                    )}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Calendar size={12} />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger 
                        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-lg text-slate-400 hover:bg-slate-100")}
                      >
                        <MoreHorizontal size={18} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-200 shadow-xl">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-3">Account Control</DropdownMenuLabel>
                          <DropdownMenuItem className="rounded-lg cursor-pointer flex items-center gap-2">
                            <Shield size={14} /> Toggle Admin Role
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="rounded-lg cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive flex items-center gap-2">
                          Suspend Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
