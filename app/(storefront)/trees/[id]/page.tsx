import { getAvailableTrees, getTreeById, getTreeUpdates } from "@/actions/tree.actions";
import { notFound } from "next/navigation";
import { TreeMedia } from "@/components/storefront/trees/tree-media";
import { TreeInfo } from "@/components/storefront/trees/tree-info";
import { TreeUpdates } from "@/components/storefront/trees/tree-updates";
import { RelatedTrees } from "@/components/storefront/trees/related-trees";
import { TreeArticle } from "@/components/storefront/trees/tree-article";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TreeDetailsPage({ params }: Props) {
  const { id } = await params;

  try {
    const [tree, updates] = await Promise.all([
      getTreeById(id),
      getTreeUpdates(id),
    ]);

    if (!tree) {
      return notFound();
    }

    // Fetch related trees (same variety, excluding current one)
    const { trees: relatedTrees } = await getAvailableTrees({
      filters: {
        planType: tree.plan_type ? [tree.plan_type as any] : undefined,
      },
      excludeId: id,
      limit: 8,
    });

    return (
      <main className="container py-10 lg:py-16 space-y-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Tree Images */}
          <TreeMedia
            images={Array.isArray(tree.photos) ? (tree.photos as string[]) : []}
            title={tree.variety || "Mango Tree"}
          />

          {/* Right: Tree Info */}
          <TreeInfo tree={tree as any} />
        </div>

        {/* Ad Image Section (Figma style) */}
        {/* <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden group">
          <Image
            src="https://images.unsplash.com/photo-1595856417531-b6a1e505cc3e?auto=format&fit=crop&q=80&w=1920"
            alt="Farm Advertisement"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white p-6 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Direct From Our Farm to Your Home</h2>
            <p className="text-lg md:text-xl max-w-2xl opacity-90">Experience the purest Alphonso mangoes, grown with care and delivered with love.</p>
          </div>
        </div> */}

        <Separator />

        {/* Tree Updates Section */}
        <TreeUpdates updates={updates || []} />

        <Separator />

        {/* Related Trees Section */}
        <RelatedTrees trees={relatedTrees} />
      </main>
    );
  } catch (error) {
    console.error("Error fetching tree details:", error);
    return notFound();
  }
}
