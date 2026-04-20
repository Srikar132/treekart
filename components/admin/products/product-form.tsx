"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Tag, Package, Info, Save, X, Plus, Loader2, Weight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { createProduct, updateProduct } from "@/actions/products.actions";
import { toast } from "sonner";
import { CldUploadWidget } from "next-cloudinary";

interface ProductFormProps {
  initialData?: any;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(initialData?.image_url || "");

  const isEdit = !!initialData;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      variety: formData.get("variety") as string,
      price: Number(formData.get("price")),
      original_price: formData.get("original_price") ? Number(formData.get("original_price")) : null,
      weight_kg: Number(formData.get("weight_kg")),
      badge: formData.get("badge") as any,
      status: formData.get("status") as any,
      description: formData.get("description") as string,
      image_url: imageUrl,
    };

    try {
      if (isEdit) {
        await updateProduct(initialData.id, data);
        toast.success("Mango product updated successfully.");
      } else {
        await createProduct(data);
        toast.success("New product added to the mango shop.");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to save product.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Core Details */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* General Information */}
          <div className="data-card">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-8 bg-primary/10 flex items-center justify-center rounded-lg text-primary">
                <Info size={18} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Product Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Product Name</label>
                <Input 
                  name="name" 
                  defaultValue={initialData?.name} 
                  placeholder="e.g. Premium Alphonso (Box of 12)" 
                  className="h-12 bg-slate-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 text-xs font-bold" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Variety</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <Input 
                    name="variety" 
                    defaultValue={initialData?.variety} 
                    placeholder="e.g. Alphonso" 
                    className="h-12 pl-10 bg-slate-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 text-xs font-bold" 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Product Description</label>
                <Textarea 
                  name="description" 
                  defaultValue={initialData?.description} 
                  placeholder="Detailed description of the product, including taste profile and harvest region..." 
                  className="min-h-[120px] bg-slate-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 text-xs font-medium leading-relaxed" 
                  required 
                />
              </div>
            </div>
          </div>

          {/* Media: Main Image */}
          <div className="data-card">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-100 flex items-center justify-center rounded-lg text-blue-600">
                  <Plus size={18} />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase">Product Imagery</h3>
              </div>
              
              <CldUploadWidget 
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                onSuccess={(result: any) => {
                  setImageUrl(result.info.secure_url);
                }}
              >
                {({ open }) => (
                  <Button 
                    type="button" 
                    onClick={() => open()}
                    variant="outline" 
                    className="h-10 border-dashed border-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Set Primary Image
                  </Button>
                )}
              </CldUploadWidget>
            </div>

            <div className="max-w-[300px]">
              {imageUrl ? (
                <div className="group relative aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                  <img src={imageUrl} alt="Product Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 right-2 h-8 w-8 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-full text-destructive shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="aspect-square border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300">
                  <Plus size={24} className="mb-2" />
                  <span className="text-[9px] font-black uppercase tracking-widest">No Image Selected</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Pricing & Logistics */}
        <div className="lg:col-span-4 space-y-8">
          
          <div className="data-card bg-primary/5 border-primary/10">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-8 bg-primary/10 flex items-center justify-center rounded-lg text-primary">
                <Tag size={18} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Commerce</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Selling Price (INR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <Input 
                    name="price" 
                    type="number"
                    defaultValue={initialData?.price} 
                    placeholder="1,499" 
                    className="h-14 pl-10 bg-white border-transparent rounded-xl focus-visible:ring-primary/20 text-lg font-black" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Original Price (Optional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <Input 
                    name="original_price" 
                    type="number"
                    defaultValue={initialData?.original_price} 
                    placeholder="1,999" 
                    className="h-12 pl-10 bg-white border-transparent rounded-xl focus-visible:ring-primary/20 text-xs font-bold text-muted-foreground line-through decoration-destructive/30" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Net Weight (kg)</label>
                <div className="relative">
                  <Weight className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <Input 
                    name="weight_kg" 
                    type="number"
                    step="0.01"
                    defaultValue={initialData?.weight_kg} 
                    placeholder="3.5" 
                    className="h-12 pl-10 bg-white border-transparent rounded-xl focus-visible:ring-primary/20 text-xs font-bold" 
                    required 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="data-card">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-8 bg-orange-100 flex items-center justify-center rounded-lg text-orange-600">
                <Package size={18} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Status & Tags</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Marketing Badge</label>
                <Select name="badge" defaultValue={initialData?.badge || "None"}>
                  <SelectTrigger className="h-12 bg-slate-50 border-transparent rounded-xl focus:ring-primary/20 text-xs font-bold uppercase tracking-widest">
                    <SelectValue placeholder="Select Badge" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="None" className="text-xs font-bold uppercase tracking-widest py-3">No Badge</SelectItem>
                    <SelectItem value="New" className="text-xs font-bold uppercase tracking-widest py-3 text-blue-600">New Arrival</SelectItem>
                    <SelectItem value="Sale" className="text-xs font-bold uppercase tracking-widest py-3 text-orange-600">On Sale</SelectItem>
                    <SelectItem value="Pre-Order" className="text-xs font-bold uppercase tracking-widest py-3 text-green-600">Pre-Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Inventory Status</label>
                <Select name="status" defaultValue={initialData?.status || "available"}>
                  <SelectTrigger className="h-12 bg-slate-50 border-transparent rounded-xl focus:ring-primary/20 text-xs font-bold uppercase tracking-widest">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="available" className="text-xs font-bold uppercase tracking-widest py-3">In Stock</SelectItem>
                    <SelectItem value="out_of_stock" className="text-xs font-bold uppercase tracking-widest py-3">Out of Stock</SelectItem>
                    <SelectItem value="pre_order" className="text-xs font-bold uppercase tracking-widest py-3">Accepting Pre-Orders</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button 
            disabled={loading}
            className="admin-button-primary w-full h-16 shadow-xl shadow-primary/20 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Save size={20} />
                {isEdit ? "Synchronize Changes" : "Deploy Product"}
              </>
            )}
          </Button>

        </div>
      </div>
    </form>
  );
}
