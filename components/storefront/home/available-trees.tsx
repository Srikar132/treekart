import { TreeCard, type TreeProduct } from "@/components/storefront/cards/tree-card";
import { AnimatedButton } from "@/components/shared/animated-button";

interface AvailableTreesProps {
    initialTrees: any[];
}

export function AvailableTrees({ initialTrees }: AvailableTreesProps) {
    if (initialTrees.length === 0) {
        return null;
    }

    return (
        <section className="section bg-white">
            <div className="container">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase mb-4">Available for Lease</h2>
                    <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Start your organic orchard journey today</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {initialTrees.map((tree) => {
                        const product: TreeProduct = {
                            id: tree.id,
                            title: `${tree.variety} Mango Tree`,
                            price: tree.price ?? 0,
                            images: Array.isArray(tree.photos) ? (tree.photos as string[]) : [],
                            isSale: tree.plan_type === 'basic',
                        };
                        return (
                            <TreeCard key={tree.id} product={product} />
                        );
                    })}
                </div>

                <div className="flex justify-center">
                    <AnimatedButton
                        href="/rent"
                        label="View Full Orchard"
                        className="h-14 px-10 border-slate-900 text-slate-900"
                        fillClassName="bg-slate-900"
                        hoverTextClassName="hover:text-white"
                    />
                </div>
            </div>
        </section>
    );
}
