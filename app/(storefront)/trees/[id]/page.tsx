import { getAvailableTrees, getTreeById, getActiveRental, getTreeUpdates } from "@/actions/tree.actions";
import { notFound } from "next/navigation";
import { TreeMedia } from "@/components/storefront/trees/tree-media";
import { TreeInfo } from "@/components/storefront/trees/tree-info";
import { TreeUpdates } from "@/components/storefront/trees/tree-updates";
import { RelatedTrees } from "@/components/storefront/trees/related-trees";
import { Separator } from "@/components/ui/separator";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TreeDetailsPage({ params }: Props) {
  const { id } = await params;

  try {
    const tree = await getTreeById(id);
    if (!tree) return notFound();

    const isRented = tree.status === "rented";

    // Parallel fetch: active rental + related trees
    // Updates wait on rental id, so they're sequential — unavoidable
    const [activeRental, { trees: relatedTrees }] = await Promise.all([
      isRented ? getActiveRental(id) : Promise.resolve(null),
      getAvailableTrees({
        filters: {
          planType: tree.plan_type ? [tree.plan_type as any] : undefined,
        },
        excludeId: id,
        limit: 8,
      }),
    ]);

    // Updates are scoped to the active rental, not the tree
    const updates = activeRental ? await getTreeUpdates(activeRental.id) : [];
    // console.log(updates);


    return (
      <main className="container py-10 lg:py-16 space-y-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <TreeMedia
            images={Array.isArray(tree.photos) ? (tree.photos as string[]) : []}
            title={tree.variety || "Mango Tree"}
          />
          <TreeInfo tree={tree} activeRental={activeRental} />
        </div>

        <Separator />

        {isRented && updates.length > 0 && (
          <TreeUpdates updates={updates} />
        )}

        {isRented && updates.length > 0 && <Separator />}

        <RelatedTrees trees={relatedTrees} />
      </main>
    );
  } catch (error) {
    console.error("Error fetching tree details:", error);
    return notFound();
  }
}