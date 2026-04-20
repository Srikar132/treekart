"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useRentalStore } from "@/store/use-rental-store";
import {
  reserveTree,
  createRentalOrder,
  verifyAndFulfilRental,
  releaseTreeReservation,
} from "@/actions/tree.actions";
import { AddressForm } from "@/components/checkout/address-form";
import { validateAddress } from "@/lib/checkout-validation";
import { useRazorpay } from "@/hooks/use-razorpay";
import { AnimatedButton } from "@/components/shared/animated-button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { type DeliveryAddress } from "@/types/checkout";
import {
  TreePine,
  MapPin,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ShieldCheck,
  Camera,
  CalendarDays,
  MoveRight,
  Leaf,
  Navigation,
  Lock,
  ArrowRight,
  CreditCard,
  Info,
} from "lucide-react";

import { CheckoutSuccess, CheckoutProcessing } from "@/components/checkout/shared/checkout-stages";
import { CheckoutHeader } from "@/components/checkout/shared/checkout-header";

type CheckoutStep = "details" | "processing" | "success";

const EMPTY_ADDRESS: DeliveryAddress = {
  name: "", phone: "", line1: "", city: "", state: "", pincode: "",
};

const PLAN_LABELS: Record<string, string> = {
  basic: "Basic Heritage",
  standard: "Standard Orchard",
  max: "Premium Max",
};

interface RentalCheckoutClientProps {
  tree: {
    id: string;
    variety: string;
    price: number;
    plan_type: string;
    yield_min_kg: number;
    yield_max_kg: number;
    photos: string[];
    gps_lat: number;
    gps_lng: number;
  };
  user: {
    full_name: string;
    phone: string;
    email: string;
  };
}

