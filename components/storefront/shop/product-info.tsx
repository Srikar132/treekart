"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Info, Scale, Tag, Sparkles, Share2 } from "lucide-react";
import { useMangoCart } from "@/store/use-mango-cart";
import { useState } from "react";
import { AnimatedButton } from "@/components/shared/animated-button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ShareDialog } from "@/components/shared/share-dialog";

import { MangoProduct } from "@/types/database.types";

interface ProductInfoProps {
  product: MangoProduct;
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
      badge: product.badge,
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
        <div className="space-y-4">
          {product.status === 'out_of_stock' && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 mb-2">
              <Info size={20} className="text-red-500 shrink-0" />
              <p className="text-sm font-medium text-red-700">
                This variety is currently out of stock. We&apos;ll be back with fresh harvests soon!
              </p>
            </div>
          )}

          {product.status === 'pre_order' && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3 mb-2">
              <Sparkles size={20} className="text-blue-500 shrink-0" />
              <p className="text-sm font-medium text-blue-700">
                Exclusive Pre-order: Secured fresh from our upcoming harvest.
              </p>
            </div>
          )}

          <div className="flex items-center gap-4">
            {/* Quantity Selector */}
            <div className={cn(
              "flex items-center h-16 px-4 rounded-xl border border-border bg-secondary/20 font-bold min-w-[140px] justify-between",
              product.status === 'out_of_stock' && "opacity-50 pointer-events-none"
            )}>
              <button
                onClick={decrement}
                disabled={product.status === 'out_of_stock'}
                className="w-8 h-8 flex items-center justify-center hover:text-primary transition-colors disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="text-lg w-8 text-center">{quantity}</span>
              <button
                onClick={increment}
                disabled={product.status === 'out_of_stock'}
                className="w-8 h-8 flex items-center justify-center hover:text-primary transition-colors disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>

            {/* Add to Cart */}
            <AnimatedButton
              label={
                product.status === 'out_of_stock'
                  ? "Out of Stock"
                  : isAdding
                    ? "Adding..."
                    : product.status === 'pre_order'
                      ? "Pre-order Item"
                      : "Add to Cart"
              }
              onClick={handleAddToCart}
              disabled={isAdding || product.status === 'out_of_stock'}
              className={cn(
                "flex-1 h-16 text-lg font-bold shadow-lg transition-all border-transparent tracking-normal uppercase",
                product.status === 'out_of_stock'
                  ? "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                  : "bg-primary text-white shadow-primary/20 hover:shadow-primary/40"
              )}
              fillClassName="bg-white"
              hoverTextClassName="hover:text-primary"
            />
          </div>

          {/* Buy It Now */}
          <AnimatedButton
            label={product.status === 'pre_order' ? "Pre-order Now" : "Buy It Now"}
            fillClassName="bg-primary"
            hoverTextClassName="hover:text-primary-foreground"
            onClick={handleBuyNow}
            disabled={product.status === 'out_of_stock'}
            className={cn(
              "w-full h-16 text-lg font-bold transition-all uppercase tracking-wider shadow-sm",
              product.status === 'out_of_stock'
                ? "bg-muted text-muted-foreground cursor-not-allowed border-transparent"
                : "bg-white text-black border-2 border-black hover:bg-gray-50"
            )}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
