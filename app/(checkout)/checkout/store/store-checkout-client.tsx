"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMangoCart } from "@/store/use-mango-cart";
import {
  createMangoOrder,
  verifyAndFulfilOrder,
} from "@/actions/order.actions";
import { AddressForm } from "@/components/checkout/address-form";
import { validateAddress } from "@/lib/checkout-validation";
import { useRazorpay } from "@/hooks/use-razorpay";
import { AnimatedButton } from "@/components/shared/animated-button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { type DeliveryAddress } from "@/types/checkout";
import {
  ShoppingBag,
  Leaf,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ShieldCheck,
  Truck,
  PackageCheck,
  CreditCard,
  Info,
  Navigation,
  ArrowRight,
  MapPin,
} from "lucide-react";

import { CheckoutSuccess, CheckoutProcessing } from "@/components/checkout/shared/checkout-stages";
import { CheckoutHeader } from "@/components/checkout/shared/checkout-header";
import { cn } from "@/lib/utils";

type CheckoutStep = "details" | "processing" | "success";

interface StoreCheckoutClientProps {
  user: {
    full_name: string;
    phone: string;
    email: string;
  };
}

export default function StoreCheckoutClient({ user }: StoreCheckoutClientProps) {
  const router = useRouter();
  const { items, totalPrice, totalItems, clear, closeCart } = useMangoCart();
  const { openRazorpay, loaded: razorpayLoaded } = useRazorpay();

  const [step, setStep] = useState<CheckoutStep>("details");
  const [address, setAddress] = useState<DeliveryAddress>({
    name: user.full_name || "",
    phone: user.phone || "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [addressErrors, setAddressErrors] = useState<Partial<Record<keyof DeliveryAddress, string>>>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  const cartTotal = totalPrice();
  const deliveryFee = cartTotal >= 999 ? 0 : 99;
  const grandTotal = cartTotal + deliveryFee;

  // Redirect if cart is empty and not on success screen
  useEffect(() => {
    if (items.length === 0 && step !== "success") {
      router.replace("/store");
    }
  }, [items.length, step, router]);

  // Clear cart on success
  useEffect(() => {
    if (step === "success") {
      clear();
      closeCart();
    }
  }, [step, clear, closeCart]);

  async function handlePlaceOrder() {
    const { errors, isValid } = validateAddress(address);
    if (!isValid) {
      setAddressErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setAddressErrors(undefined);
    setError(null);
    setLoading(true);

    try {
      const orderData = await createMangoOrder(items, address);

      openRazorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "TreeKart",
        description: `Fresh Mango Order — ${totalItems()} KG`,
        order_id: orderData.rzpOrderId,
        onDismiss: () => {
          setLoading(false);
          setError("Payment cancelled. Your cart is still saved.");
        },
        onSuccess: async (response) => {
          setStep("processing");
          try {
            const result = await verifyAndFulfilOrder({
              orderId: orderData.orderId,
              rzpOrderId: response.razorpay_order_id,
              rzpPaymentId: response.razorpay_payment_id,
              rzpSignature: response.razorpay_signature,
            });
            setSuccessOrderId(result.orderId);
            setStep("success");
          } catch (err: any) {
            setStep("details");
            setError(err.message ?? "Verification failed. Contact support.");
          }
        },
      });
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Success Screen ──────────────────────────────────────────────
  if (step === "success") {
    return (
      <CheckoutSuccess
        title="Order Confirmed"
        subtitle="Transaction Successful • Harvest Dispatched"
        description="Your fresh Alphonso mangoes are being hand-picked and packed. You'll receive real-time tracking updates via WhatsApp once the box leaves the orchard."
        primaryActionLabel="Track My Order"
        onPrimaryAction={() => router.push("/account")}
        secondaryActionLabel="Return to Store"
        onSecondaryAction={() => router.push("/store")}
        items={[
          { icon: PackageCheck, title: "Order Reference", text: `#${successOrderId?.slice(0, 8).toUpperCase()}` },
          { icon: Truck, title: "Delivery Status", text: "Estimated arrival in 3–5 days" },
          { icon: ShieldCheck, title: "Payment Secured", text: "SSL Encrypted Transaction" },
          { icon: Navigation, title: "Live Tracking", text: "Link sent to your registered phone" },
        ]}
      />
    );
  }

  // ── Processing Screen ───────────────────────────────────────────
  if (step === "processing") {
    return <CheckoutProcessing title="Processing Harvest" message="Finalizing your order and securing shipping slots..." />;
  }

  // ── Main Checkout ───────────────────────────────────────────────
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

        {/* LEFT — Details Form */}
        <div className="lg:col-span-7 space-y-10">
          <CheckoutHeader title="Checkout" backLabel="Back to Store" />

          <div className="space-y-10">
            <AddressForm
              value={address}
              onChange={setAddress}
              errors={addressErrors}
            />

            <Separator className="bg-border/40" />

            {/* Delivery Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: Leaf, title: "100% Organic", desc: "Pure Carbide-free" },
                { icon: ShieldCheck, title: "Insured Pay", desc: "Razorpay Protected" },
                { icon: Truck, title: "Express Ship", desc: "Climate-Controlled" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className="text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">{title}</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-destructive/5 border border-destructive/20 p-5 flex gap-3 animate-in fade-in slide-in-from-top-2">
              <Info size={16} className="text-destructive flex-shrink-0" />
              <p className="text-xs font-bold text-destructive uppercase tracking-widest leading-relaxed">
                {error}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <AnimatedButton
              onClick={handlePlaceOrder}
              disabled={loading || !razorpayLoaded}
              label={loading ? "Processing..." : `Place Order • ₹${grandTotal.toLocaleString("en-IN")}`}
              icon={loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              className="w-full h-16 bg-primary text-primary-foreground border-transparent text-lg shadow-xl shadow-primary/10"
              fillClassName="bg-white"
              hoverTextClassName="hover:text-primary"
            />
            <div className="flex items-center justify-center gap-2 py-2 border border-border/40 bg-secondary/10">
              <ShieldCheck size={12} className="text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Payment secured by Razorpay SSL
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT — Summary Sticky */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="bg-white border border-border shadow-lg overflow-hidden">
              <div className="px-8 py-6 border-b border-border bg-secondary/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} className="text-primary" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">
                    Order Summary
                  </span>
                </div>
                <Badge variant="outline" className="rounded-none border-border bg-white text-[9px] font-bold uppercase tracking-widest">
                  {totalItems()} KG TOTAL
                </Badge>
              </div>

              {/* Items */}
              <div className="max-h-[300px] overflow-y-auto divide-y divide-border/40">
                {items.map((item) => (
                  <div key={item.id} className="p-6 flex items-center gap-4 group">
                    <div className="relative h-16 w-16 bg-secondary overflow-hidden border border-border/50 flex-shrink-0">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Leaf size={20} className="text-muted-foreground/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground truncate">
                        {item.name}
                      </p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">
                        {item.qty} KG × ₹{item.pricePerKg}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-foreground">
                        ₹{(item.pricePerKg * item.qty).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="p-8 space-y-4 bg-secondary/10 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subtotal</span>
                  <span className="text-xs font-bold text-foreground">₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Delivery</span>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    deliveryFee === 0 ? "text-primary" : "text-foreground"
                  )}>
                    {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
                  </span>
                </div>

                <Separator className="bg-border/50" />

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Total Amount</span>
                  <span className="text-2xl font-black text-primary">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Support Box */}
            <div className="p-6 bg-secondary/30 border border-border/60 flex items-center gap-4">
              <div className="bg-white p-3 border border-border/50">
                <ShieldCheck size={20} className="text-primary" />
              </div>
              <p className="text-[9px] uppercase tracking-[0.2em] leading-relaxed text-muted-foreground font-medium">
                Our <span className="text-foreground font-black">Quality Guarantee</span> ensures that every mango in your box is hand-checked for ripeness and purity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