export default function RentalCheckoutClient({ tree, user }: RentalCheckoutClientProps) {
  const router = useRouter();
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
  const [visitRequested, setVisitRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successRentalId, setSuccessRentalId] = useState<string | null>(null);

  async function handleRentNow() {
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
      await reserveTree(tree.id);
      const orderData = await createRentalOrder({
        treeId: tree.id,
        deliveryAddress: address,
        visitRequested,
      });

      openRazorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "TreeKart",
        description: `${PLAN_LABELS[tree.plan_type] || tree.plan_type} — ${tree.variety}`,
        order_id: orderData.rzpOrderId,
        onDismiss: async () => {
          await releaseTreeReservation(tree.id);
          setLoading(false);
          setError("Payment cancelled. You can try again whenever you're ready.");
        },
        onSuccess: async (response) => {
          setStep("processing");
          try {
            const result = await verifyAndFulfilRental({
              treeId: tree.id,
              rzpOrderId: response.razorpay_order_id,
              rzpPaymentId: response.razorpay_payment_id,
              rzpSignature: response.razorpay_signature,
              deliveryAddress: address,
              visitRequested,
            });
            setSuccessRentalId(result.rentalId);
            setStep("success");
          } catch (err: any) {
            setStep("details");
            setError(err.message ?? "Verification failed. Please contact our support team.");
          }
        },
      });
    } catch (err: any) {
      setError(err.message ?? "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Success Screen ──────────────────────────────────────────────
  if (step === "success") {
    return (
      <CheckoutSuccess
        title="Rooted in Trust"
        subtitle="Transaction Successful • Tree Secured"
        description="Your mango tree is now locked in for the upcoming season. You'll receive expert-curated updates every 10 days as your tree progresses."
        primaryActionLabel="Go to My Dashboard"
        onPrimaryAction={() => router.push("/account")}
        secondaryActionLabel="Explore More Trees"
        onSecondaryAction={() => router.push("/rent")}
        items={[
          { icon: Navigation, title: "Live GPS Data", text: "Coordinates are now active in your dashboard" },
          { icon: Camera, title: "Visual Updates", text: "First drone update arrives within 10 days" },
          { icon: CalendarDays, title: "Harvest Timeline", text: "Season delivery scheduled automatically" },
          { icon: ShieldCheck, title: "Yield Guaranteed", text: "Difference covered from reserve stock" },
        ]}
      />
    );
  }

  // ── Processing Screen ───────────────────────────────────────────
  if (step === "processing") {
    return <CheckoutProcessing title="Securing Assets" message="Verifying payment and finalizing your rental agreement..." />;
  }

  // ── Main Checkout ───────────────────────────────────────────────
  return (
    <div className="py-12 lg:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

        {/* LEFT — Details Form */}
        <div className="lg:col-span-7 space-y-10">
          <CheckoutHeader title="Checkout" backLabel="Back to Details" />

          <div className="space-y-10">
            <AddressForm
              value={address}
              onChange={setAddress}
              errors={addressErrors}
            />

            <Separator className="bg-border/40" />

            {/* Farm Visit Toggle */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-primary" />
                <span className="text-sm font-bold uppercase tracking-widest text-foreground">
                  Farm Experience
                </span>
              </div>
              <div className="flex items-start gap-6 p-6 bg-secondary/20 border border-border/40">
                <div className="flex-1 space-y-2">
                  <Label
                    htmlFor="visit"
                    className="text-xs font-bold uppercase tracking-widest text-foreground cursor-pointer flex items-center gap-2"
                  >
                    Request an Orchard Visit
                    <Badge className="bg-primary/10 text-primary border-0 rounded-none text-[8px] font-bold uppercase tracking-widest h-5 px-2">Free</Badge>
                  </Label>
                  <p className="text-[11px] text-muted-foreground leading-relaxed uppercase tracking-wider">
                    Experience the orchard firsthand. Visit your tree during peak harvest season.
                    Our concierge team will contact you to coordinate a date.
                  </p>
                </div>
                <Switch
                  id="visit"
                  checked={visitRequested}
                  onCheckedChange={setVisitRequested}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
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
              onClick={handleRentNow}
              disabled={loading || !razorpayLoaded}
              label={loading ? "Processing..." : `Complete Rental • ₹${tree.price.toLocaleString("en-IN")}`}
              icon={loading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
              className="w-full h-16 bg-primary text-primary-foreground border-transparent text-lg shadow-xl shadow-primary/10"
              fillClassName="bg-white"
              hoverTextClassName="hover:text-primary"
            />
            <div className="flex items-center justify-center gap-2 py-2 border border-border/40 bg-secondary/10">
              <ShieldCheck size={12} className="text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                UPI • Cards • NetBanking • Wallets accepted via Razorpay
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT — Summary Sticky */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="bg-white border border-border shadow-lg overflow-hidden">
              <div className="relative h-64 w-full bg-secondary overflow-hidden group">
                {tree.photos?.[0] ? (
                  <Image
                    src={tree.photos[0]}
                    alt={tree.variety}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TreePine size={48} className="text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div className="space-y-1">
                    <Badge className="bg-primary text-white border-0 rounded-none text-[8px] font-bold uppercase tracking-[0.2em] mb-2">
                      {tree.plan_type} PLAN
                    </Badge>
                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight">
                      {tree.variety} Heritage
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Est. Yield</p>
                    <p className="text-lg font-bold text-white">{tree.yield_min_kg}–{tree.yield_max_kg} KG</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  {[
                    { label: "Seasonality", value: "Current Season" },
                    { label: "Updates", value: "Every 10 Days" },
                    { label: "GPS Tracking", value: "Enabled" },
                    { label: "Visit", value: visitRequested ? "Requested" : "Optional" },
                  ].map(({ label, value }) => (
                    <div key={label} className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                      <p className="text-xs font-bold text-foreground uppercase">{value}</p>
                    </div>
                  ))}
                </div>

                <Separator className="bg-border/50" />

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Rental Fee</span>
                    <span className="text-foreground">₹{tree.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Harvest Shipping</span>
                    <span className="text-primary uppercase tracking-widest text-[10px] font-bold">Inclusive</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-border/50">
                    <span className="text-foreground font-bold uppercase tracking-widest text-xs">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">₹{tree.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="px-8 py-5 bg-secondary/30 flex items-center gap-3">
                <Lock size={14} className="text-muted-foreground" />
                <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
                  Payment secured by industry standard SSL encryption
                </p>
              </div>
            </div>

            {/* Yield Guarantee Card */}
            <div className="p-6 bg-primary/5 border border-primary/20 space-y-3">
              <div className="flex items-center gap-2">
                <Leaf size={16} className="text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">The Yield Promise</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed uppercase tracking-wider">
                Nature can be unpredictable. If your tree produces less than <span className="text-foreground font-bold">{tree.yield_min_kg}kg</span>,
                TreeKart guarantees to fulfill your harvest from our partner reserve stock.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}