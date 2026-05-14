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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    ShoppingCart,
    Minus,
    Plus,
    Trash2,
    MoveRight,
    Leaf,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { useMangoCart } from "@/store/use-mango-cart";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useLoginPrompt } from "@/store/use-login-prompt";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

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
        updateStatuses,
    } = useMangoCart();

    const { openLoginPrompt } = useLoginPrompt();
    const router = useRouter();
    const [isValidating, setIsValidating] = useState(false);

    // ── Validation Logic ──
    useEffect(() => {
        if (isOpen && items.length > 0) {
            validateStock();
        }
    }, [isOpen]);

    const validateStock = async () => {
        setIsValidating(true);
        try {
            const supabase = createClient();
            const productIds = Array.from(new Set(items.map((i) => i.id)));

            const { data, error } = await supabase
                .from("mango_products")
                .select("id, status")
                .in("id", productIds);

            if (error) throw error;

            if (data) {
                const statusMap: Record<string, any> = {};
                data.forEach((p) => {
                    statusMap[p.id] = p.status;
                });
                updateStatuses(statusMap);
            }
        } catch (err) {
            console.error("Cart validation failed:", err);
        } finally {
            setIsValidating(false);
        }
    };

    const hasOutOfStockItems = items.some((i) => i.status === "out_of_stock");

    const handleCheckout = async () => {
        if (hasOutOfStockItems) return;

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            closeCart();
            openLoginPrompt("/checkout/store");
            return;
        }

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
                                    {Number(totalItems().toFixed(2))} kg
                                </Badge>
                            )}
                            {isValidating && <Loader2 size={12} className="animate-spin text-muted-foreground ml-2" />}
                        </span>
                        {items.length > 0 && (
                            <AlertDialog>
                                <AlertDialogTrigger
                                    render={
                                        <button
                                            className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors mr-7"
                                        >
                                            <Trash2 size={12} />
                                            Clear all
                                        </button>
                                    }
                                />
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will remove all items from your cart. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                            onClick={clear}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            Clear Cart
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
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
                            {items.map((item) => {
                                const isOutOfStock = item.status === "out_of_stock";
                                return (
                                    <div
                                        key={`${item.id}-${item.weightKg}`}
                                        className={cn(
                                            "flex gap-4 transition-opacity",
                                            isOutOfStock && "opacity-60"
                                        )}
                                    >
                                        {/* Image */}
                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-secondary flex-shrink-0 border border-primary/10">
                                            {item.imageUrl ? (
                                                <Image
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    fill
                                                    sizes="80px"
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Leaf size={24} className="text-primary/40" />
                                                </div>
                                            )}
                                            {isOutOfStock && (
                                                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                                    <span className="text-[10px] font-black uppercase text-destructive tracking-tighter -rotate-12 border-2 border-destructive px-1">Sold Out</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className={cn(
                                                        "font-semibold text-sm leading-tight truncate",
                                                        isOutOfStock ? "text-muted-foreground line-through" : "text-foreground"
                                                    )}>
                                                        {item.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {item.variety}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <p className="text-xs font-mono bg-secondary inline-block px-1.5 py-0.5 rounded text-primary">
                                                            {Number(item.weightKg?.toFixed(2))}kg • ₹{item.pricePerKg}/kg
                                                        </p>
                                                        {isOutOfStock && (
                                                            <span className="text-[10px] font-bold text-destructive uppercase">Unavailable</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => remove(item.id, item.weightKg)}
                                                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive p-1.5 rounded-md transition-colors flex-shrink-0"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>

                                            {/* Qty controls */}
                                            {!isOutOfStock && (
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex items-center gap-0 border border-input rounded-md overflow-hidden bg-background">
                                                        <button
                                                            onClick={() =>
                                                                updateQty(item.id, item.qty - 1, item.weightKg)
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
                                                                updateQty(item.id, item.qty + 1, item.weightKg)
                                                            }
                                                            className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                                                        >
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>
                                                    <p className="text-sm font-semibold font-mono text-foreground">
                                                        ₹{(item.price * item.qty).toLocaleString("en-IN")}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                )}

                {/* ── Footer ── */}
                {items.length > 0 && (
                    <div className="mt-auto border-t border-border px-4 pt-4 pb-6 flex flex-col gap-4">
                        {/* Error state if items are out of stock */}
                        {hasOutOfStockItems && (
                            <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                                <AlertCircle size={18} className="text-destructive shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-destructive leading-none uppercase tracking-tight">Wait! Some items are sold out</p>
                                    <p className="text-xs text-destructive/80 leading-normal">
                                        Please remove unavailable items to proceed with your order.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Free delivery nudge */}
                        {!hasOutOfStockItems && totalPrice() < 999 && (
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
                                <span>Subtotal ({Number(totalItems().toFixed(2))} kg)</span>
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
                            className={cn(
                                "w-full font-bold h-12 uppercase tracking-widest text-[11px]",
                                hasOutOfStockItems && "bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted"
                            )}
                            onClick={handleCheckout}
                            disabled={hasOutOfStockItems || isValidating}
                        >
                            {isValidating ? (
                                <>
                                    <Loader2 size={16} className="mr-2 animate-spin" />
                                    Verifying Stock...
                                </>
                            ) : (
                                <>
                                    Proceed to Checkout
                                    <MoveRight size={16} className="ml-2" />
                                </>
                            )}
                        </Button>

                        <button
                            onClick={closeCart}
                            className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}