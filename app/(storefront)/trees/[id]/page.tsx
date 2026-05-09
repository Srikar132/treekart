import { Suspense } from "react";
import { getAvailableTrees, getTreeById, getActiveRental, getTreeUpdates } from "@/actions/tree.actions";
import { getUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { TreeMedia } from "@/components/storefront/trees/tree-media";
import { TreeInfo } from "@/components/storefront/trees/tree-info";
import { TreeUpdates } from "@/components/storefront/trees/tree-updates";
import { RelatedTrees } from "@/components/storefront/trees/related-trees";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type Props = { params: Promise<{ id: string }> };

// export const revalidate = 3600; // 1 hour ISR

// export async function generateStaticParams() {
//   const { trees } = await getAvailableTrees({ 
//     limit: 1000,
//     filters: { status: ["available", "rented"] }
//   });
//   return trees.map((tree) => ({
//     id: String(tree.id),
//   }));
// }

export default async function TreeDetailsPage({ params }: Props) {
  const { id } = await params;

  // Only block on critical above-the-fold data
  const [tree, currentUser] = await Promise.all([
    getTreeById(id),
    getUser()
  ]);

  if (!tree) return notFound();

  const isRented = tree.status === "rented";

  return (
    <main className="container py-10 lg:py-16 space-y-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        <TreeMedia
          images={Array.isArray(tree.photos) ? (tree.photos as string[]) : []}
          title={tree.variety || "Mango Tree"}
        />
        <Suspense fallback={<TreeInfoSkeleton />}>
          <TreeInfoStream treeId={id} currentUserId={currentUser?.id ?? null} tree={tree as any} />
        </Suspense>
      </div>

      <Separator />

      {isRented && (
        <Suspense fallback={<UpdatesSkeleton />}>
          <TreeUpdatesStream treeId={id} />
        </Suspense>
      )}

      <Suspense fallback={<RelatedTreesSkeleton />}>
        <RelatedTreesStream planType={tree.plan_type} excludeId={id} />
      </Suspense>
    </main>
  );
}

// ── Stream resolvers (co-located, not exported) ───────────────────────────────

async function TreeInfoStream({ tree, treeId, currentUserId }: {
  tree: NonNullable<Awaited<ReturnType<typeof getTreeById>>>;
  treeId: string;
  currentUserId: string | null;
}) {
  const isRented = tree.status === "rented";
  const activeRental = isRented ? await getActiveRental(treeId) : null;

  return (
    <TreeInfo
      tree={tree as any}
      activeRental={activeRental}
    />
  );
}

async function TreeUpdatesStream({ treeId }: { treeId: string }) {
  const activeRental = await getActiveRental(treeId);
  if (!activeRental) return null;
  const updates = await getTreeUpdates(activeRental.id);
  if (updates.length === 0) return null;
  return <TreeUpdates updates={updates} />;
}

async function RelatedTreesStream({ planType, excludeId }: {
  planType: string | null;
  excludeId: string;
}) {
  const { trees } = await getAvailableTrees({
    filters: { planType: planType ? [planType as any] : undefined },
    excludeId,
    limit: 8,
  });
  return <RelatedTrees trees={trees} />;
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

function TreeInfoSkeleton() {
  return (
    <div className="flex flex-col space-y-6 pt-4">
      <div className="space-y-3">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-1/3" />
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      <div className="space-y-2 pt-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      <div className="pt-6">
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>

      <Separator className="my-6" />

      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
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