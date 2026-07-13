import { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getMyRentals } from "@/actions/user.actions";
import { RentalsList } from "@/components/storefront/account/rentals-list";

export const metadata: Metadata = {
  title: "My Trees — TreeKart",
  robots: { index: false, follow: false },
};

export default async function AccountRentalsPage() {
  await requireUser();
  const rentals = await getMyRentals();

  return <RentalsList rentals={rentals} />;
}
