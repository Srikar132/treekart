"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import {
  Save, X, Loader2, Info, Image as ImageIcon,
  Tag, BadgePercent, Package, AlertCircle
} from "lucide-react"
import { CldUploadWidget } from "next-cloudinary"

import { productSchema, type ProductFormValues } from "@/lib/validations"
import { createProduct, updateProduct } from "@/actions/products.actions"
import { type MangoProduct } from "@/types/database.types"

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
import { cn } from "@/lib/utils"

interface ProductFormProps {
  initialData?: MangoProduct
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEdit = !!initialData

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: initialData?.name ?? "",
      variety: initialData?.variety ?? "",
      description: initialData?.description ?? "",
      price: initialData?.price ?? undefined,
      original_price: initialData?.original_price ?? null,
      weight_kg: initialData?.weight_kg ?? undefined,
      badge: (initialData?.badge as any) ?? "None",
      status: (initialData?.status as any) ?? "available",
      image_url: initialData?.image_url ?? "",
    },
  })

  function onSubmit(values: ProductFormValues) {
    startTransition(async () => {
      const toastId = toast.loading(isEdit ? "Synchronizing product data..." : "Adding to shop inventory...")

      try {
        if (isEdit) {
          await updateProduct(initialData!.id, values)
          toast.success("Product updated successfully", { id: toastId })
        } else {
          await createProduct(values)
          toast.success("Product added to mango shop", { id: toastId })
        }
        router.push("/admin/products")
        router.refresh()
      } catch (err: any) {
        toast.error(err?.message ?? "Operation failed", { id: toastId })
      }
    })
  }

  function onInvalid() {
    const firstError = Object.values(form.formState.errors)[0]
    if (firstError?.message) {
      toast.error(firstError.message as string)
    }
  }

  const imageUrl = form.watch("image_url")

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="space-y-12 pb-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* ── LEFT: Core Details ──────────────────────────────── */}
          <div className="lg:col-span-8 space-y-8">

            {/* General Information */}
            <div className="data-card">
              <SectionHeader icon={<Info size={18} />} color="bg-primary/10 text-primary" title="Product Details" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Product Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. Premium Alphonso (Box of 12)"
                        className="h-12 bg-muted/50 border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-bold"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="variety" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Mango Variety
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                        <Input
                          {...field}
                          placeholder="e.g. Alphonso"
                          className="h-12 pl-10 bg-muted/50 border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-bold"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="weight_kg" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Net Weight (kg)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="number" step="0.01"
                          placeholder="e.g. 3.5"
                          className="h-12 pl-10 bg-muted/50 border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-bold"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Product Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Detailed description of the product, taste profile, and harvest details..."
                        className="min-h-[140px] bg-muted/50 border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-medium leading-relaxed"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Product Imagery */}
            <div className="data-card">
              <div className="flex items-center justify-between mb-8">
                <SectionHeader icon={<ImageIcon size={18} />} color="bg-blue-100 text-blue-600" title="Product Imagery" />

                <CldUploadWidget
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                  onSuccess={(result: any) => {
                    form.setValue("image_url", result.info.secure_url)
                  }}
                >
                  {({ open }) => (
                    <Button
                      type="button"
                      onClick={() => open()}
                      variant="outline"
                      className="h-10 border-dashed border-border rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                      Upload New Image
                    </Button>
                  )}
                </CldUploadWidget>
              </div>

              <div className="max-w-[300px]">
                {imageUrl ? (
                  <div className="group relative aspect-square bg-muted rounded-2xl overflow-hidden border border-border shadow-sm">
                    <img src={imageUrl} alt="Product Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => form.setValue("image_url", "")}
                      className="absolute top-2 right-2 h-8 w-8 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-full text-destructive shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="aspect-square border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-muted-foreground/30">
                    <ImageIcon size={40} strokeWidth={1} className="mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No Image Set</p>
                  </div>
                )}
                <FormField control={form.control} name="image_url" render={({ field }) => (
                  <FormItem className="mt-2">
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />
              </div>
            </div>

          </div>

          {/* ── RIGHT: Pricing & Logistics ─────────────────────── */}
          <div className="lg:col-span-4 space-y-8">

            {/* Pricing Card */}
            <div className="data-card bg-primary/5 border-primary/10">
              <SectionHeader icon={<BadgePercent size={18} />} color="bg-primary/10 text-primary" title="Commercials" />

              <div className="space-y-6">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Selling Price (INR)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">₹</span>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="number"
                          placeholder="1,499"
                          className="h-14 pl-10 bg-card border-transparent rounded-xl focus-visible:ring-primary/20 text-lg font-black"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="original_price" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      MRP / Original Price (Optional)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 font-bold text-sm">₹</span>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="number"
                          placeholder="1,999"
                          className="h-12 pl-10 bg-card border-transparent rounded-xl focus-visible:ring-primary/20 text-xs font-bold text-muted-foreground/50"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Status & Categorization */}
            <div className="data-card">
              <SectionHeader icon={<AlertCircle size={18} />} color="bg-orange-100 text-orange-600" title="Logistics" />

              <div className="space-y-6">
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Inventory Status
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 bg-muted/50 border-transparent rounded-xl text-xs font-bold uppercase tracking-widest">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-border">
                        <SelectItem value="available" className="text-xs font-bold uppercase tracking-widest py-3">In Stock</SelectItem>
                        <SelectItem value="out_of_stock" className="text-xs font-bold uppercase tracking-widest py-3">Out of Stock</SelectItem>
                        <SelectItem value="pre_order" className="text-xs font-bold uppercase tracking-widest py-3">Accepting Pre-Orders</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="badge" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Marketing Badge
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 bg-muted/50 border-transparent rounded-xl text-xs font-bold uppercase tracking-widest">
                          <SelectValue placeholder="Select Badge" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-border">
                        <SelectItem value="None" className="text-xs font-bold uppercase tracking-widest py-3">No Badge</SelectItem>
                        <SelectItem value="New" className="text-xs font-bold uppercase tracking-widest py-3 text-blue-600">New Launch</SelectItem>
                        <SelectItem value="Sale" className="text-xs font-bold uppercase tracking-widest py-3 text-orange-600">Flash Sale</SelectItem>
                        <SelectItem value="Pre-Order" className="text-xs font-bold uppercase tracking-widest py-3 text-purple-600">Limited Pre-Order</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Actions */}
            <Button
              type="submit"
              disabled={isPending}
              className="admin-button-primary w-full h-16 shadow-xl shadow-primary/20 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest"
            >
              {isPending ? (
                <><Loader2 className="animate-spin" size={20} /> {isEdit ? "Syncing..." : "Adding..."}</>
              ) : (
                <><Save size={20} /> {isEdit ? "Synchronize Changes" : "Publish to Shop"}</>
              )}
            </Button>

          </div>
        </div>
      </form>
    </Form>
  )
}

function SectionHeader({ icon, color, title }: { icon: React.ReactNode; color: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className={cn("h-8 w-8 flex items-center justify-center rounded-lg", color)}>
        {icon}
      </div>
      <h3 className="text-sm font-black text-foreground uppercase">{title}</h3>
    </div>
  )
}
