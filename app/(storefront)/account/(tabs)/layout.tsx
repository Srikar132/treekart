import { requireUser } from "@/lib/auth";
import { getMyRentals } from "@/actions/user.actions";
import { getUserOrders } from "@/actions/order.actions";
import { AccountNav } from "@/components/storefront/account/account-nav";

export default async function AccountTabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const [rentals, orders] = await Promise.all([getMyRentals(), getUserOrders()]);
  const confirmedOrdersCount = orders.filter((o) =>
    ["confirmed", "shipped", "delivered"].includes(o.status?.toLowerCase() || "")
  ).length;

  return (
    <div
      className="w-full max-w-full overflow-x-hidden pb-16"
      style={{ overflowX: "hidden", maxWidth: "100vw" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-5 mb-10 md:mb-16">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none uppercase">
              Member <span className="text-primary italic font-serif lowercase">Portal</span>
            </h1>
            <p
              className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]"
              style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              Welcome back, {user.full_name?.split(" ")[0] ?? "User"} · Your Orchard is waiting
            </p>
          </div>

          <AccountNav rentalsCount={rentals.length} ordersCount={confirmedOrdersCount} />
        </div>

        <div className="animate-in overflow-x-hidden fade-in slide-in-from-bottom-4 duration-700 min-h-[400px]">
          {children}
        </div>
      </div>
    </div>
  );
}
