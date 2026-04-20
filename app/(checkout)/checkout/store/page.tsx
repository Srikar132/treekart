import { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import StoreCheckoutClient from "./store-checkout-client";

export const metadata: Metadata = {
  title: "Checkout — TreeKart Store",
  description: "Finalize your order for fresh, organic Alphonso mangoes.",
};

export default async function StoreCheckoutPage() {
  const user = await requireUser();

  return (
    <StoreCheckoutClient 
      user={{
        full_name: user.full_name || "",
        phone: user.phone || "",
        email: user.email || "",
      }} 
    />
  );
}