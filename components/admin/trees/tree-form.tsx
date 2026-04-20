"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { TreePine, MapPin, BadgePercent, Calendar, Info, Save, X, Plus, Loader2, Navigation, Tractor } from "lucide-react";
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
import { createTree, updateTree } from "@/actions/tree.actions";
import { adminGetAllFarmers } from "@/actions/admin.actions";
import { toast } from "sonner";
import { CldUploadWidget } from "next-cloudinary";
import { Database } from "@/types/database.types";

interface TreeFormProps {
  initialData?: any;
}

type Tree = Database['public']['Tables']['trees']['Row'];

export function TreeForm({ initialData }: TreeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(initialData?.photos || []);

  const { data: farmers = [], isLoading: loadingFarmers } = useQuery({
    queryKey: ["admin", "farmers"],
    queryFn: () => adminGetAllFarmers(),
  });

  const isEdit = !!initialData;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: any = {
      variety: formData.get("variety") as string,
      farmer_id: formData.get("farmer_id") as string,
      source: formData.get("source") as any,
      gps_lat: formData.get("gps_lat") ? Number(formData.get("gps_lat")) : null,
      gps_lng: formData.get("gps_lng") ? Number(formData.get("gps_lng")) : null,
      price: Number(formData.get("price")),
      age_years: Number(formData.get("age_years")),
      yield_min_kg: Number(formData.get("yield_min_kg")),
      yield_max_kg: Number(formData.get("yield_max_kg")),
      plan_type: formData.get("plan_type") as any,
      status: formData.get("status") as any,
      description: formData.get("description") as string,
      photos: images,
      is_verified: true,
    };

    try {
      if (isEdit) {
        await updateTree(initialData.id, data);
        toast.success("Heritage tree updated successfully.");
      } else {
        await createTree(data);
        toast.success("New heritage tree added to inventory.");
      }
      router.push("/admin/trees");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to save tree.");
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
              <h3 className="text-sm font-black text-slate-900 uppercase">Tree Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Farmer / Orchard Owner</label>
                <Select name="farmer_id" defaultValue={initialData?.farmer_id}>
                  <SelectTrigger className="h-12 bg-slate-50 border-transparent rounded-xl focus:ring-primary/20 text-xs font-bold uppercase tracking-widest">
                    <SelectValue placeholder={loadingFarmers ? "Loading farmers..." : "Select Farmer"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    {farmers.map((farmer) => (
                      <SelectItem key={farmer.id} value={farmer.id} className="text-xs font-bold uppercase tracking-widest py-3">
                        {farmer.farm_name} ({farmer.location})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Tree Variety</label>
                <Input
                  name="variety"
                  defaultValue={initialData?.variety}
                  placeholder="e.g. Alphonso Gold"
                  className="h-12 bg-slate-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 text-xs font-bold"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">GPS Coordinates (LAT)</label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <Input
                    name="gps_lat"
                    type="number"
                    step="any"
                    defaultValue={initialData?.gps_lat}
                    placeholder="e.g. 17.5934"
                    className="h-12 pl-10 bg-slate-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">GPS Coordinates (LNG)</label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <Input
                    name="gps_lng"
                    type="number"
                    step="any"
                    defaultValue={initialData?.gps_lng}
                    placeholder="e.g. 73.3421"
                    className="h-12 pl-10 bg-slate-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Brief Narrative</label>
                <Textarea
                  name="description"
                  defaultValue={initialData?.description}
                  placeholder="The story and unique characteristics of this heritage tree..."
                  className="min-h-[120px] bg-slate-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 text-xs font-medium leading-relaxed"
                  required
                />
              </div>
            </div>
          </div>

          {/* Media: Image Gallery */}
          <div className="data-card">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-100 flex items-center justify-center rounded-lg text-blue-600">
                  <Plus size={18} />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase">Image Gallery</h3>
              </div>

              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                onSuccess={(result: any) => {
                  setImages([...images, result.info.secure_url]);
                }}
              >
                {({ open }) => (
                  <Button
                    type="button"
                    onClick={() => open()}
                    variant="outline"
                    className="h-10 border-dashed border-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Upload Media
                  </Button>
                )}
              </CldUploadWidget>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((url, idx) => (
                <div key={idx} className="group relative aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                  <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="absolute top-2 right-2 h-8 w-8 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-full text-destructive shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {images.length === 0 && (
                <div className="aspect-square border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300">
                  <Plus size={24} className="mb-2" />
                  <span className="text-[9px] font-black uppercase tracking-widest">No Media</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Pricing & Status */}
        <div className="lg:col-span-4 space-y-8">

          <div className="data-card bg-primary/5 border-primary/10">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-8 bg-primary/10 flex items-center justify-center rounded-lg text-primary">
                <BadgePercent size={18} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Economics</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Seasonal Rent (INR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <Input
                    name="price"
                    type="number"
                    defaultValue={initialData?.price}
                    placeholder="9,999"
                    className="h-14 pl-10 bg-white border-transparent rounded-xl focus-visible:ring-primary/20 text-lg font-black"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Yield Min (kg)</label>
                  <Input
                    name="yield_min_kg"
                    type="number"
                    defaultValue={initialData?.yield_min_kg}
                    placeholder="25"
                    className="h-12 bg-white border-transparent rounded-xl focus-visible:ring-primary/20 text-xs font-bold text-center"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Yield Max (kg)</label>
                  <Input
                    name="yield_max_kg"
                    type="number"
                    defaultValue={initialData?.yield_max_kg}
                    placeholder="40"
                    className="h-12 bg-white border-transparent rounded-xl focus-visible:ring-primary/20 text-xs font-bold text-center"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="data-card">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-8 bg-orange-100 flex items-center justify-center rounded-lg text-orange-600">
                <Calendar size={18} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Configuration</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Tree Age (Years)</label>
                <Input
                  name="age_years"
                  type="number"
                  defaultValue={initialData?.age_years}
                  placeholder="15"
                  className="h-12 bg-slate-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 text-xs font-bold"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Tree Source</label>
                <Select name="source" defaultValue={initialData?.source || "own_farm"}>
                  <SelectTrigger className="h-12 bg-slate-50 border-transparent rounded-xl focus:ring-primary/20 text-xs font-bold uppercase tracking-widest">
                    <SelectValue placeholder="Select Source" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="own_farm" className="text-xs font-bold uppercase tracking-widest py-3">TreeKart Owned</SelectItem>
                    <SelectItem value="partner" className="text-xs font-bold uppercase tracking-widest py-3">Partner Orchard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Rental Plan</label>
                <Select name="plan_type" defaultValue={initialData?.plan_type || "standard"}>
                  <SelectTrigger className="h-12 bg-slate-50 border-transparent rounded-xl focus:ring-primary/20 text-xs font-bold uppercase tracking-widest">
                    <SelectValue placeholder="Select Plan" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="basic" className="text-xs font-bold uppercase tracking-widest py-3">Basic Yield</SelectItem>
                    <SelectItem value="standard" className="text-xs font-bold uppercase tracking-widest py-3">Standard Heritage</SelectItem>
                    <SelectItem value="max" className="text-xs font-bold uppercase tracking-widest py-3">Maximum Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Market Status</label>
                <Select name="status" defaultValue={initialData?.status || "available"}>
                  <SelectTrigger className="h-12 bg-slate-50 border-transparent rounded-xl focus:ring-primary/20 text-xs font-bold uppercase tracking-widest">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="available" className="text-xs font-bold uppercase tracking-widest py-3">Active Market</SelectItem>
                    <SelectItem value="rented" className="text-xs font-bold uppercase tracking-widest py-3">Currently Rented</SelectItem>
                    <SelectItem value="inactive" className="text-xs font-bold uppercase tracking-widest py-3">Maintenance (Off-Market)</SelectItem>
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
                {isEdit ? "Synchronize Changes" : "Deploy to Market"}
              </>
            )}
          </Button>

        </div>
      </div>
    </form>
  );
}
