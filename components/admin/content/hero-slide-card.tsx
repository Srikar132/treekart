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
            <div className="flex items-center gap-3 sm:gap-6 p-2 sm:p-4">
                {/* 1. Grab Handle - Fixed Width */}
                <div 
                    {...attributes} 
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-2 text-muted-foreground/30 hover:text-primary transition-colors touch-none shrink-0"
                >
                    <GripVertical size={20} />
                </div>

                {/* 2. Media Preview - Fixed Width */}
                <div className="h-14 w-20 sm:h-20 sm:w-40 shrink-0 bg-muted rounded-xl overflow-hidden relative border border-border/50">
                    <img src={slide.image_url} alt={slide.eyebrow} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent sm:from-black/20" />
                </div>

                {/* 3. Content - Fluid */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 mb-1 sm:mb-2">
                        <span className="text-[7px] sm:text-[9px] font-black text-primary uppercase tracking-[0.2em] truncate">{slide.eyebrow}</span>
                        <div className="h-0.5 w-0.5 rounded-full bg-muted-foreground/30 shrink-0" />
                        <span className="hidden sm:inline text-[8px] font-bold text-muted-foreground uppercase truncate opacity-60">{slide.button_link}</span>
                    </div>
                    <h4 className="text-[10px] sm:text-sm font-black text-foreground uppercase tracking-tight truncate mb-0.5 sm:mb-1">
                        {slide.title}
                    </h4>
                    <p className="text-[9px] sm:text-[11px] font-medium text-muted-foreground/70 line-clamp-1">
                        {slide.sub_heading || slide.description}
                    </p>
                </div>

                {/* 4. Actions - Fixed Width */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger 
                            render={
                                <Button size="icon" variant="ghost" className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors">
                                    <Edit size={16} />
                                </Button>
                            }
                        />
                        <DialogContent className="w-full h-full sm:h-auto max-w-none sm:max-w-7xl rounded-none sm:rounded-[2.5rem] border-none sm:border border-border max-h-screen sm:max-h-[95vh] p-6 sm:p-10 overflow-y-auto">
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
                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl text-destructive/40 hover:text-destructive hover:bg-destructive/5 transition-colors"
                    >
                        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </Button>
                </div>
            </div>
        </div>
    )
}
