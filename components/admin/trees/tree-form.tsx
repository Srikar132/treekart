// components/admin/tree-form.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Save, X, Loader2, Navigation,
  BadgePercent, Calendar, Info,
} from "lucide-react"

import { treeSchema, type TreeFormValues } from "@/lib/validations"
import { createTree, updateTree } from "@/actions/tree.actions"
import { adminGetAllFarmers } from "@/actions/admin.actions"
import { type Tree } from "@/types/database.types"

import {
  Form, FormControl, FormField, FormItem,
  FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"

interface TreeFormProps {
  initialData?: Tree & { farmers?: { farm_name: string | null; location: string | null } | null }
}

export function TreeForm({ initialData }: TreeFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEdit = !!initialData

  const form = useForm<TreeFormValues>({
    resolver: zodResolver(treeSchema) as any,
    defaultValues: {
      farmer_id: initialData?.farmer_id || null,
      variety: initialData?.variety ?? "",
      description: initialData?.description ?? "",
      gps_lat: initialData?.gps_lat ?? undefined,
      gps_lng: initialData?.gps_lng ?? undefined,
      price: initialData?.price ?? undefined,
      age_years: initialData?.age_years ?? undefined,
      yield_min_kg: initialData?.yield_min_kg ?? undefined,
      yield_max_kg: initialData?.yield_max_kg ?? undefined,
      plan_type: initialData?.plan_type ?? "standard",
      source: initialData?.source ?? "own_farm",
      status: initialData?.status ?? "available",
    },
  })

  const { data: farmers = [], isLoading: loadingFarmers } = useQuery({
    queryKey: ["admin", "farmers"],
    queryFn: () => adminGetAllFarmers(),
    staleTime: 1000 * 60 * 5, // farmers list barely changes
  })

  function onSubmit(values: TreeFormValues) {
    startTransition(async () => {
      const toastId = toast.loading(isEdit ? "Saving changes..." : "Creating tree...")

      try {
        if (isEdit) {
          await updateTree(initialData!.id, { ...values, is_verified: true })
          toast.success("Tree updated", { id: toastId })
        } else {
          await createTree({ ...values, is_verified: true })
          toast.success("Tree added to inventory", { id: toastId })
        }
        router.push("/admin/trees")
      } catch (err: any) {
        toast.error(err?.message ?? "Something went wrong", { id: toastId })
      }
    })
  }

  // Field-level error helper — shows inline toast for first error on submit attempt
  function onInvalid() {
    const firstError = Object.values(form.formState.errors)[0]
    if (firstError?.message) {
      toast.error(firstError.message as string)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="space-y-12 pb-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* ── LEFT: Core Details ──────────────────────────────── */}
          <div className="lg:col-span-8 space-y-8">

            {/* Tree Information */}
            <div className="data-card">
              <SectionHeader icon={<Info size={18} />} color="bg-primary/10 text-primary" title="Tree Information" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Farmer */}
                <FormField control={form.control} name="farmer_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Farmer / Orchard Owner
                    </FormLabel>
                    <Select 
                      onValueChange={(val) => field.onChange(val === "none" ? null : val)} 
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 bg-slate-50 border-transparent rounded-xl text-xs font-bold uppercase tracking-widest">
                          <SelectValue placeholder={loadingFarmers ? "Loading..." : "Select Farmer"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-slate-200">
                        <SelectItem value="none" className="text-xs font-bold uppercase tracking-widest py-3">
                          None / TreeKart Owned
                        </SelectItem>
                        {farmers.map((f) => (
                          <SelectItem key={f.id} value={f.id} className="text-xs font-bold uppercase tracking-widest py-3">
                            {f.farm_name} ({f.location})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

                {/* Variety */}
                <FormField control={form.control} name="variety" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Tree Variety
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. Alphonso Gold"
                        className="h-12 bg-slate-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 text-xs font-bold"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

                {/* GPS Lat */}
                <FormField control={form.control} name="gps_lat" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      GPS Latitude
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="number" step="any"
                          placeholder="e.g. 17.5934"
                          className="h-12 pl-10 bg-slate-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 text-xs font-bold"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

                {/* GPS Lng */}
                <FormField control={form.control} name="gps_lng" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      GPS Longitude
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="number" step="any"
                          placeholder="e.g. 73.3421"
                          className="h-12 pl-10 bg-slate-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 text-xs font-bold"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

                {/* Description */}
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Brief Narrative
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="The story and unique characteristics of this heritage tree..."
                        className="min-h-[120px] bg-slate-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 text-xs font-medium leading-relaxed"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

              </div>
            </div>

          </div>

          {/* ── RIGHT: Pricing & Config ─────────────────────────── */}
          <div className="lg:col-span-4 space-y-8">

            {/* Economics */}
            <div className="data-card bg-primary/5 border-primary/10">
              <SectionHeader icon={<BadgePercent size={18} />} color="bg-primary/10 text-primary" title="Economics" />

              <div className="space-y-6">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Seasonal Rent (INR)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="number"
                          placeholder="9,999"
                          className="h-14 pl-10 bg-white border-transparent rounded-xl focus-visible:ring-primary/20 text-lg font-black"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="yield_min_kg" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Yield Min (kg)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="number" placeholder="25"
                          className="h-12 bg-white border-transparent rounded-xl focus-visible:ring-primary/20 text-xs font-bold text-center"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="yield_max_kg" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Yield Max (kg)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="number" placeholder="40"
                          className="h-12 bg-white border-transparent rounded-xl focus-visible:ring-primary/20 text-xs font-bold text-center"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )} />
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className="data-card">
              <SectionHeader icon={<Calendar size={18} />} color="bg-orange-100 text-orange-600" title="Configuration" />

              <div className="space-y-6">

                <FormField control={form.control} name="age_years" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Tree Age (Years)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        type="number" placeholder="15"
                        className="h-12 bg-slate-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 text-xs font-bold"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

                {/* Source */}
                <FormField control={form.control} name="source" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Tree Source
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 bg-slate-50 border-transparent rounded-xl text-xs font-bold uppercase tracking-widest">
                          <SelectValue placeholder="Select Source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-slate-200">
                        <SelectItem value="own_farm" className="text-xs font-bold uppercase tracking-widest py-3">TreeKart Owned</SelectItem>
                        <SelectItem value="partner" className="text-xs font-bold uppercase tracking-widest py-3">Partner Orchard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

                {/* Plan Type */}
                <FormField control={form.control} name="plan_type" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Rental Plan
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 bg-slate-50 border-transparent rounded-xl text-xs font-bold uppercase tracking-widest">
                          <SelectValue placeholder="Select Plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-slate-200">
                        <SelectItem value="basic" className="text-xs font-bold uppercase tracking-widest py-3">Basic Yield</SelectItem>
                        <SelectItem value="standard" className="text-xs font-bold uppercase tracking-widest py-3">Standard Heritage</SelectItem>
                        <SelectItem value="max" className="text-xs font-bold uppercase tracking-widest py-3">Maximum Premium</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

                {/* Status */}
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Market Status
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 bg-slate-50 border-transparent rounded-xl text-xs font-bold uppercase tracking-widest">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-slate-200">
                        <SelectItem value="available" className="text-xs font-bold uppercase tracking-widest py-3">Active Market</SelectItem>
                        <SelectItem value="rented" className="text-xs font-bold uppercase tracking-widest py-3">Currently Rented</SelectItem>
                        <SelectItem value="inactive" className="text-xs font-bold uppercase tracking-widest py-3">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isPending}
              className="admin-button-primary w-full h-16 shadow-xl shadow-primary/20 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest"
            >
              {isPending ? (
                <><Loader2 className="animate-spin" size={20} /> {isEdit ? "Saving..." : "Deploying..."}</>
              ) : (
                <><Save size={20} /> {isEdit ? "Synchronize Changes" : "Deploy to Market"}</>
              )}
            </Button>

          </div>
        </div>
      </form>
    </Form>
  )
}

// ── Tiny helper to keep section headers DRY ─────────────────────────────────
function SectionHeader({ icon, color, title }: { icon: React.ReactNode; color: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className={`h-8 w-8 flex items-center justify-center rounded-lg ${color}`}>
        {icon}
      </div>
      <h3 className="text-sm font-black text-slate-900 uppercase">{title}</h3>
    </div>
  )
}