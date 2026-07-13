import { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getUserOrders } from "@/actions/order.actions";
import { OrdersList } from "@/components/storefront/account/orders-list";

export const metadata: Metadata = {
  title: "My Orders — TreeKart",
  robots: { index: false, follow: false },
};

export default async function AccountOrdersPage() {
  await requireUser();
  const orders = await getUserOrders();

  return <OrdersList orders={orders} />;
}
