"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, CheckCircle, Info, Scale, Tag, Sparkles, Share2 } from "lucide-react";
import { useMangoCart } from "@/store/use-mango-cart";
import { useState } from "react";
import { AnimatedButton } from "@/components/shared/animated-button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ShareDialog } from "@/components/shared/share-dialog";

interface ProductInfoProps {
  product: {
    id: string;
    name: string;
    variety: string;
    price: number;
    original_price: number | null;
    description: string | null;
    weight_kg: number | null;
    badge: string | null;
    status: string | null;
    image_url: string | null;
  };
}

export function ProductInfo({ product }: ProductInfoProps) {
  const router = useRouter();
  const { add } = useMangoCart();
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const discount = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = async () => {
    setIsAdding(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    add({
      id: product.id,
      name: product.name,
      variety: product.variety,
      price: product.price,
      pricePerKg: product.price,
      imageUrl: product.image_url || "/placeholder-mango.png",
      badge: product.badge as any,
      weightKg: product.weight_kg,
      qty: quantity,
    });

    setIsAdding(false);
  };

  const handleBuyNow = async () => {
    handleAddToCart();
    router.push("/checkout/store");
  };

  const increment = () => setQuantity(prev => prev + 1);
  const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col h-full"
    >
      <motion.div variants={item} className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {product.badge && product.badge !== 'None' && (
              <Badge className={cn(
                "font-medium px-4 py-1",
                product.badge === 'Sale' ? "bg-red-500 hover:bg-red-600" :
                  product.badge === 'New' ? "bg-green-500 hover:bg-green-600" :
                    "bg-blue-500 hover:bg-blue-600"
              )}>
                {product.badge}
              </Badge>
            )}
            {discount > 0 && (
              <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 font-medium px-4 py-1">
                {discount}% OFF
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
            <ShareDialog
              trigger={
                <button className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
              }
            />
          </div>
        </div>

        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground capitalize">
          {product.name}
        </h1>

        <div className="flex items-baseline gap-4">
          <span className="text-3xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-xl text-muted-foreground line-through">₹{product.original_price.toLocaleString()}</span>
          )}
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 gap-6 mb-10">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
          <Scale className="text-primary" size={24} />
          <div>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Weight</p>
            <p className="font-bold">Upto {product.weight_kg || "N/A"} Kg</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
          <Tag className="text-primary" size={24} />
          <div>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Variety</p>
            <p className="font-bold">{product.variety}</p>
          </div>
        </div>
      </motion.div>

      {product.description && (
        <motion.div variants={item} className="mb-10 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Product Description</h3>
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        </motion.div>
      )}

      <motion.div variants={item} className="space-y-6 mb-10">
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Highlights</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-foreground font-medium text-sm">
              <Sparkles size={16} className="text-primary" />
              <span>Naturally Ripened, Carbide Free</span>
            </li>
            <li className="flex items-center gap-2 text-foreground font-medium text-sm">
              <CheckCircle size={16} className="text-primary" />
              <span>Sourced directly from our farms</span>
            </li>
          </ul>
        </div>
      </motion.div>

      <motion.div variants={item} className="mt-auto pt-8 border-t">
        {product.status === 'out_of_stock' ? (
          <div className="bg-muted border rounded-xl p-6 text-center">
            <p className="font-bold text-muted-foreground">Temporarily Out of Stock</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center h-16 px-4 rounded-xl border border-border bg-secondary/20 font-bold min-w-[140px] justify-between">
                <button
                  onClick={decrement}
                  className="w-8 h-8 flex items-center justify-center hover:text-primary transition-colors"
                >
                  -
                </button>
                <span className="text-lg w-8 text-center">{quantity}</span>
                <button
                  onClick={increment}
                  className="w-8 h-8 flex items-center justify-center hover:text-primary transition-colors"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <AnimatedButton
                label={isAdding ? "Adding..." : "Add to Cart"}
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 h-16 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all rounded-xl bg-primary text-white border-transparent tracking-normal uppercase"
                fillClassName="bg-white"
                hoverTextClassName="hover:text-primary"
              />
            </div>

            {/* Buy It Now */}
            <AnimatedButton
              label="Buy It Now"
              fillClassName="bg-primary"
              hoverTextClassName="hover:text-primary-foreground"
              onClick={handleBuyNow}
              className="w-full h-16 text-lg font-bold rounded-xl bg-white text-black border-2 border-black hover:bg-gray-50 transition-all uppercase tracking-wider shadow-sm"
            >
              Buy It Now
            </AnimatedButton>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
