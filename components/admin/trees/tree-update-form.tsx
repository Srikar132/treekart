// components/admin/trees/tree-update-form.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { 
    Save, Loader2, Info, Video, Type, AlignLeft
} from "lucide-react"

import { treeUpdateSchema, type TreeUpdateFormValues } from "@/lib/validations"
import { adminCreateTreeUpdate } from "@/actions/admin.actions"

import {
    Form, FormControl, FormField, FormItem,
    FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface TreeUpdateFormProps {
    treeId: string;
    rentalId: string;
}

export function TreeUpdateForm({ treeId, rentalId }: TreeUpdateFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const form = useForm<TreeUpdateFormValues>({
        resolver: zodResolver(treeUpdateSchema),
        defaultValues: {
            title: "",
            description: "",
            video_url: "",
        },
    })

    function onSubmit(values: TreeUpdateFormValues) {
        startTransition(async () => {
            const toastId = toast.loading("Posting growth update...")

            try {
                await adminCreateTreeUpdate({
                    tree_id: treeId,
                    rental_id: rentalId,
                    title: values.title,
                    description: values.description,
                    video_url: values.video_url || null,
                    photos: [],
                } as any);

                toast.success("Growth update published", { id: toastId })
                form.reset()
                router.refresh()
            } catch (err: any) {
                toast.error(err?.message || "Failed to post update", { id: toastId })
            }
        })
    }

    return (
        <div className="data-card border-primary/10 shadow-sm overflow-hidden p-0">
            {/* Form Header */}
            <div className="bg-slate-50/80 px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                <div className="h-8 w-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-primary shadow-sm">
                    <Info size={18} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">New Progress Log</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Post a growth update for this lease</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Title */}
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Update Heading
                            </FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Type size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <Input
                                        {...field}
                                        placeholder="e.g. Seasonal Bloom Observed"
                                        className="h-12 pl-10 bg-slate-50/50 border-slate-100 rounded-xl focus-visible:bg-white focus-visible:ring-primary/10 text-xs font-bold"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage className="text-[10px] font-bold" />
                        </FormItem>
                    )} />

                    {/* Description */}
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Narrative Details
                            </FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <AlignLeft size={16} className="absolute left-3 top-4 text-slate-300" />
                                    <Textarea
                                        {...field}
                                        placeholder="Describe the current state of the heritage tree..."
                                        className="min-h-[140px] pl-10 pt-3.5 bg-slate-50/50 border-slate-100 rounded-xl focus-visible:bg-white focus-visible:ring-primary/10 text-xs font-medium leading-relaxed"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage className="text-[10px] font-bold" />
                        </FormItem>
                    )} />

                    {/* Video URL */}
                    <FormField control={form.control} name="video_url" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Video Log (Optional)
                            </FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Video size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <Input
                                        {...field}
                                        placeholder="Cloudinary/YouTube URL"
                                        className="h-12 pl-10 bg-slate-50/50 border-slate-100 rounded-xl focus-visible:bg-white focus-visible:ring-primary/10 text-xs font-bold"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage className="text-[10px] font-bold" />
                        </FormItem>
                    )} />

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="admin-button-primary w-full h-14 shadow-lg shadow-primary/10 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest mt-4"
                    >
                        {isPending ? (
                            <><Loader2 className="animate-spin" size={16} /> Publishing...</>
                        ) : (
                            <><Save size={16} /> Publish Log Entry</>
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    )
}
