import { Metadata } from "next";
import { AboutClient } from "@/components/storefront/about/about-client";

export const metadata: Metadata = {
  title: "About Us — TreeKart",
  description: "Learn about our mission to bring fresh, organic Alphonso mangoes from our orchards to your doorstep through our unique tree adoption program.",
  keywords: ["about TreeKart", "mango orchard mission", "organic mango farming", "sustainable agriculture", "Tree adoption story"],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Us — TreeKart",
    description: "Learn about our mission to bring fresh, organic Alphonso mangoes from our orchards to your doorstep.",
    url: "https://www.treekart.in/about",
    siteName: "TreeKart",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "About TreeKart",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us — TreeKart",
    description: "Learn about our mission to bring fresh, organic Alphonso mangoes from our orchards to your doorstep.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  return <AboutClient />;
}