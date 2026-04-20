"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { History, Type, Info, Save, X, Plus, Loader2, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { adminCreateTreeUpdate } from "@/actions/admin.actions";
import { toast } from "sonner";
import { CldUploadWidget } from "next-cloudinary";

interface TreeUpdateFormProps {
  treeId: string;
}

export function TreeUpdateForm({ treeId }: TreeUpdateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      tree_id: treeId,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      photos: photos,
      video_url: videoUrl,
      posted_at: new Date().toISOString(),
    };

    try {
      await adminCreateTreeUpdate(data);
      toast.success("Growth update published to the timeline.");
      router.refresh();
      // Reset form
      (e.target as HTMLFormElement).reset();
      setPhotos([]);
      setVideoUrl("");
    } catch (error: any) {
      toast.error(error.message || "Failed to publish update.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="data-card border-primary/10 bg-primary/5">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-8 w-8 bg-primary/10 flex items-center justify-center rounded-lg text-primary">
          <History size={18} />
        </div>
        <h3 className="text-sm font-black text-slate-900 uppercase">Post Growth Update</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Update Title</label>
          <Input 
            name="title" 
            placeholder="e.g. Early Monsoon Flowering" 
            className="h-12 bg-white border-transparent rounded-xl focus-visible:ring-primary/20 text-xs font-bold" 
            required 
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Observations & Report</label>
          <Textarea 
            name="description" 
            placeholder="Describe the current health, growth stage, and harvest potential..." 
            className="min-h-[100px] bg-white border-transparent rounded-xl focus-visible:ring-primary/20 text-xs font-medium" 
            required 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Photos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Evidence Photos</label>
              <CldUploadWidget 
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                onSuccess={(result: any) => setPhotos([...photos, result.info.secure_url])}
              >
                {({ open }) => (
                  <button type="button" onClick={() => open()} className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">
                    Add Photo
                  </button>
                )}
              </CldUploadWidget>
            </div>
            <div className="flex flex-wrap gap-2">
              {photos.map((url, idx) => (
                <div key={idx} className="relative h-14 w-14 rounded-lg overflow-hidden border border-slate-200">
                  <img src={url} alt="Update Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                    className="absolute top-0 right-0 h-4 w-4 bg-destructive text-white flex items-center justify-center rounded-bl-lg"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Video */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Growth Stream (MUX/Video URL)</label>
            <div className="relative">
              <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <Input 
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://stream.mux.com/..." 
                className="h-12 pl-10 bg-white border-transparent rounded-xl focus-visible:ring-primary/20 text-xs font-bold" 
              />
            </div>
          </div>
        </div>

        <Button 
          disabled={loading}
          className="admin-button-primary w-full h-14 text-[10px] font-black uppercase tracking-widest"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : "Publish to Member Timeline"}
        </Button>
      </form>
    </div>
  );
}
