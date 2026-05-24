import { Suspense } from "react";
import { getAvailableTrees, getTreeById, getActiveRental, getTreeUpdates } from "@/actions/tree.actions";
import { getAppSettings } from "@/actions/admin.actions";
import { notFound } from "next/navigation";
import { TreeMedia } from "@/components/storefront/trees/tree-media";
import { TreeInfo } from "@/components/storefront/trees/tree-info";
import { TreeUpdates } from "@/components/storefront/trees/tree-updates";
import { RelatedTrees } from "@/components/storefront/trees/related-trees";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle } from "lucide-react";
import { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const tree = await getTreeById(id);

  if (!tree) return {};

  const title = `${tree.variety || "Mango Tree"} — Heritage Orchard Rental`;
  const description = `Rent this ${tree.variety} tree aged ${tree.age_years} years from ${tree.farmers?.farm_name || "our orchard"}. Get a guaranteed harvest of ${tree.yield_min_kg}-${tree.yield_max_kg}kg fresh mangoes.`;
  const photos = Array.isArray(tree.photos) ? (tree.photos as string[]) : [];
  const ogImage = photos[0] || "/og-image.png";

  return {
    title,
    description,
    keywords: [
      "rent mango tree",
      `${tree.variety} mango`,
      "orchard rental",
      "tree adoption India",
      "fresh alphonso mangoes",
      "sustainable farming",
    ],
    alternates: {
      canonical: `/trees/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.treekart.in/trees/${id}`,
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

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const { trees } = await getAvailableTrees({
    limit: 1000,
    filters: { status: ["available", "rented"] },
  });
  return trees.map((tree) => ({ id: String(tree.id) }));
}

export default async function TreeDetailsPage({ params }: Props) {
  const { id } = await params;

  const [tree, settings] = await Promise.all([
    getTreeById(id),
    getAppSettings(),
  ]);

  if (!tree) return notFound();

  const isRented = tree.status === "rented";

  return (
    <main className="container py-10 lg:py-16 space-y-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": `${tree.variety || "Mango Tree"} Orchard Rental`,
            "description": `Rent a ${tree.age_years} year old ${tree.variety} mango tree. Yield: ${tree.yield_min_kg}-${tree.yield_max_kg}kg.`,
            "image": Array.isArray(tree.photos) ? (tree.photos as string[]) : [],
            "offers": {
              "@type": "Offer",
              "price": tree.price,
              "priceCurrency": "INR",
              "availability": tree.status === "available" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            },
            "brand": {
              "@type": "Brand",
              "name": "TreeKart"
            }
          })
        }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        <TreeMedia
          images={Array.isArray(tree.photos) ? (tree.photos as string[]) : []}
          title={tree.variety || "Mango Tree"}
        />
        <TreeInfo
          tree={tree as any}
          rentalDeliveryFee={settings.rental_delivery_fee}
          rentalBadge={
            isRented
              ? (
                <Suspense fallback={<ActiveRentalSkeleton />}>
                  <ActiveRentalStream treeId={id} />
                </Suspense>
              )
              : undefined
          }
        />
      </div>

      <Separator />

      {isRented && (
        <Suspense fallback={<UpdatesSkeleton />}>
          <TreeUpdatesStream treeId={id} />
        </Suspense>
      )}

      <Suspense fallback={<RelatedTreesSkeleton />}>
        <RelatedTreesStream planId={tree.plan_id} excludeId={id} />
      </Suspense>
    </main>
  );
}

// ── Stream resolvers (co-located, not exported) ───────────────────────────────

async function ActiveRentalStream({ treeId }: { treeId: string }) {
  const rental = await getActiveRental(treeId);
  const profile = rental?.profiles
    ? Array.isArray(rental.profiles) ? rental.profiles[0] : rental.profiles
    : null;

  if (!profile) {
    return (
      <>
        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm">
          <UserCircle className="text-slate-400" size={24} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Status</p>
          <p className="text-lg font-bold text-foreground">Already Rented</p>
        </div>
      </>
    );
  }
  return (
    <>
      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
        <AvatarImage src={profile.avatar_url || ""} />
        <AvatarFallback className="bg-primary/10 text-primary uppercase">
          {profile.full_name?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Currently Leased By</p>
        <p className="text-lg font-bold text-foreground">{profile.full_name}</p>
      </div>
    </>
  );
}

async function TreeUpdatesStream({ treeId }: { treeId: string }) {
  const activeRental = await getActiveRental(treeId);
  if (!activeRental) return null;
  const updates = await getTreeUpdates(activeRental.id);
  if (updates.length === 0) return null;
  return <TreeUpdates updates={updates} />;
}

async function RelatedTreesStream({ planId, excludeId }: {
  planId: string | null;
  excludeId: string;
}) {
  const { trees } = await getAvailableTrees({
    filters: { planId: planId ? [planId] : undefined },
    excludeId,
    limit: 8,
  });
  return <RelatedTrees trees={trees} />;
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

function ActiveRentalSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-40" />
      </div>
    </div>
  );
}

function UpdatesSkeleton() {
  return (
    <section className="space-y-12">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-48" />
      </div>

      <div className="relative border-l-2 border-muted ml-4 space-y-14 pb-8">
        {[1, 2].map(i => (
          <div key={i} className="relative pl-10 space-y-4">
            <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-muted border-4 border-background" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-full max-w-2xl" />
            </div>
            <Skeleton className="max-w-2xl aspect-video rounded-2xl" />
          </div>
        ))}
      </div>
    </section>
  );
}

function RelatedTreesSkeleton() {
  return (
    <div className="space-y-10 py-10">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-[4/5] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
