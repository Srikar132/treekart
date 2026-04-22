import { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getMyRentals } from "@/actions/user.actions";
import { getUserOrders } from "@/actions/order.actions";
import { AccountClient } from "@/components/storefront/account/account-client";

export const metadata: Metadata = {
  title: "My Account — TreeKart",
  description: "Manage your heritage tree rentals, track fresh mango orders, and update your orchard concierge preferences.",
};

export default async function AccountPage() {
  // Authenticate user
  const user = await requireUser();

  // Fetch data in parallel
  const [rentals, orders] = await Promise.all([
    getMyRentals(),
    getUserOrders(),
  ]);



  return (
    <main className="section container min-h-screen">
      <AccountClient
        user={user}
        rentals={rentals}
        orders={orders}
      />
    </main>
  );
}