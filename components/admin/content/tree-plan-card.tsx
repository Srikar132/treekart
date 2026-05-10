"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Edit2, Trash2, Tag, Check, CheckCircle2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TreePlanForm } from "./tree-plan-form"
import { adminDeleteTreePlan } from "@/actions/admin.actions"
import { type TreePlan } from "@/types/database.types"
import { cn } from "@/lib/utils"

export function TreePlanCard({ plan }: { plan: TreePlan }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const features = plan.features as any[]

  const { mutate: deletePlan, isPending: isDeleting } = useMutation({
    mutationFn: () => adminDeleteTreePlan(plan.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "treePlans"] })
      toast.success("Plan deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  return (
    <div className={cn("group relative flex flex-col bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden", !plan.is_active && "opacity-60 grayscale")}>
      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger 
            render={
              <button className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Edit2 size={14} />
              </button>
            }
          />
          <DialogContent className="max-w-4xl w-[90vw] rounded-2xl border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-sm font-black uppercase tracking-tight">Edit Tree Plan</DialogTitle>
            </DialogHeader>
            <TreePlanForm initialData={plan} onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
        
        <button 
          onClick={() => {
            if(confirm("Are you sure you want to delete this plan? This may break existing trees using this plan if not handled properly.")) {
              deletePlan()
            }
          }}
          disabled={isDeleting}
          className="h-8 w-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="mb-6 pr-16">
        <h3 className="text-xl font-black text-foreground mb-2">{plan.name}</h3>
        {plan.badge_text && (
            <span className={cn("px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full text-white", plan.badge_color || "bg-primary")}>
                {plan.badge_text}
            </span>
        )}
        {!plan.is_active && (
            <span className="ml-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-muted text-muted-foreground">
                Inactive
            </span>
        )}
      </div>

      <div className="space-y-3 flex-1">
        {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-3">
                <div className={cn("h-5 w-5 rounded-full flex items-center justify-center shrink-0", feature.isHighlight ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground")}>
                    {feature.isHighlight ? <CheckCircle2 size={12} /> : <Check size={12} />}
                </div>
                <span className={cn("text-sm", feature.isHighlight ? "font-bold text-foreground" : "font-medium text-muted-foreground")}>
                    {feature.text}
                </span>
            </div>
        ))}
      </div>
    </div>
  )
}
