import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSupabaseServer, requireUser } from "@/lib/auth";
import RentalCheckoutClient from "./rental-checkout-client";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "Checkout | TreeKart Rental",
  description: "Secure your mango tree for the upcoming season.",
};

export default async function RentalCheckoutPage({ params }: Props) {
  const { id } = await params;
  const user = await requireUser();
  const supabase = await getSupabaseServer();

  const { data: tree, error } = await supabase
    .from("trees")
    .select(`
      id,
      variety,
      price,
      plan_type,
      yield_min_kg,
      yield_max_kg,
      photos,
      gps_lat,
      gps_lng,
      status
    `)
    .eq("id", id)
    .single();

  if (error || !tree) {
    return notFound();
  }

  // Double check availability (though middleware/actions also check)
  if (tree.status !== "available" && tree.status !== "inactive") {
    // If it's rented already, don't allow checkout
    return notFound();
  }


  return <RentalCheckoutClient tree={tree as any} user={user as any} />;
}