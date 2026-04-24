// components/admin/content/hero-slide-card.tsx
"use client"

import { useState, useTransition } from "react"
import { Edit, Trash2, MoveVertical, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HeroSlideForm } from "./hero-slide-form"
import { adminDeleteHeroSlide } from "@/actions/admin.actions"
import { toast } from "sonner"

interface HeroSlideCardProps {
    slide: any
}

export function HeroSlideCard({ slide }: HeroSlideCardProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleDelete = async () => {
        if (!confirm("Permanently remove this hero slide from the storefront?")) return
        startTransition(async () => {
            try {
                await adminDeleteHeroSlide(slide.id)
                toast.success("Slide removed")
            } catch (err: any) {
                toast.error(err.message)
            }
        })
    }

    return (
        <div className="data-card group relative">
            <div className="aspect-[21/9] bg-muted rounded-xl overflow-hidden mb-4 relative">
                <img src={slide.image_url} alt={slide.eyebrow} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger 
                            render={
                                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg shadow-lg">
                                    <Edit size={14} />
                                </Button>
                            }
                        />
                        <DialogContent className="max-w-4xl rounded-2xl border-border">
                            <DialogHeader>
                                <DialogTitle className="text-sm font-black uppercase tracking-tight">Refine Hero Story</DialogTitle>
                            </DialogHeader>
                            <HeroSlideForm initialData={slide} onSuccess={() => setOpen(false)} />
                        </DialogContent>
                    </Dialog>
                    <Button 
                        size="icon" 
                        variant="destructive" 
                        onClick={handleDelete}
                        disabled={isPending}
                        className="h-8 w-8 rounded-lg shadow-lg"
                    >
                        <Trash2 size={14} />
                    </Button>
                </div>
                <div className="absolute bottom-2 right-2">
                     <Badge className="bg-black/60 backdrop-blur-md border-0 text-[8px] font-black uppercase tracking-widest text-white">
                        Index #{slide.order_index}
                    </Badge>
                </div>
            </div>
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] leading-none mb-1">{slide.eyebrow}</p>
                    <h4 className="text-sm font-black text-foreground uppercase tracking-tight leading-tight">
                        {slide.headline?.join(' ')}
                    </h4>
                    <p className="text-[10px] font-medium text-muted-foreground line-clamp-1">{slide.sub}</p>
                    <div className="flex items-center gap-2 pt-1">
                        <ExternalLink size={10} className="text-muted-foreground/30" />
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">{slide.button_link}</span>
                    </div>
                </div>
                <div className="cursor-ns-resize text-muted-foreground/30 hover:text-foreground transition-colors pt-1">
                    <MoveVertical size={18} />
                </div>
            </div>
        </div>
    )
}
