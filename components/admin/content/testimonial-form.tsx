// components/admin/content/testimonial-form.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition, useState } from "react"
import { toast } from "sonner"
import { Save, Loader2, User, MessageSquare, Star, Plus, X } from "lucide-react"
import { testimonialSchema, type TestimonialFormValues } from "@/lib/validations"
import { adminCreateTestimonial, adminUpdateTestimonial } from "@/actions/admin.actions"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CldUploadWidget } from "next-cloudinary"
import { cn } from "@/lib/utils"

interface TestimonialFormProps {
    initialData?: any
    onSuccess?: () => void
}

export function TestimonialForm({ initialData, onSuccess }: TestimonialFormProps) {
    const [isPending, startTransition] = useTransition()
    const [avatarUrl, setAvatarUrl] = useState<string>(initialData?.avatar_url || "")
    const isEdit = !!initialData

    const form = useForm<TestimonialFormValues>({
        resolver: zodResolver(testimonialSchema) as any,
        defaultValues: {
            name: initialData?.name ?? "",
            role: initialData?.role ?? "Orchard Member",
            content: initialData?.content ?? "",
            rating: initialData?.rating ?? 5,
            avatar_url: initialData?.avatar_url ?? "",
        },
    })

    function onSubmit(values: TestimonialFormValues) {
        startTransition(async () => {
            try {
                const data = { ...values, avatar_url: avatarUrl }
                if (isEdit) {
                    await adminUpdateTestimonial(initialData.id, data)
                    toast.success("Review synchronized")
                } else {
                    await adminCreateTestimonial(data)
                    toast.success("New testimonial added to social proof")
                }
                onSuccess?.()
            } catch (err: any) {
                toast.error(err.message)
            }
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="max-h-[60vh] overflow-y-auto px-1 scrollbar-none space-y-6">
                    <div className="flex gap-6 items-start">
                        {/* Avatar Upload */}
                    <div className="space-y-4 shrink-0">
                         <div className="h-20 w-20 bg-slate-50 rounded-full overflow-hidden border border-slate-200 relative group">
                            {avatarUrl ? (
                                <>
                                    <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <button 
                                        type="button" 
                                        onClick={() => setAvatarUrl("")}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={20} />
                                    </button>
                                </>
                            ) : (
                                <CldUploadWidget 
                                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                                    onSuccess={(result: any) => setAvatarUrl(result.info.secure_url)}
                                >
                                    {({ open }) => (
                                        <button 
                                            type="button" 
                                            onClick={() => open()}
                                            className="w-full h-full flex flex-col items-center justify-center text-slate-300 hover:text-primary transition-colors"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    )}
                                </CldUploadWidget>
                            )}
                        </div>
                        <p className="text-[8px] font-black uppercase text-center text-slate-400">Avatar</p>
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Author Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="e.g. Rahul Sharma" className="bg-slate-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 text-xs font-bold" />
                                </FormControl>
                                <FormMessage className="text-[10px] font-bold" />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="role" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Designation / Role</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="e.g. Loyal Subscriber" className="bg-slate-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 text-xs font-medium" />
                                </FormControl>
                                <FormMessage className="text-[10px] font-bold" />
                            </FormItem>
                        )} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="rating" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Satisfaction Rating</FormLabel>
                            <FormControl>
                                <div className="flex items-center gap-2 h-12 bg-slate-50 rounded-xl px-4">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => field.onChange(s)}
                                            className={cn(
                                                "transition-colors",
                                                s <= field.value ? "text-orange-500" : "text-slate-200 hover:text-slate-300"
                                            )}
                                        >
                                            <Star size={16} fill={s <= field.value ? "currentColor" : "none"} />
                                        </button>
                                    ))}
                                </div>
                            </FormControl>
                            <FormMessage className="text-[10px] font-bold" />
                        </FormItem>
                    )} />
                </div>

                <FormField control={form.control} name="content" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Review Narrative</FormLabel>
                        <FormControl>
                            <Textarea {...field} placeholder="Share the member's experience with the orchard..." className="min-h-[100px] bg-slate-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 text-xs font-medium leading-relaxed" />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                )} />
            </div>

                <div className="pt-4 border-t border-slate-100">
                    <Button 
                        type="submit" 
                        disabled={isPending}
                        className="admin-button-primary w-full h-14 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest"
                    >
                        {isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {isEdit ? "Update Narrative" : "Add to Social Proof"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
