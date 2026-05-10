"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, Trash2, Save, Loader2 } from "lucide-react"
import { type TreePlan } from "@/types/database.types"
import { adminCreateTreePlan, adminUpdateTreePlan } from "@/actions/admin.actions"
import { treePlanSchema, type TreePlanFormValues } from "@/lib/validations"

import {
  Form, FormControl, FormField, FormItem,
  FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"



interface TreePlanFormProps {
  initialData?: TreePlan
  onSuccess?: () => void
}

export function TreePlanForm({ initialData, onSuccess }: TreePlanFormProps) {
  const isEdit = !!initialData
  const queryClient = useQueryClient()

  const form = useForm<TreePlanFormValues>({
    resolver: zodResolver(treePlanSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      badge_text: initialData?.badge_text || "",
      badge_color: initialData?.badge_color || "",
      features: (initialData?.features as any[]) || [{ text: "", isHighlight: false, highlightColor: "" }],
      is_active: initialData?.is_active ?? true,
    },
  })

  const { fields, append, remove } = useFieldArray({
    name: "features",
    control: form.control,
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: TreePlanFormValues) => {
      if (isEdit) {
        await adminUpdateTreePlan(initialData!.id, values)
      } else {
        await adminCreateTreePlan(values)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "treePlans"] })
      toast.success(isEdit ? "Plan updated successfully" : "Plan created successfully")
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  function onSubmit(values: TreePlanFormValues) {
    mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="max-h-none sm:max-h-[70vh] overflow-y-auto px-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Plan Name</FormLabel>
                <FormControl>
                    <Input {...field} placeholder="e.g. Standard Tree" className="bg-muted border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-bold" />
                </FormControl>
                <FormMessage className="text-[10px] font-bold" />
            </FormItem>
            )} />

            <FormField control={form.control} name="is_active" render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-xl bg-muted/30 border border-border/50 p-4 shadow-sm">
                <div className="space-y-0.5">
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Status</FormLabel>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Is this plan visible?</p>
                </div>
                <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
            </FormItem>
            )} />

            <FormField control={form.control} name="badge_text" render={({ field }) => (
            <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Badge Text (Optional)</FormLabel>
                <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="e.g. Standard" className="bg-muted border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-bold" />
                </FormControl>
                <FormMessage className="text-[10px] font-bold" />
            </FormItem>
            )} />

            <FormField control={form.control} name="badge_color" render={({ field }) => (
            <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Badge Color (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl>
                        <SelectTrigger className="bg-muted border-transparent rounded-xl focus:ring-primary/20 text-xs font-bold h-10">
                            <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-border bg-card shadow-2xl p-1">
                        <SelectItem value="bg-primary" className="text-xs font-bold data-[highlighted]:!bg-primary data-[highlighted]:!text-white rounded-lg transition-colors py-2.5">Brand Orange</SelectItem>
                        <SelectItem value="bg-blue-600" className="text-xs font-bold data-[highlighted]:!bg-blue-600 data-[highlighted]:!text-white rounded-lg transition-colors py-2.5">Sky Blue</SelectItem>
                        <SelectItem value="bg-green-600" className="text-xs font-bold data-[highlighted]:!bg-green-600 data-[highlighted]:!text-white rounded-lg transition-colors py-2.5">Nature Green</SelectItem>
                        <SelectItem value="bg-purple-600" className="text-xs font-bold data-[highlighted]:!bg-purple-600 data-[highlighted]:!text-white rounded-lg transition-colors py-2.5">Royal Purple</SelectItem>
                        <SelectItem value="bg-amber-600" className="text-xs font-bold data-[highlighted]:!bg-amber-600 data-[highlighted]:!text-white rounded-lg transition-colors py-2.5">Sun Amber</SelectItem>
                        <SelectItem value="bg-slate-900" className="text-xs font-bold data-[highlighted]:!bg-slate-900 data-[highlighted]:!text-white rounded-lg transition-colors py-2.5">Solid Black</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage className="text-[10px] font-bold" />
            </FormItem>
            )} />
        </div>

        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Plan Features</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ text: "", isHighlight: false, highlightColor: "" })} className="rounded-xl h-8 text-[10px] font-black uppercase tracking-widest">
                    <Plus size={14} className="mr-2" /> Add Feature
                </Button>
            </div>
            
            {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start border border-border/50 p-4 rounded-2xl bg-muted/10">
                    <div className="flex-1 space-y-4">
                        <FormField control={form.control} name={`features.${index}.text`} render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input {...field} placeholder="Feature text (e.g. 15-25 dozen mangoes)" className="bg-muted/50 border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-medium" />
                                </FormControl>
                                <FormMessage className="text-[10px] font-bold" />
                            </FormItem>
                        )} />
                        
                        <div className="flex gap-4 items-center">
                            <FormField control={form.control} name={`features.${index}.isHighlight`} render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Highlight</FormLabel>
                                </FormItem>
                            )} />
                            
                            {form.watch(`features.${index}.isHighlight`) && (
                                <FormField control={form.control} name={`features.${index}.highlightColor`} render={({ field }) => (
                                    <FormItem className="flex-1 flex items-center gap-2 space-y-0">
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 whitespace-nowrap">Style</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                            <FormControl>
                                                <SelectTrigger className="h-9 bg-muted/50 border-transparent rounded-lg text-[10px] font-bold focus:ring-primary/20">
                                                    <SelectValue placeholder="Background" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-border bg-card shadow-2xl p-1">
                                                <SelectItem value="bg-primary/10" className="text-[10px] font-bold data-[highlighted]:!bg-primary data-[highlighted]:!text-white rounded-lg transition-colors py-2">Soft Orange</SelectItem>
                                                <SelectItem value="bg-blue-50" className="text-[10px] font-bold data-[highlighted]:!bg-blue-600 data-[highlighted]:!text-white rounded-lg transition-colors py-2">Soft Blue</SelectItem>
                                                <SelectItem value="bg-green-50" className="text-[10px] font-bold data-[highlighted]:!bg-green-600 data-[highlighted]:!text-white rounded-lg transition-colors py-2">Soft Green</SelectItem>
                                                <SelectItem value="bg-purple-50" className="text-[10px] font-bold data-[highlighted]:!bg-purple-600 data-[highlighted]:!text-white rounded-lg transition-colors py-2">Soft Purple</SelectItem>
                                                <SelectItem value="bg-amber-50" className="text-[10px] font-bold data-[highlighted]:!bg-amber-600 data-[highlighted]:!text-white rounded-lg transition-colors py-2">Soft Amber</SelectItem>
                                                <SelectItem value="bg-slate-100" className="text-[10px] font-bold data-[highlighted]:!bg-slate-900 data-[highlighted]:!text-white rounded-lg transition-colors py-2">Subtle Grey</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )} />
                            )}
                        </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive mt-1">
                        <Trash2 size={16} />
                    </Button>
                </div>
            ))}
        </div>
      </div>

        <div className="pt-4 border-t border-border">
          <Button type="submit" disabled={isPending} className="admin-button-primary w-full h-14 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest">
            {isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isEdit ? "Update Plan Architecture" : "Deploy New Tree Plan"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
