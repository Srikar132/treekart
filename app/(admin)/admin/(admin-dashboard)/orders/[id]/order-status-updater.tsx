// app/admin/orders/[id]/order-status-updater.tsx
"use client"

import { useState, useTransition } from "react"
import { adminUpdateOrderStatus } from "@/actions/admin.actions"
import { toast } from "sonner"
import { CheckCircle2, Truck, Package, Clock, Loader2, Save } from "lucide-react"
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

  return (
    <div className="space-y-10">
      {/* Visual Stepper */}
      <div className="relative flex justify-between">
        {/* Connection Line */}
        <div className="absolute top-5 left-0 w-full h-[2px] bg-slate-100 -z-10" />
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
              disabled={isPending || index === currentStepIndex}
              className={cn(
                "flex flex-col items-center gap-3 transition-all group relative",
                (isPending || index === currentStepIndex) ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:opacity-80"
              )}
            >
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all duration-500",
                isActive ? "bg-primary text-white scale-110" : "bg-slate-100 text-slate-400"
              )}>
                <Icon size={18} />
              </div>
              <div className="text-center">
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  isActive ? "text-slate-900" : "text-slate-400"
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
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking Information</label>
          <div className="relative group">
            <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
            <Input 
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter logistics tracking ID..."
              className="h-12 pl-12 bg-slate-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 text-xs font-bold"
            />
          </div>
        </div>
        
        <Button 
          onClick={() => handleUpdate(currentStatus)}
          disabled={isPending || trackingId === initialTrackingId}
          className="admin-button-primary h-12 px-8 shadow-lg shadow-primary/10"
        >
          {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
          <span className="text-[10px] font-black uppercase tracking-widest">Update Logistics</span>
        </Button>
      </div>
    </div>
  )
}

function Separator() {
  return <div className="h-px bg-slate-100 w-full" />
}
