"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Type, Tag, User, Calendar, Save, X, Plus, Loader2, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createBlog, updateBlog } from "@/actions/blog.actions";
import { toast } from "sonner";
import { CldUploadWidget } from "next-cloudinary";

interface BlogFormProps {
  initialData?: any;
}

export function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<string>(initialData?.cover_image || "");

  const isEdit = !!initialData;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      slug: formData.get("slug"),
      category: formData.get("category"),
      author: formData.get("author"),
      excerpt: formData.get("excerpt"),
      content: formData.get("content"),
      cover_image: coverImage,
      published_at: formData.get("published_at") || new Date().toISOString(),
    };

    try {
      if (isEdit) {
        await updateBlog(initialData.id, data);
        toast.success("Journal entry synchronized.");
      } else {
        await createBlog(data);
        toast.success("New story published to the orchard log.");
      }
      router.push("/admin/blogs");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to save entry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Content */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main Content */}
          <div className="data-card">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-8 bg-primary/10 flex items-center justify-center rounded-lg text-primary">
                <Type size={18} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Story Content</h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Article Title</label>
                <Input 
                  name="title" 
                  defaultValue={initialData?.title} 
                  placeholder="e.g. The Science of Alphonso Ripening" 
                  className="h-14 bg-slate-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 text-lg font-black" 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">SEO Slug</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <Input 
                      name="slug" 
                      defaultValue={initialData?.slug} 
                      placeholder="e.g. alphonso-ripening-science" 
                      className="h-12 pl-10 bg-slate-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 text-xs font-bold" 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Category</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <Input 
                      name="category" 
                      defaultValue={initialData?.category} 
                      placeholder="e.g. Orchard Updates" 
                      className="h-12 pl-10 bg-slate-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 text-xs font-bold" 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Executive Summary (Excerpt)</label>
                <Textarea 
                  name="excerpt" 
                  defaultValue={initialData?.excerpt} 
                  placeholder="A short summary for the blog list view..." 
                  className="min-h-[80px] bg-slate-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 text-xs font-medium" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Full Article (Markdown)</label>
                <Textarea 
                  name="content" 
                  defaultValue={initialData?.content} 
                  placeholder="Write your story here..." 
                  className="min-h-[400px] bg-slate-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 text-sm font-medium leading-relaxed font-mono" 
                  required 
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Metadata & Media */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Cover Image */}
          <div className="data-card">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-100 flex items-center justify-center rounded-lg text-blue-600">
                  <Plus size={18} />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase">Cover Media</h3>
              </div>
              
              <CldUploadWidget 
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                onSuccess={(result: any) => {
                  setCoverImage(result.info.secure_url);
                }}
              >
                {({ open }) => (
                  <Button 
                    type="button" 
                    onClick={() => open()}
                    variant="outline" 
                    className="h-10 border-dashed border-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Set Cover
                  </Button>
                )}
              </CldUploadWidget>
            </div>

            <div className="aspect-video w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
              {coverImage ? (
                <div className="group relative w-full h-full">
                  <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setCoverImage("")}
                    className="absolute top-2 right-2 h-8 w-8 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-full text-destructive shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                  <Plus size={24} className="mb-2" />
                  <span className="text-[9px] font-black uppercase tracking-widest">No Cover Image</span>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="data-card">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-8 bg-orange-100 flex items-center justify-center rounded-lg text-orange-600">
                <User size={18} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Publication Info</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Author Identity</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <Input 
                    name="author" 
                    defaultValue={initialData?.author || "TreeKart Concierge"} 
                    placeholder="Author name" 
                    className="h-12 pl-10 bg-slate-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 text-xs font-bold" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Publication Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <Input 
                    name="published_at" 
                    type="datetime-local"
                    defaultValue={initialData?.published_at ? new Date(initialData.published_at).toISOString().slice(0, 16) : ""} 
                    className="h-12 pl-10 bg-slate-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 text-xs font-bold" 
                  />
                </div>
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
                {isEdit ? "Update Journal" : "Publish Story"}
              </>
            )}
          </Button>

        </div>
      </div>
    </form>
  );
}
