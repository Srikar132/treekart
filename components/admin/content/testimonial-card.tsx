// components/admin/content/testimonial-card.tsx
"use client"

import { useState, useTransition } from "react"
import { Edit, Trash2, Star, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TestimonialForm } from "./testimonial-form"
import { adminDeleteTestimonial } from "@/actions/admin.actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface TestimonialCardProps {
    testimonial: any
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleDelete = async () => {
        if (!confirm("Remove this testimonial from the storefront?")) return
        startTransition(async () => {
            try {
                await adminDeleteTestimonial(testimonial.id)
                toast.success("Review removed")
            } catch (err: any) {
                toast.error(err.message)
            }
        })
    }

    return (
        <div className="data-card group relative flex flex-col justify-between">
            <div>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded-full shrink-0 overflow-hidden border border-border">
                            {testimonial.avatar_url ? (
                                <img src={testimonial.avatar_url} alt={testimonial.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 bg-muted/50 uppercase font-black text-[10px]">
                                    {testimonial.name.slice(0, 2)}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-xs font-black text-foreground uppercase leading-none mb-1">{testimonial.name}</p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{testimonial.role}</p>
                        </div>
                    </div>
                    <Quote size={16} className="text-muted/20 group-hover:text-primary/10 transition-colors" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed italic mb-6 line-clamp-3">"{testimonial.content}"</p>
            </div>

            <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-auto">
                <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div 
                            key={s} 
                            className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                s <= testimonial.rating ? "bg-orange-500" : "bg-muted"
                            )} 
                        />
                    ))}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger 
                            render={
                                <button className="text-muted-foreground/50 hover:text-foreground transition-colors">
                                    <Edit size={14} />
                                </button>
                            }
                        />
                        <DialogContent className="max-w-xl rounded-2xl border-border">
                            <DialogHeader>
                                <DialogTitle className="text-sm font-black uppercase tracking-tight">Synchronize Social Proof</DialogTitle>
                            </DialogHeader>
                            <TestimonialForm initialData={testimonial} onSuccess={() => setOpen(false)} />
                        </DialogContent>
                    </Dialog>
                    <button 
                        onClick={handleDelete}
                        disabled={isPending}
                        className="text-muted-foreground/50 hover:text-destructive transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    )
}
