import { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getTreeById, getActiveRental } from "@/actions/tree.actions";
import RentalCheckoutClient from "./rental-checkout-client";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Checkout | TreeKart Rental",
  description: "Secure your mango tree for the upcoming season.",
};

export default async function RentalCheckoutPage({ params }: Props) {
  const { id } = await params;
  const user = await requireUser();

  let tree;
  try {
    tree = await getTreeById(id);
  } catch {
    return notFound();
  }

  if (!tree) return notFound();

  // Only hit the rentals table if the tree is actually rented
  const activeRental = tree.status === "rented"
    ? await getActiveRental(id)
    : null;

  // 1. Current user already holds the active rental → drop them into success
  if (activeRental?.user_id === user.id) {
    return <RentalCheckoutClient tree={tree as any} user={user as any} initialStep="success" />;
  }

  // 2. Rented by someone else → nothing to checkout
  if (tree.status === "rented") return notFound();

  // 3. Not available for checkout (e.g. some other inactive state)
  if (tree.status !== "available" && tree.status !== "inactive") return notFound();

  return <RentalCheckoutClient tree={tree as any} user={user as any} />;
}