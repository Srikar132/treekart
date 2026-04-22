import { Metadata } from "next";
import { AboutClient } from "@/components/storefront/about/about-client";

export const metadata: Metadata = {
  title: "About Us — TreeKart",
  description: "Learn about our mission to bring fresh, organic Alphonso mangoes from our orchards to your doorstep.",
};

export default function AboutPage() {
  return <AboutClient />;
}