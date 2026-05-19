// app/admin/orders/[id]/order-status-updater.tsx
"use client"

import { useState, useTransition } from "react"
import { adminUpdateOrderStatus } from "@/actions/admin.actions"
import { toast } from "sonner"
import { CheckCircle2, Truck, Package, Clock, Loader2, Save, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface OrderStatusUpdaterProps {
  orderId: string
  currentStatus: string
  trackingId: string
}

const steps = [
  { id: "pending", label: "Ordered", icon: Clock },
  { id: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { id: "shipped", label: "Shipped", icon: Truck },
  { id: "delivered", label: "Delivered", icon: Package },
]

export function OrderStatusUpdater({ orderId, currentStatus, trackingId: initialTrackingId }: OrderStatusUpdaterProps) {
  const [isPending, startTransition] = useTransition()
  const [trackingId, setTrackingId] = useState(initialTrackingId)
  
  const isCancelled = currentStatus === "cancelled"
  const isDelivered = currentStatus === "delivered"
  const currentStepIndex = steps.findIndex(s => s.id === (currentStatus || "pending"))

  const handleUpdate = (status: string) => {
    startTransition(async () => {
      try {
        await adminUpdateOrderStatus(orderId, status as any, trackingId)
        toast.success(`Order status updated to ${status}`)
      } catch (err: any) {
        toast.error(err.message)
      }
    })
  }

  const handleCancel = () => {
    if (!confirm("Cancel this order? A refund will be initiated if the order was paid.")) return
    startTransition(async () => {
      try {
        await adminUpdateOrderStatus(orderId, "cancelled" as any)
        toast.success("Order cancelled. Refund initiated if applicable.")
      } catch (err: any) {
        toast.error(err.message)
      }
    })
  }

  return (
    <div className="space-y-10">
      {/* Cancelled banner */}
      {isCancelled && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
          <XCircle size={16} className="text-red-500 shrink-0" />
          <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">
            This order has been cancelled. Refund was initiated if payment was received.
          </p>
        </div>
      )}

      {/* Visual Stepper */}
      <div className={cn("relative flex justify-between", isCancelled && "opacity-40 pointer-events-none")}>
        {/* Connection Line */}
        <div className="absolute top-5 left-0 w-full h-[2px] bg-muted -z-10" />
        <div
          className="absolute top-5 left-0 h-[2px] bg-primary -z-10 transition-all duration-700"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isActive = index <= currentStepIndex
          const isCurrent = index === currentStepIndex
          const Icon = step.icon

          return (
            <button
              key={step.id}
              onClick={() => handleUpdate(step.id)}
              disabled={isPending || index === currentStepIndex || isCancelled}
              className={cn(
                "flex flex-col items-center gap-3 transition-all group relative",
                (isPending || index === currentStepIndex || isCancelled) ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:opacity-80"
              )}
            >
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center border-4 border-card shadow-sm transition-all duration-500",
                isActive ? "bg-primary text-white scale-110" : "bg-muted text-muted-foreground"
              )}>
                <Icon size={18} />
              </div>
              <div className="text-center">
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </p>
              </div>
              {isCurrent && (
                <div className="absolute -bottom-2 h-1 w-1 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>

      <Separator />

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tracking Information</label>
          <div className="relative group">
            <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" size={16} />
            <Input
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter logistics tracking ID..."
              disabled={isCancelled}
              className="h-12 pl-12 bg-muted/50 border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-bold"
            />
          </div>
        </div>

        <Button
          onClick={() => handleUpdate(currentStatus)}
          disabled={isPending || trackingId === initialTrackingId || isCancelled}
          className="admin-button-primary h-12 px-8 shadow-lg shadow-primary/10"
        >
          {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
          <span className="text-[10px] font-black uppercase tracking-widest">Update Logistics</span>
        </Button>
      </div>

      {/* Cancel Danger Zone */}
      {!isCancelled && !isDelivered && (
        <>
          <Separator />
          <div className="flex items-center justify-between p-4 rounded-xl border border-destructive/20 bg-destructive/5">
            <div>
              <p className="text-[10px] font-black text-destructive uppercase tracking-widest">Danger Zone</p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                Cancelling will initiate a refund if payment was received.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isPending}
              className="h-9 px-5 rounded-lg"
            >
              {isPending ? <Loader2 className="animate-spin mr-2" size={14} /> : <XCircle className="mr-2" size={14} />}
              <span className="text-[10px] font-black uppercase tracking-widest">Cancel Order</span>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

function Separator() {
  return <div className="h-px bg-border w-full" />
}
