import { adminGetAllOrders } from "@/actions/order.actions";
import { Search, Filter, MoreHorizontal, ShoppingBag, Eye, Truck, CheckCircle, Trash2 } from "lucide-react";
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

export default async function AdminOrdersPage() {
  const orders = await adminGetAllOrders();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Fulfillment Center</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Process and track mango shop orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
          <Input 
            placeholder="Search by Order ID or Customer..." 
            className="pl-10 h-12 bg-white border-slate-200 focus-visible:ring-primary/20 rounded-xl text-xs font-medium"
          />
        </div>
        <div className="flex gap-2">
          {["confirmed", "shipped", "delivered"].map((status) => (
            <Button key={status} variant="outline" className="h-12 px-4 rounded-xl border-slate-200 text-[9px] font-black uppercase tracking-widest hover:bg-slate-50">
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="data-card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="admin-table-header border-b border-slate-100">
                <th className="py-5 px-6">Order ID</th>
                <th className="py-5 px-6">Customer</th>
                <th className="py-5 px-6">Amount</th>
                <th className="py-5 px-6">Status</th>
                <th className="py-5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map((order: any) => (
                <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 border border-orange-100">
                        <ShoppingBag size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase">#{order.id.slice(0, 8)}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <p className="text-xs font-bold text-slate-900 uppercase">{order.profiles?.full_name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{order.profiles?.phone || 'No Phone'}</p>
                  </td>
                  <td className="py-5 px-6">
                    <p className="text-sm font-black text-slate-900">₹{order.total_amount.toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-green-600 uppercase tracking-widest">Paid via Razorpay</p>
                  </td>
                  <td className="py-5 px-6">
                    <Badge className={cn(
                      "rounded-md text-[8px] font-black uppercase tracking-widest border-0 px-3 py-1",
                      order.status === "confirmed" ? "bg-blue-100 text-blue-600" :
                      order.status === "shipped" ? "bg-orange-100 text-orange-600" :
                      "bg-green-100 text-green-600"
                    )}>
                      {order.status}
                    </Badge>
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
                          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-3">Fulfillment Action</DropdownMenuLabel>
                          <DropdownMenuItem className="rounded-lg cursor-pointer flex items-center gap-2">
                            <Eye size={14} /> View Manifest
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="rounded-lg cursor-pointer flex items-center gap-2 text-orange-600">
                            <Truck size={14} /> Mark as Shipped
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg cursor-pointer flex items-center gap-2 text-green-600">
                            <CheckCircle size={14} /> Mark as Delivered
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="rounded-lg cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive flex items-center gap-2">
                          <Trash2 size={14} /> Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No orders pending fulfillment</p>
          </div>
        )}
      </div>
    </div>
  );
}
