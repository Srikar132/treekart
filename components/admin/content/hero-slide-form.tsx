// components/admin/content/hero-slide-form.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition, useState } from "react"
import { toast } from "sonner"
import { Save, Loader2, Image as ImageIcon, Type, Plus, X, Hash } from "lucide-react"
import { heroSlideSchema, type HeroSlideFormValues } from "@/lib/validations"
import { adminCreateHeroSlide, adminUpdateHeroSlide } from "@/actions/admin.actions"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CldUploadWidget } from "next-cloudinary"
import { cn } from "@/lib/utils"

interface HeroSlideFormProps {
    initialData?: any
    onSuccess?: () => void
}

export function HeroSlideForm({ initialData, onSuccess }: HeroSlideFormProps) {
    const [isPending, startTransition] = useTransition()
    const [imageUrl, setImageUrl] = useState<string>(initialData?.image_url || "")
    const isEdit = !!initialData

    const form = useForm<HeroSlideFormValues>({
        resolver: zodResolver(heroSlideSchema) as any,
        defaultValues: {
            eyebrow: initialData?.eyebrow ?? "Premium Alphonso",
            title: initialData?.title ?? "Own a Mango Tree",
            sub_heading: initialData?.sub_heading ?? "Taste the Season",
            description: initialData?.description ?? "Rent a real Alphonso mango tree on our farm. GPS-tracked, 10-day updates, fresh mangoes delivered every season.",
            image_url: initialData?.image_url ?? "",
            button_label: initialData?.button_label ?? "Explore Now",
            button_link: initialData?.button_link ?? "/shop",
            order_index: initialData?.order_index ?? 0,
        },
    })

    function onSubmit(values: HeroSlideFormValues) {
        if (!imageUrl) return toast.error("Hero media is required")
        
        startTransition(async () => {
            try {
                const data = { ...values, image_url: imageUrl }
                if (isEdit) {
                    await adminUpdateHeroSlide(initialData.id, data)
                    toast.success("Hero slide synchronized")
                } else {
                    await adminCreateHeroSlide(data)
                    toast.success("New slide deployed to storefront")
                }
                onSuccess?.()
            } catch (err: any) {
                toast.error(err.message)
            }
        })
    }

    return (
        <Form {...form}>
            <form 
                onSubmit={form.handleSubmit(onSubmit, (errors) => {
                    console.error("Form Validation Errors:", errors)
                    toast.error("Please resolve the highlighted errors before deploying")
                })} 
                className="space-y-8"
            >
                <input type="hidden" {...form.register("image_url")} value={imageUrl} />

                <div className="max-h-[60vh] overflow-y-auto px-1 scrollbar-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Content Section */}
                        <div className="space-y-6">
                            <SectionHeader icon={<Type size={16} />} title="Hero Content" />
                            
                            <FormField control={form.control} name="eyebrow" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Eyebrow</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="e.g. Farm-to-Doorstep" className="bg-muted border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-bold" />
                                    </FormControl>
                                    <FormMessage className="text-[10px] font-bold" />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="title" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Title</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="e.g. Own a Mango Tree" className="bg-muted border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-black uppercase tracking-tight" />
                                    </FormControl>
                                    <FormMessage className="text-[10px] font-bold" />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="sub_heading" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sub-heading</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="e.g. Taste the Season" className="bg-muted border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-bold text-primary uppercase tracking-tight" />
                                    </FormControl>
                                    <FormMessage className="text-[10px] font-bold" />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Narrative description..." className="bg-muted border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-medium min-h-[100px]" />
                                    </FormControl>
                                    <FormMessage className="text-[10px] font-bold" />
                                </FormItem>
                            )} />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="button_label" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">CTA Label</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="bg-muted border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-bold" />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="button_link" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">CTA Link</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="bg-muted border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-bold" />
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )} />
                            </div>

                            <FormField control={form.control} name="order_index" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sort Priority</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={14} />
                                            <Input type="number" {...field} className="pl-9 bg-muted border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-bold" />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-[10px] font-bold" />
                                </FormItem>
                            )} />
                        </div>

                        {/* Media Section */}
                        <div className="space-y-6">
                            <SectionHeader icon={<ImageIcon size={16} />} title="Hero Media" />
                            
                            <div className="aspect-[21/9] bg-muted rounded-2xl overflow-hidden border border-border relative group">
                                {imageUrl ? (
                                    <>
                                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setImageUrl("")
                                                form.setValue("image_url", "", { shouldValidate: true })
                                            }}
                                            className="absolute top-2 right-2 h-8 w-8 bg-card/90 backdrop-blur-sm flex items-center justify-center rounded-full text-destructive shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <CldUploadWidget 
                                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                                        onSuccess={(result: any) => {
                                            const url = result.info.secure_url
                                            setImageUrl(url)
                                            form.setValue("image_url", url, { shouldValidate: true })
                                        }}
                                    >
                                        {({ open }) => (
                                            <button 
                                                type="button" 
                                                onClick={() => open()}
                                                className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 hover:text-primary transition-colors"
                                            >
                                                <Plus size={24} className="mb-2" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Upload Hero Image</span>
                                            </button>
                                        )}
                                    </CldUploadWidget>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-border">
                    <Button 
                        type="submit" 
                        disabled={isPending}
                        className="admin-button-primary w-full h-14 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest"
                    >
                        {isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {isEdit ? "Synchronize Slide" : "Deploy Slide"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-6 bg-muted flex items-center justify-center rounded-lg text-muted-foreground">
                {icon}
            </div>
            <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest">{title}</h3>
        </div>
    )
}
