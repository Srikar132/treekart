import { getAvailableTrees } from "@/actions/tree.actions";
import { TreeCard, type TreeProduct } from "@/components/storefront/cards/tree-card";
import { AnimatedButton } from "@/components/shared/animated-button";
import { NoResults } from "@/components/ui/no-results";

export async function AvailableTrees() {
    try {
        const data = await getAvailableTrees({ limit: 4 });
        const trees = data?.trees || [];

        if (trees.length === 0) {
            return null;
        }

        return (
            <section className="section">
                <div className="container">
                    <div className="section-header text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">Available for Lease</h2>
                        <p className="mt-4 p-base text-muted-foreground">Select a premium organic mango tree and start your farm journey today.</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 lg:gap-8 mb-12">
                        {trees.map((tree) => {
                            const product: TreeProduct = {
                                id: tree.id,
                                title: `${tree.variety} Mango Tree`,
                                price: tree.price ?? 0,
                                images: Array.isArray(tree.photos) ? (tree.photos as string[]) : [],
                                isSale: tree.plan_type === 'basic',
                            };
                            return (
                                <div
                                    key={tree.id}
                                    className="w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(25%-2rem)] max-w-[320px]"
                                >
                                    <TreeCard product={product} />
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-center">
                        <AnimatedButton
                            href="/rent"
                            label="View All Trees"
                            className="w-auto border-foreground bg-foreground text-background"
                            fillClassName="bg-primary"
                            hoverTextClassName="hover:text-primary-foreground"
                        />
                    </div>
                </div>
            </section>
        );
    } catch (error) {
        console.error("Error fetching available trees:", error);
        return (
            <section className="section">
                <div className="container">
                    <NoResults
                        title="Unable to load trees"
                        description="Please try again later."
                    />
                </div>
            </section>
        );
    }
}
