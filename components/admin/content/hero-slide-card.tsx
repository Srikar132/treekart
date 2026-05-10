import { useState, useTransition } from "react"
import { Edit, Trash2, GripVertical, ExternalLink, Loader2 } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HeroSlideForm } from "./hero-slide-form"
import { adminDeleteHeroSlide } from "@/actions/admin.actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface HeroSlideCardProps {
    slide: any
    isSortable?: boolean
}

export function HeroSlideCard({ slide, isSortable }: HeroSlideCardProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: slide.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

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
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group bg-card border border-border rounded-2xl overflow-hidden transition-all",
                isDragging ? "opacity-50 scale-[1.02] shadow-2xl z-50 ring-2 ring-primary/20" : "hover:shadow-md hover:border-primary/20"
            )}
        >
            <div className="flex items-center gap-6 p-3">
                {/* Drag Handle */}
                <div 
                    {...attributes} 
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-2 text-muted-foreground/30 hover:text-primary transition-colors"
                >
                    <GripVertical size={20} />
                </div>

                {/* Slim Media Preview */}
                <div className="h-16 w-32 md:w-48 shrink-0 bg-muted rounded-xl overflow-hidden relative border border-border/50">
                    <img src={slide.image_url} alt={slide.eyebrow} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                </div>

                {/* Content Strip */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">{slide.eyebrow}</span>
                        <div className="h-1 w-1 rounded-full bg-muted-foreground/20" />
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">{slide.button_link}</span>
                    </div>
                    <h4 className="text-xs font-black text-foreground uppercase tracking-tight truncate max-w-md">
                        {slide.title}
                    </h4>
                    <p className="text-[10px] font-medium text-muted-foreground line-clamp-1 opacity-70">
                        {slide.sub_heading || slide.description}
                    </p>
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-2 px-2">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger 
                            render={
                                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors">
                                    <Edit size={16} />
                                </Button>
                            }
                        />
                        <DialogContent className="w-full h-full sm:h-auto max-w-none sm:max-w-7xl rounded-none sm:rounded-[2.5rem] border-none sm:border border-border max-h-none sm:max-h-[95vh] p-6 sm:p-10">
                            <DialogHeader className="mb-8">
                                <DialogTitle className="text-xl font-black uppercase tracking-tight">Refine Hero Story</DialogTitle>
                            </DialogHeader>
                            <HeroSlideForm initialData={slide} onSuccess={() => setOpen(false)} />
                        </DialogContent>
                    </Dialog>

                    <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={handleDelete}
                        disabled={isPending}
                        className="h-9 w-9 rounded-xl text-destructive/40 hover:text-destructive hover:bg-destructive/5 transition-colors"
                    >
                        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </Button>
                </div>
            </div>
        </div>
    )
}
