// components/admin/tree-form.tsx
"use client"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useTransition } from "react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Save, X, Loader2, Navigation,
  BadgePercent, Calendar, Info, Image as ImageIcon,
} from "lucide-react"
import { CldUploadWidget } from "next-cloudinary"
// import { cn } from "@/lib/utils"

import { treeSchema, type TreeFormValues } from "@/lib/validations"
import { createTree, updateTree } from "@/actions/tree.actions"
import { adminGetAllFarmers, adminGetTreePlans } from "@/actions/admin.actions"
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
      gps_lat: initialData?.gps_lat ?? null,
      gps_lng: initialData?.gps_lng ?? null,
      price: initialData?.price ?? 0,
      age_years: initialData?.age_years ?? 0,
      yield_min_kg: initialData?.yield_min_kg ?? 0,
      yield_max_kg: initialData?.yield_max_kg ?? 0,
      plan_id: initialData?.plan_id ?? "",
      source: initialData?.source ?? "own_farm",
      status: initialData?.status ?? "available",
      photos: (initialData?.photos as string[]) || [],
    },
  })

  const photos = useWatch({ control: form.control, name: "photos" }) || []

  const { data: farmers = [], isLoading: loadingFarmers } = useQuery({
    queryKey: ["admin", "farmers"],
    queryFn: () => adminGetAllFarmers(),
    staleTime: 1000 * 60 * 5, // farmers list barely changes
  })

  const { data: treePlans = [], isLoading: loadingPlans } = useQuery({
    queryKey: ["admin", "treePlans"],
    queryFn: () => adminGetTreePlans(),
    staleTime: 1000 * 60 * 5,
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
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Farmer / Orchard Owner
                    </FormLabel>
                    <Select
                      key={loadingFarmers ? "loading" : `loaded-${farmers.length}`}
                      onValueChange={(val) => field.onChange(val === "none" ? null : val)}
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 bg-muted/50 border-transparent rounded-xl text-xs font-bold uppercase tracking-widest">
                          <SelectValue placeholder={loadingFarmers ? "Loading..." : "Select Farmer"}>
                            {field.value === "none" || !field.value 
                              ? "None / TreeKart Owned" 
                              : farmers.find(f => f.id === field.value)?.farm_name}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-border bg-card">
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
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Tree Variety
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. Alphonso Gold"
                        className="h-12 bg-muted/50 border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-bold"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

                {/* GPS Lat */}
                <FormField control={form.control} name="gps_lat" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      GPS Latitude
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="number" step="any"
                          placeholder="e.g. 17.5934"
                          className="h-12 pl-10 bg-muted/50 border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-bold"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

                {/* GPS Lng */}
                <FormField control={form.control} name="gps_lng" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      GPS Longitude
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="number" step="any"
                          placeholder="e.g. 73.3421"
                          className="h-12 pl-10 bg-muted/50 border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-bold"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

                {/* Description */}
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Brief Narrative
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="The story and unique characteristics of this heritage tree..."
                        className="min-h-[120px] bg-muted/50 border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-medium leading-relaxed"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

              </div>
            </div>

            {/* Tree Imagery */}
            <div className="data-card">
              <div className="flex items-center justify-between mb-8">
                <SectionHeader icon={<ImageIcon size={18} />} color="bg-blue-100 text-blue-600" title="Tree Imagery" />

                <CldUploadWidget
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                  onSuccess={(result: any) => {
                    const currentPhotos = form.getValues("photos") || [];
                    if (currentPhotos.length < 4) {
                      form.setValue("photos", [...currentPhotos, result.info.secure_url], { shouldDirty: true })
                    } else {
                      toast.error("Maximum 4 photos allowed")
                    }
                  }}
                >
                  {({ open }) => (
                    <Button
                      type="button"
                      onClick={() => open()}
                      disabled={photos.length >= 4}
                      variant="outline"
                      className="h-10 border-dashed border-border rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                      Upload Photos ({photos.length}/4)
                    </Button>
                  )}
                </CldUploadWidget>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((url: string, index: number) => (
                  <div key={url} className="group relative aspect-square bg-muted rounded-2xl overflow-hidden border border-border shadow-sm">
                    <Image src={url} alt={`Tree Photo ${index + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const current = form.getValues("photos") || [];
                        form.setValue("photos", current.filter((_, i) => i !== index), { shouldDirty: true })
                      }}
                      className="absolute top-2 right-2 h-8 w-8 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-full text-destructive shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}

                {photos.length === 0 && (
                  <div className="col-span-full py-12 border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-muted-foreground/30">
                    <ImageIcon size={40} strokeWidth={1} className="mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No Photos Uploaded</p>
                  </div>
                )}
              </div>
              <FormField control={form.control} name="photos" render={() => (
                <FormItem className="mt-2">
                  <FormMessage className="text-[10px] font-bold" />
                </FormItem>
              )} />
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
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Seasonal Rent (INR)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">₹</span>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="number"
                          placeholder="9,999"
                          className="h-14 pl-10 bg-card border-transparent rounded-xl focus-visible:ring-primary/20 text-lg font-black"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="yield_min_kg" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Yield Min (kg)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="number" placeholder="25"
                          className="h-12 bg-card border-transparent rounded-xl focus-visible:ring-primary/20 text-xs font-bold text-center"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="yield_max_kg" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Yield Max (kg)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="number" placeholder="40"
                          className="h-12 bg-card border-transparent rounded-xl focus-visible:ring-primary/20 text-xs font-bold text-center"
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
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Tree Age (Years)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        type="number" placeholder="15"
                        className="h-12 bg-muted/50 border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-bold"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

                {/* Source */}
                <FormField control={form.control} name="source" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Tree Source
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 bg-muted/50 border-transparent rounded-xl text-xs font-bold uppercase tracking-widest">
                          <SelectValue placeholder="Select Source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-border bg-card">
                        <SelectItem value="own_farm" className="text-xs font-bold uppercase tracking-widest py-3">TreeKart Owned</SelectItem>
                        <SelectItem value="partner" className="text-xs font-bold uppercase tracking-widest py-3">Partner Orchard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

                {/* Plan ID */}
                <FormField control={form.control} name="plan_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Rental Plan
                    </FormLabel>
                    <Select
                      key={loadingPlans ? "loading" : `loaded-${treePlans.length}`}
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 bg-muted/50 border-transparent rounded-xl text-xs font-bold uppercase tracking-widest">
                          <SelectValue placeholder={loadingPlans ? "Loading plans..." : "Select Plan"}>
                            {field.value ? (treePlans.find(p => p.id === field.value)?.name) : null}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-border bg-card">
                        {treePlans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id} className="text-xs font-bold uppercase tracking-widest py-3">
                            {plan.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

                {/* Status */}
                <FormField control={form.control} name="status" render={({ field }) => {
                  const isReserved = !!(initialData?.status === "rented" && initialData?.reserved_until && new Date(initialData.reserved_until) > new Date());
                  const reservedUntilDate = isReserved ? new Date(initialData!.reserved_until!) : null;
                  
                  return (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Market Status
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 bg-muted/50 border-transparent rounded-xl text-xs font-bold uppercase tracking-widest">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-border bg-card">
                          <SelectItem 
                            value="available" 
                            disabled={isReserved}
                            className="text-xs font-bold uppercase tracking-widest py-3"
                          >
                            Active Market {isReserved && "(Reserved)"}
                          </SelectItem>
                          <SelectItem value="rented" className="text-xs font-bold uppercase tracking-widest py-3">Currently Rented</SelectItem>
                          <SelectItem value="inactive" className="text-xs font-bold uppercase tracking-widest py-3">Maintenance / Private</SelectItem>
                        </SelectContent>
                      </Select>
                      {isReserved && reservedUntilDate && (
                        <div className="mt-2 flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-600">
                          <Info size={14} className="mt-0.5 shrink-0" />
                          <p className="text-[10px] font-bold leading-normal">
                            STRICT PROTECTION ACTIVE: This tree is rented until {reservedUntilDate.toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric"
                            })}. You cannot mark it as Available until this date.
                          </p>
                        </div>
                      )}
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )
                }} />

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
      <h3 className="text-sm font-black text-foreground uppercase">{title}</h3>
    </div>
  )
}