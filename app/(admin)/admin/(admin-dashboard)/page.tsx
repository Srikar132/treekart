import { getAdminStats, getRecentActivity } from "@/actions/admin.actions";
import {
  Users,
  TreePine,
  ShoppingBag,
  IndianRupee,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Order, Rental, Profile, Tree } from "@/types/database.types";

interface AdminStats {
  users: number;
  trees: number;
  orders: number;
  revenue: number;
}

type RentalWithDetails = Rental & {
  profiles: Pick<Profile, 'full_name'> | null;
  trees: Pick<Tree, 'variety'> | null;
};

type OrderWithProfile = Order & {
  profiles: Pick<Profile, 'full_name'> | null;
};

export default async function AdminDashboard() {
  const [stats, activity] = await Promise.all([
    getAdminStats(),
    getRecentActivity()
  ]);
  const { recentOrders, recentRentals } = activity as {
    recentOrders: OrderWithProfile[];
    recentRentals: RentalWithDetails[];
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <Header />

      {/* Metrics Grid */}
      <StatsGrid stats={stats as AdminStats} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Rentals */}
        <RecentRentals rentals={recentRentals} />

        {/* Recent Orders */}
        <RecentOrders orders={recentOrders} />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">System Overview</h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Real-time performance metrics</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden md:block">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Last Sync</p>
          <p className="text-xs font-bold text-foreground">Just Now</p>
        </div>
        <div className="h-10 w-10 bg-card border border-border rounded-xl flex items-center justify-center shadow-sm">
          <Clock size={18} className="text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

function StatsGrid({ stats }: { stats: AdminStats }) {
  const metrics = [
    { label: "Total Users", value: stats.users, icon: Users, color: "bg-blue-500", trend: "+12%" },
    { label: "Tree Inventory", value: stats.trees, icon: TreePine, color: "bg-green-500", trend: "+3%" },
    { label: "Store Orders", value: stats.orders, icon: ShoppingBag, color: "bg-orange-500", trend: "+18%" },
    { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: IndianRupee, color: "bg-purple-500", trend: "+25%" },
  ];

  return (
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
            <p className="text-2xl font-black text-foreground">{m.value}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{m.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentRentals({ rentals }: { rentals: RentalWithDetails[] }) {
  return (
    <div className="lg:col-span-7 data-card">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-green-100 dark:bg-green-900/30 flex items-center justify-center rounded-lg text-green-600 dark:text-green-400">
            <TreePine size={18} />
          </div>
          <h3 className="text-sm font-black text-foreground uppercase">Recent Tree Rents</h3>
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
          <tbody className="divide-y divide-border">
            {rentals.map((rental) => (
              <tr key={rental.id} className="group hover:bg-muted/50 transition-colors">
                <td className="py-4 px-2">
                  <p className="text-xs font-bold text-foreground uppercase truncate max-w-[120px]">{rental.profiles?.full_name}</p>
                </td>
                <td className="py-4 px-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">{rental.trees?.variety}</p>
                </td>
                <td className="py-4 px-2">
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 rounded-md text-[8px] font-black uppercase tracking-widest border-0">
                    {rental.status}
                  </Badge>
                </td>
                <td className="py-4 px-2 text-right">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">
                    {rental.rented_at ? new Date(rental.rented_at).toLocaleDateString() : 'N/A'}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecentOrders({ orders }: { orders: OrderWithProfile[] }) {
  return (
    <div className="lg:col-span-5 data-card">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center rounded-lg text-orange-600 dark:text-orange-400">
            <ShoppingBag size={18} />
          </div>
          <h3 className="text-sm font-black text-foreground uppercase">Latest Orders</h3>
        </div>
        <Link href="/admin/orders" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest flex items-center gap-1">
          Manage <ArrowUpRight size={12} />
        </Link>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders?search=${order.id.slice(0, 8)}`}
            className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/20 hover:bg-primary/5 transition-all bg-muted/30 group cursor-pointer block"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-card border border-border rounded-lg flex items-center justify-center shadow-sm text-muted-foreground group-hover:text-primary transition-colors">
                <ShoppingBag size={18} />
              </div>
              <div>
                <p className="text-xs font-black text-foreground uppercase">#{order.id.slice(0, 8)}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{order.profiles?.full_name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-foreground">₹{order.total_amount}</p>
              <p className="text-[9px] font-bold text-green-600 uppercase tracking-widest">{order.status}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
