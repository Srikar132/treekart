"use client";

import Image from "next/image";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  ShoppingBag,
  ExternalLink,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRazorpay } from "@/hooks/use-razorpay";
import { verifyAndFulfilOrder, refreshRazorpayOrder } from "@/actions/order.actions";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AnimatedButton } from "@/components/shared/animated-button";
import { Loader2, ArrowRight /*, RefreshCcw */ } from "lucide-react";
// import { useMangoCart } from "@/store/use-mango-cart";

import { Order } from "@/types/database.types";

interface OrderItem {
  id: string;
  name: string;
  variety: string;
  qty: number;
  weightKg: number;
  pricePerKg: number;
  lineTotal: number;
  imageUrl?: string;
}

interface OrderDetailsProps {
  order: Order;
  rzpKey?: string;
}

export function OrderDetails({ order: initialOrder, rzpKey }: OrderDetailsProps) {
  const router = useRouter();
  const { openRazorpay, loaded: razorpayLoaded } = useRazorpay();
  // const { add, openCart } = useMangoCart();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(initialOrder);

  // FIX: Only use stable scalar fields as deps — using the full initialOrder
  // object caused an infinite loop because router.refresh() creates a new
  // object reference on every revalidation even when data is identical.
  useEffect(() => {
    const statusPriority: Record<string, number> = {
      pending: 0,
      confirmed: 1,
      shipped: 2,
      delivered: 3,
    };

    const incomingPriority =
      statusPriority[initialOrder.status?.toLowerCase() ?? "pending"] ?? 0;
    const currentPriority =
      statusPriority[order.status?.toLowerCase() ?? "pending"] ?? 0;

    // Only accept a server update if it moves the status forward.
    // This prevents a stale revalidation from reverting a locally-confirmed order
    // back to "pending" while the server catches up.
    if (incomingPriority > currentPriority) {
      setOrder(initialOrder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrder.id, initialOrder.status]); // ← scalar deps only, no object ref

  const isPending = order.status === "pending";
  const isConfirmed = ["confirmed", "shipped", "delivered"].includes(
    order.status?.toLowerCase() ?? ""
  );

  /*
  const handleReorder = () => {
    const items = order.items as unknown as OrderItem[];
    items.forEach((item) => {
      add({
        id: item.id,
        name: item.name,
        variety: item.variety,
        pricePerKg: item.pricePerKg,
        price: item.pricePerKg * (item.weightKg || 1),
        imageUrl: item.imageUrl || "",
        weightKg: item.weightKg,
        qty: item.qty,
      });
    });
    toast.success("Items added to cart");
    openCart();
  };
  */

  const handleRetryPayment = async () => {
    if (!razorpayLoaded) {
      toast.error("Payment gateway is still loading. Please try again in a moment.");
      return;
    }

    setLoading(true);

    try {
      // Get a fresh Razorpay order ID — old ones can expire or error.
      // This also writes the new rzpOrderId into orders.payment_id so
      // verifyAndFulfilOrder can find the record after payment succeeds.
      const retryData = await refreshRazorpayOrder(order.id);

      openRazorpay({
        key: rzpKey || retryData.keyId,
        amount: Number(retryData.amount),
        currency: retryData.currency,
        name: "TreeKart",
        description: `Complete payment for Order #${order.id.slice(0, 8).toUpperCase()}`,
        order_id: retryData.rzpOrderId,

        onDismiss: () => {
          setLoading(false);
          toast.info("Payment window closed. Your order is still saved.");
        },

        onSuccess: async (response) => {
          // Show a loading toast while we verify on the server
          const toastId = toast.loading("Verifying transaction...");
          try {
            const result = await verifyAndFulfilOrder({
              orderId: order.id,
              rzpOrderId: response.razorpay_order_id,
              rzpPaymentId: response.razorpay_payment_id,
              rzpSignature: response.razorpay_signature,
            });

            if (result.success) {
              toast.dismiss(toastId);
              toast.success("Payment successful! Your order is confirmed.");
              // Update local state immediately so UI reflects the new status
              // without waiting for router.refresh() to complete.
              setOrder((prev) => ({
                ...prev,
                status: "confirmed",
                payment_id: response.razorpay_payment_id,
              }));
              router.refresh();
            }
          } catch (err: any) {
            toast.dismiss(toastId);
            toast.error(
              err.message ||
              "Verification failed. If money was deducted, please contact support."
            );
          } finally {
            // FIX: Always reset loading state, whether verify succeeded or failed
            setLoading(false);
          }
        },
      });
    } catch (err: any) {
      console.error("[handleRetryPayment]", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to initialize payment. Please try again."
      );
      // FIX: Reset loading here — openRazorpay never fired so onDismiss won't run
      setLoading(false);
    }
    // NOTE: Do NOT put setLoading(false) in a finally here.
    // openRazorpay is async and the modal stays open — loading state must
    // stay true until onSuccess or onDismiss fires.
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return <CheckCircle2 className="size-4" />;
      case "shipped": return <Truck className="size-4" />;
      case "confirmed": return <ShoppingBag className="size-4" />;
      case "pending": return <Clock className="size-4" />;
      default: return <Package className="size-4" />;
    }
  };

  const steps = [
    { id: "pending", label: "Ordered", description: "Harvest booked" },
    { id: "confirmed", label: "Confirmed", description: "Quality checked" },
    { id: "shipped", label: "Shipped", description: "In transit" },
    { id: "delivered", label: "Delivered", description: "At your door" },
  ];

  const currentStatusIndex = steps.findIndex(
    (s) => s.id === (order.status?.toLowerCase() ?? "pending")
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      <div className="lg:col-span-8 space-y-10">

        {/* Order Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          <div>
            <h2 className="text-2xl font-mono font-bold tracking-tight text-foreground uppercase">
              Order Details
            </h2>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              Ref: #{order.id?.slice(0, 8).toUpperCase()} •{" "}
              {order.created_at
                ? new Date(order.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
                : "Date TBD"}
            </p>
          </div>
          <Badge
            variant={order.status === "delivered" ? "default" : "secondary"}
            className={cn(
              "w-fit font-mono text-[10px] uppercase tracking-widest px-4 py-1",
              isPending && "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200"
            )}
          >
            {order.status}
          </Badge>

          {/* 
          {isConfirmed && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReorder}
              className="font-mono text-[10px] uppercase tracking-widest gap-2 h-8 rounded-full border-primary/20 text-primary hover:bg-primary/5"
            >
              <RefreshCcw size={12} />
              Reorder
            </Button>
          )}
          */}
        </div>

        {/* Action Needed — Pending Orders */}
        {isPending && (
          <div className="p-8 rounded-[2rem] bg-amber-50 border border-amber-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Clock className="size-5 text-amber-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-amber-900 uppercase tracking-tight">
                  Payment Pending
                </p>
                <p className="text-[10px] font-bold text-amber-600/80 uppercase tracking-widest leading-relaxed">
                  Your harvest slot is reserved but payment was not completed.
                </p>
              </div>
            </div>
            <AnimatedButton
              onClick={handleRetryPayment}
              disabled={loading}
              label={loading ? "Initializing..." : "Complete Payment"}
              icon={
                loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ArrowRight size={14} />
                )
              }
              className="w-full md:w-auto h-12 bg-amber-600 text-white border-transparent shadow-lg shadow-amber-200"
              fillClassName="bg-white"
              hoverTextClassName="hover:text-amber-600"
            />
          </div>
        )}

        {/* Tracking Timeline */}
        <Card className="border-none bg-muted/20 shadow-none">
          <CardContent className="py-10">
            <div className="relative flex flex-col md:flex-row justify-between gap-8 md:gap-0">
              <div className="absolute top-[18px] left-5 md:left-0 md:w-full h-0.5 bg-border hidden md:block" />
              <div
                className="absolute top-[18px] left-0 h-0.5 bg-primary transition-all duration-1000 hidden md:block"
                style={{
                  width: `${(currentStatusIndex / (steps.length - 1)) * 100}%`,
                }}
              />

              {steps.map((step, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;

                return (
                  <div
                    key={step.id}
                    className="relative flex md:flex-col items-center md:items-center gap-4 md:text-center flex-1 z-10"
                  >
                    <div
                      className={cn(
                        "size-9 rounded-full flex items-center justify-center transition-all duration-500 ring-4 ring-background",
                        isCompleted
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCurrent ? (
                        getStatusIcon(step.id)
                      ) : isCompleted ? (
                        <CheckCircle2 className="size-4" />
                      ) : (
                        <div className="size-1.5 rounded-full bg-foreground/20" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p
                        className={cn(
                          "text-[10px] font-mono font-bold uppercase tracking-widest",
                          isCompleted ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-none">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Product Items */}
        <Card className="border-none shadow-none overflow-hidden ring-1 ring-border/50">
          <CardHeader className="bg-muted/30 border-b py-5 px-6">
            <CardTitle className="text-xs font-mono font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <ShoppingBag className="size-3.5 text-primary" />
              Harvest Summary
            </CardTitle>
          </CardHeader>
          <div className="divide-y divide-border/40">
            {(order.items as unknown as OrderItem[]).map((item, idx: number) => (
              <div key={idx} className="p-6 md:p-8 flex items-center gap-6 group">
                <div className="relative size-20 md:size-24 bg-muted/50 rounded-md overflow-hidden shrink-0 border border-border/40">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="size-8 text-muted-foreground/10" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-mono font-bold text-foreground leading-tight">
                    {item.name}
                  </h4>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.1em] mt-1.5">
                    Variety: {item.variety} • {item.qty}{" "}
                    {item.qty > 1 ? "Boxes" : "Box"} (
                    {Number(item.weightKg?.toFixed(2))}kg each)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-mono font-bold text-foreground">
                    ₹{item.lineTotal.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                    ₹{item.pricePerKg}/kg
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-muted/10 p-6 md:p-8 border-t border-border/40">
            <div className="max-w-sm ml-auto space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-mono uppercase tracking-widest text-[11px]">
                  Subtotal
                </span>
                <span className="font-mono font-bold">
                  ₹{(order.total_amount ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-mono uppercase tracking-widest text-[11px]">
                  Logistics
                </span>
                <span className="text-primary font-mono font-bold text-[11px] uppercase tracking-widest">
                  Complimentary
                </span>
              </div>
              <Separator className="my-4 bg-border/60" />
              <div className="flex justify-between items-baseline pt-2">
                <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-foreground">
                  Total Value
                </span>
                <span className="text-2xl font-mono font-bold tracking-tighter text-foreground">
                  ₹{(order.total_amount ?? 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <aside className="lg:col-span-4 space-y-8">
        {/* Destination Card */}
        <Card className="border-none shadow-none bg-muted/20 ring-1 ring-border/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <MapPin className="size-3.5 text-primary" />
              Delivery Destination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <p className="font-mono font-bold text-foreground text-sm uppercase tracking-wide">
                {(order.delivery_address as any)?.name}
              </p>
              <div className="text-sm text-muted-foreground font-mono leading-relaxed space-y-1">
                <p>{(order.delivery_address as any)?.line1}</p>
                {(order.delivery_address as any)?.locality && (
                  <p>{(order.delivery_address as any)?.locality}</p>
                )}
                <p>
                  {(order.delivery_address as any)?.city},{" "}
                  {(order.delivery_address as any)?.district &&
                    `${(order.delivery_address as any).district}, `}
                  {(order.delivery_address as any)?.state}
                </p>
                <p className="font-bold text-foreground">
                  {(order.delivery_address as any)?.pincode} •{" "}
                  {(order.delivery_address as any)?.country || "India"}
                </p>
              </div>
            </div>

            <div className="pt-5 border-t border-border/40 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
                Expected Arrival
              </span>
              <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">
                7–10 Days
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Details */}
        <Card className="border-none shadow-none bg-muted/20 ring-1 ring-border/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <CreditCard className="size-3.5 text-primary" />
              Transaction Log
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest block">
                Payment Reference
              </label>
              <div className="text-[10px] font-mono font-medium text-foreground break-all bg-background border border-border/50 p-3 rounded select-all">
                {order.payment_id}
              </div>
            </div>

            {order.tracking_id && (
              <div className="space-y-3">
                <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest block">
                  Tracking Index
                </label>
                <div className="flex items-center justify-between group cursor-pointer bg-background border border-border/50 p-3 rounded hover:border-primary transition-all">
                  <span className="text-xs font-mono font-bold text-foreground">
                    {order.tracking_id}
                  </span>
                  <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            )}

            <div className="p-4 bg-primary/5 rounded border border-primary/10 flex gap-3">
              <Info className="size-4 text-primary shrink-0 mt-0.5" />
              <p className="text-[10px] font-mono text-muted-foreground leading-normal">
                Your mangoes are freshly harvested upon order confirmation to
                ensure maximum ripeness.
              </p>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}