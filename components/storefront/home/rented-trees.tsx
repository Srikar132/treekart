import { getAvailableTrees } from "@/actions/tree.actions";
import { TreeCard, type TreeProduct } from "@/components/storefront/cards/tree-card";
import { AnimatedButton } from "@/components/shared/animated-button";

export async function RentedTrees() {
    try {
        const data = await getAvailableTrees({
            limit: 4,
            filters: { status: ["rented"] }
        });
        const trees = data?.trees || [];

        if (trees.length === 0) {
            return null;
        }

        return (
            <section className="section bg-secondary/10">
                <div className="container">
                    <div className="section-header text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">Thriving Communities</h2>
                        <p className="mt-4 p-base text-muted-foreground">These trees have already found their families for this season.</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 lg:gap-8 mb-12">
                        {trees.map((tree) => {
                            const product: TreeProduct = {
                                id: tree.id,
                                title: `${tree.variety} Mango Tree`,
                                price: tree.price ?? 0,
                                images: Array.isArray(tree.photos) ? (tree.photos as string[]) : [],
                                isSale: false,
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
                            href="/rent?status=rented"
                            label="View All Rented Trees"
                            className="w-auto border-foreground bg-white text-foreground"
                            fillClassName="bg-primary"
                            hoverTextClassName="hover:text-primary-foreground"
                        />
                    </div>
                </div>
            </section>
        );
    } catch (error) {
        console.error("Error fetching rented trees:", error);
        return null; // Don't show the section if it fails
    }
}
