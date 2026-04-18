import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Search } from "lucide-react";

export type TreeProduct = {
    id: string | number;
    title: string;
    price: number;
    oldPrice?: number;
    image: string;
    isSale?: boolean;
};

interface TreeCardProps {
    product: TreeProduct;
}

export function TreeCard({ product }: TreeCardProps) {
    return (
        <div className="group flex flex-col h-full">
            {/* Image Container */}
            <div className="relative aspect-square w-full  overflow-hidden mb-5">
                {/* Sale Ribbon */}
                {product.isSale && (
                    <div className="absolute top-2 -right-7 w-30 h-8 bg-red-500 text-white flex items-end justify-center pb-2 rotate-45 z-10 shadow-sm">
                        <span className="text-sm font-bold uppercase tracking-wider">Sale</span>
                    </div>
                )}

                {/* Product Image */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                        src={product.image}
                        alt={product.title}
                        width={300}
                        height={300}
                        className="object-contain w-full h-full drop-shadow-md group-hover:scale-105 transition-transform duration-500"
                    />
                </div>

                {/* Hover Actions */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-3 opacity-100 translate-y-0 lg:opacity-0 lg:translate-y-4 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 transition-all duration-300 z-20">
                    <button className="w-10 h-10 rounded-full bg-white text-foreground flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-colors" title="Add to Cart">
                        <ShoppingBag className="w-4 h-4" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white text-foreground flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-colors" title="Quick View">
                        <Search className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Text Content */}
            <div className="text-center mt-auto">
                <Link href={`/trees/${product.id}`} className="inline-block hover:text-primary transition-colors">
                    <h3 className="text-base font-bold text-foreground mb-1">{product.title}</h3>
                </Link>
                <div className="flex items-center justify-center gap-2 font-medium">
                    <span className="text-primary">${product.price.toFixed(2)}</span>
                    {product.oldPrice && (
                        <span className="text-muted-foreground line-through text-sm">${product.oldPrice.toFixed(2)}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
