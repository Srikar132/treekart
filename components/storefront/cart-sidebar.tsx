"use client";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
    ShoppingCart,
    Minus,
    Plus,
    Trash2,
    MoveRight,
    Leaf,
} from "lucide-react";
import { useMangoCart } from "@/store/use-mango-cart";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function CartSidebar() {
    const {
        items,
        isOpen,
        closeCart,
        remove,
        updateQty,
        totalItems,
        totalPrice,
        _hasHydrated,
        clear,
    } = useMangoCart();

    const router = useRouter();

    const handleCheckout = () => {
        closeCart();
        router.push("/checkout/store");
    };


    if (!_hasHydrated) {
        return null;
    }

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
            <SheetContent
                side="right"
                className="lg:-mr-3"
            >
                {/* ── Header ── */}
                <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-foreground">
                            <ShoppingCart
                                size={18}
                                className="text-primary"
                                strokeWidth={2}
                            />
                            Your Cart
                            {totalItems() > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="bg-primary/10 text-primary border-0 font-mono text-xs ml-1"
                                >
                                    {totalItems()} kg
                                </Badge>
                            )}
                        </span>
                        {items.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clear}
                                className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive mr-7"
                            >
                                <Trash2 size={12} className="mr-1" />
                                Clear all
                            </Button>
                        )}
                    </SheetTitle>
                </SheetHeader>

                {/* ── Empty state ── */}
                {items.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center pb-20">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <ShoppingCart size={28} className="text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground mb-1">
                                Your cart is empty
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Add some fresh mangoes from our store
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="mt-4 border-primary/20 text-primary hover:bg-primary/10 hover:text-primary transition-colors"
                            onClick={() => {
                                closeCart();
                                router.push("/store");
                            }}
                        >
                            Browse Store
                            <MoveRight size={14} className="ml-2" />
                        </Button>
                    </div>
                )}

                {/* ── Items list ── */}
                {items.length > 0 && (
                    <ScrollArea className="flex-1 px-4">
                        <div className="flex flex-col gap-6 pb-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    {/* Image */}
                                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-secondary flex-shrink-0 border border-primary/10">
                                        {item.imageUrl ? (
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Leaf size={24} className="text-primary/40" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-semibold text-sm text-foreground leading-tight truncate">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {item.variety}
                                                </p>
                                                <p className="text-xs font-mono bg-secondary inline-block px-1.5 py-0.5 rounded mt-1.5 text-primary">
                                                    ₹{item.pricePerKg}/kg
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => remove(item.id)}
                                                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive p-1.5 rounded-md transition-colors flex-shrink-0"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>

                                        {/* Qty controls */}
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center gap-0 border border-input rounded-md overflow-hidden bg-background">
                                                <button
                                                    onClick={() =>
                                                        updateQty(item.id, item.qty - 1)
                                                    }
                                                    className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="w-8 text-center text-xs font-mono font-medium text-foreground">
                                                    {item.qty}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateQty(item.id, item.qty + 1)
                                                    }
                                                    className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                            <p className="text-sm font-semibold font-mono text-foreground">
                                                ₹{(item.pricePerKg * item.qty).toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}

                {/* ── Footer ── */}
                {items.length > 0 && (
                    <div className="mt-auto border-t border-border px-4 pt-4 pb-6 flex flex-col gap-4">
                        {/* Free delivery nudge */}
                        {totalPrice() < 999 && (
                            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
                                <Leaf size={14} className="text-primary flex-shrink-0" />
                                <p className="text-xs text-primary">
                                    Add{" "}
                                    <span className="font-semibold font-mono">
                                        ₹{(999 - totalPrice()).toLocaleString("en-IN")}
                                    </span>{" "}
                                    more for free delivery
                                </p>
                            </div>
                        )}

                        <Separator />

                        {/* Price breakdown */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Subtotal ({totalItems()} kg)</span>
                                <span className="font-mono">
                                    ₹{totalPrice().toLocaleString("en-IN")}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Delivery</span>
                                <span className="font-mono text-primary">
                                    {totalPrice() >= 999 ? "Free" : "₹99"}
                                </span>
                            </div>
                            <Separator className="my-1" />
                            <div className="flex justify-between text-base font-semibold text-foreground">
                                <span>Total</span>
                                <span className="font-mono">
                                    ₹
                                    {(
                                        totalPrice() + (totalPrice() >= 999 ? 0 : 99)
                                    ).toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>

                        <Button
                            className="w-full font-semibold h-11"
                            onClick={handleCheckout}
                        >
                            Proceed to Checkout
                            <MoveRight size={16} className="ml-2" />
                        </Button>

                        <button
                            onClick={closeCart}
                            className="text-center text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}