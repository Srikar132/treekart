// app/admin/orders/[id]/page.tsx
import { notFound } from "next/navigation";
import { adminGetOrderById } from "@/actions/admin.actions";
import { ArrowLeft, ShoppingBag, MapPin, User, CreditCard, Info, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { OrderStatusUpdater } from "./order-status-updater";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailsPage({ params }: Props) {
  const { id } = await params;
  const order = await adminGetOrderById(id);

  if (!order) return notFound();

  const delivery = order.delivery_address as any;
  const items = order.items as any[] ?? [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/orders"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group w-fit"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          Back to Fulfillment
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Order Manifest</h1>
            <p className="text-xs font-bold text-muted-foreground uppercase">
              Ref: #{order.id.slice(0, 8).toUpperCase()} • Placed {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "Date TBD"}
            </p>
          </div>
          <Badge className={cn(
            "h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest border-0",
            order.status === "confirmed" ? "bg-blue-100 text-blue-600" :
              order.status === "shipped" ? "bg-orange-100 text-orange-600" :
                "bg-green-100 text-green-600"
          )}>
            {order.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">

          {/* Status Pipeline — Client Component */}
          <div className="data-card">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-8 bg-primary/10 flex items-center justify-center rounded-lg text-primary">
                <TruckIcon size={18} />
              </div>
              <h3 className="text-sm font-black text-foreground uppercase">Fulfillment Pipeline</h3>
            </div>
            <OrderStatusUpdater orderId={order.id} currentStatus={order.status} trackingId={order.tracking_id || ""} />
          </div>

          {/* Harvest Summary */}
          <div className="data-card overflow-hidden !p-0">
            <div className="p-6 border-b border-border bg-muted/30">
              <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <ShoppingBag size={14} className="text-primary" />
                Harvest Summary
              </h3>
            </div>
            <div className="divide-y divide-border/50">
              {items.map((item, idx) => (
                <div key={idx} className="p-6 flex items-center gap-6">
                  <div className="h-16 w-16 bg-muted rounded-xl overflow-hidden border border-border shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                        <ShoppingBag size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground leading-none">{item.name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
                      Variety: {item.variety} • {item.qty} KG
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-foreground">₹{item.lineTotal.toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">₹{item.pricePerKg}/kg</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 bg-muted/30 border-t border-border">
              <div className="max-w-[240px] ml-auto space-y-3">
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-foreground font-black">₹{order.total_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <span>Logistics</span>
                  <span className="text-green-600 font-black">Free</span>
                </div>
                <Separator className="bg-border" />
                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-xs font-black text-foreground uppercase">Total</span>
                  <span className="text-2xl font-black text-foreground tracking-tighter">₹{order.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-8">
          {/* Customer Profile */}
          <div className="data-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 bg-blue-100 flex items-center justify-center rounded-lg text-blue-600">
                <User size={18} />
              </div>
              <h3 className="text-sm font-black text-foreground uppercase">Customer Profile</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Full Name</p>
                <p className="text-xs font-bold text-foreground uppercase">{order.profiles?.full_name}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Phone Number</p>
                <p className="text-xs font-bold text-foreground uppercase">{order.profiles?.phone || 'No Phone'}</p>
              </div>
            </div>
          </div>

          {/* Delivery Logistics */}
          <div className="data-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 bg-orange-100 flex items-center justify-center rounded-lg text-orange-600">
                <MapPin size={18} />
              </div>
              <h3 className="text-sm font-black text-foreground uppercase">Delivery Logistics</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Recipient Name</p>
                <p className="text-xs font-bold text-foreground uppercase">{delivery?.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Shipping Address</p>
                <p className="text-xs font-medium text-muted-foreground leading-relaxed uppercase tracking-tight">
                  {delivery?.line1},<br />
                  {delivery?.city}
                </p>
              </div>
            </div>
          </div>

          {/* Payment & Tracking */}
          <div className="data-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 bg-green-100 flex items-center justify-center rounded-lg text-green-600">
                <CreditCard size={18} />
              </div>
              <h3 className="text-sm font-black text-foreground uppercase">Transaction Data</h3>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Payment ID</p>
                <div className="bg-muted/50 p-3 rounded-xl border border-border font-mono text-[10px] text-muted-foreground break-all">
                  {order.payment_id}
                </div>
              </div>
              {order.tracking_id && (
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Tracking Index</p>
                  <div className="flex items-center justify-between bg-card p-3 rounded-xl border border-primary/20 shadow-sm shadow-primary/5">
                    <span className="text-xs font-black text-primary uppercase">{order.tracking_id}</span>
                    <ExternalLink size={12} className="text-primary" />
                  </div>
                </div>
              )}
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex gap-3">
                <Info size={16} className="text-primary shrink-0" />
                <p className="text-[9px] font-bold text-muted-foreground leading-normal uppercase">
                  Confirming an order triggers the quality check protocol and prepares the harvest for shipping.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function TruckIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-5h-7v7h2" />
      <path d="M13 9h4" />
      <path d="m21 12-2.25-3H17" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  )
}
