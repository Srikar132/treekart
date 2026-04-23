import { TreeCard, type TreeProduct } from "@/components/storefront/cards/tree-card";
import { AnimatedButton } from "@/components/shared/animated-button";

interface RentedTreesProps {
    initialTrees: any[];
}

export function RentedTrees({ initialTrees }: RentedTreesProps) {
    if (initialTrees.length === 0) {
        return null;
    }

    return (
        <section className="section bg-slate-50/50">
            <div className="container">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase mb-4">Thriving Communities</h2>
                    <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.3em]">These trees have already found their families</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {initialTrees.map((tree) => {
                        const product: TreeProduct = {
                            id: tree.id,
                            title: `${tree.variety} Mango Tree`,
                            price: tree.price ?? 0,
                            images: Array.isArray(tree.photos) ? (tree.photos as string[]) : [],
                            isSale: false,
                        };
                        return (
                            <TreeCard key={tree.id} product={product} />
                        );
                    })}
                </div>

                <div className="flex justify-center">
                    <AnimatedButton
                        href="/rent"
                        label="Explore Full Inventory"
                        className="h-14 px-10 border-slate-200 text-slate-400"
                        fillClassName="bg-slate-900"
                        hoverTextClassName="hover:text-white"
                    />
                </div>
            </div>
        </section>
    );
}
