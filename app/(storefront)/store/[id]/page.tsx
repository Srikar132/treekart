export const revalidate = 3600;
export const dynamicParams = true;

import { getMangoProducts, getProductById } from "@/actions/products.actions";
import { notFound } from "next/navigation";
import { ProductMedia } from "@/components/storefront/shop/product-media";
import { ProductInfo } from "@/components/storefront/shop/product-info";
import { RelatedProducts } from "@/components/storefront/shop/related-products";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) return {};

  const title = `${product.name} — Premium Organic Mangoes`;
  const description = `${product.description} Freshly picked ${product.variety} mangoes from TreeKart orchards. Available in ${product.weight_kg?.join(", ")}kg boxes.`;
  const ogImage = product.image_url?.[0] || "/og-image.png";

  return {
    title,
    description,
    keywords: [
      "buy mangoes online",
      `${product.name}`,
      `${product.variety} mangoes`,
      "organic alphonso",
      "fresh fruit delivery",
      "premium mango boxes",
    ],
    alternates: {
      canonical: `/store/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.treekart.in/store/${id}`,
      siteName: "TreeKart",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export async function generateStaticParams() {
  const { products } = await getMangoProducts({ limit: 1000 });
  return products.map((p) => ({ id: String(p.id) }));
}

export default async function ProductDetailsPage({ params }: Props) {
  const { id } = await params;

  try {
    const product = await getProductById(id);

    if (!product) return notFound();

    return (
      <main className="container py-10 lg:py-16 space-y-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": product.name,
              "description": product.description,
              "image": product.image_url,
              "offers": {
                "@type": "Offer",
                "price": product.price,
                "priceCurrency": "INR",
                "availability": product.status === "available" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
              },
              "brand": {
                "@type": "Brand",
                "name": "TreeKart"
              }
            })
          }}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <ProductMedia image={product.image_url} name={product.name} />
          <ProductInfo product={product as any} />
        </div>

        {/* <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden group">
          <Image
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1920&q=80"
            alt="Farm Advertisement"
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white p-6 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Farm Fresh Handpicked Mangoes</h2>
            <p className="text-lg md:text-xl max-w-2xl opacity-90">Naturally ripened and packed with care. From our groves to your doorstep.</p>
          </div>
        </div> */}

        <Separator />

        {/* Promise passed directly — not awaited */}
        <RelatedProducts
          productsPromise={getMangoProducts({ limit: 8, excludeId: id })}
        />
      </main>
    );
  } catch (error) {
    console.error("Error fetching product details:", error);
    return notFound();
  }
}