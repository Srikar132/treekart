import { getAdminStats, getRecentActivity } from "@/actions/admin.actions";
import { 
  Users, 
  TreePine, 
  ShoppingBag, 
  IndianRupee,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function AdminDashboard() {
  const stats = await getAdminStats();
  const { recentOrders, recentRentals } = await getRecentActivity();

  const metrics = [
    { label: "Total Users", value: stats.users, icon: Users, color: "bg-blue-500", trend: "+12%" },
    { label: "Tree Inventory", value: stats.trees, icon: TreePine, color: "bg-green-500", trend: "+3%" },
    { label: "Store Orders", value: stats.orders, icon: ShoppingBag, color: "bg-orange-500", trend: "+18%" },
    { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: IndianRupee, color: "bg-purple-500", trend: "+25%" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">System Overview</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Real-time performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Last Sync</p>
            <p className="text-xs font-bold text-slate-900">Just Now</p>
          </div>
          <div className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
            <Clock size={18} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => (
          <div key={m.label} className="data-card group cursor-default">
            <div className="flex items-start justify-between mb-4">
              <div className={`h-12 w-12 ${m.color} rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 duration-500`}>
                <m.icon size={24} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <ArrowUpRight size={10} />
                {m.trend}
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{m.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Rentals */}
        <div className="lg:col-span-7 data-card">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-green-100 flex items-center justify-center rounded-lg text-green-600">
                <TreePine size={18} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Recent Tree Rents</h3>
            </div>
            <Link href="/admin/rentals" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest flex items-center gap-1">
              View All <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="admin-table-header">
                  <th className="pb-4 px-2">Member</th>
                  <th className="pb-4 px-2">Tree Variety</th>
                  <th className="pb-4 px-2">Status</th>
                  <th className="pb-4 px-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRentals.map((rental: any) => (
                  <tr key={rental.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-2">
                      <p className="text-xs font-bold text-slate-900 uppercase truncate max-w-[120px]">{rental.profiles?.full_name}</p>
                    </td>
                    <td className="py-4 px-2">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-tight">{rental.trees?.variety}</p>
                    </td>
                    <td className="py-4 px-2">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 rounded-md text-[8px] font-black uppercase tracking-widest border-0">
                        {rental.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(rental.rented_at).toLocaleDateString()}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-5 data-card">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-orange-100 flex items-center justify-center rounded-lg text-orange-600">
                <ShoppingBag size={18} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Latest Orders</h3>
            </div>
          </div>

          <div className="space-y-4">
            {recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:border-slate-200 transition-all bg-slate-50/30 group">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-slate-400 group-hover:text-primary transition-colors">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase">#{order.id.slice(0, 8)}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.profiles?.full_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900">₹{order.total_amount}</p>
                  <p className="text-[9px] font-bold text-green-600 uppercase tracking-widest">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
