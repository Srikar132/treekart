"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, Type, Tag, User, Calendar, Save, X, Plus, Loader2, Link as LinkIcon } from "lucide-react";
import slugify from "slugify";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createBlog, updateBlog } from "@/actions/blog.actions";
import { toast } from "sonner";
import { CldUploadWidget } from "next-cloudinary";
import { blogSchema, type BlogFormValues } from "@/lib/validations";
import {
  Form, FormControl, FormField, FormItem,
  FormLabel, FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

interface BlogFormProps {
  initialData?: any;
}

export function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [coverImage, setCoverImage] = useState<string>(initialData?.cover_image || "");
  const isEdit = !!initialData;

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema) as any,
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      category: initialData?.category ?? "",
      author: initialData?.author ?? "TreeKart Concierge",
      excerpt: initialData?.excerpt ?? "",
      content: initialData?.content ?? "",
      published_at: initialData?.published_at ? new Date(initialData.published_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    },
  });

  const watchedTitle = form.watch("title");

  useEffect(() => {
    if (watchedTitle && !isEdit) {
      const slug = slugify(watchedTitle, { lower: true, strict: true });
      form.setValue("slug", slug);
    }
  }, [watchedTitle, form, isEdit]);

  function onSubmit(values: BlogFormValues) {
    startTransition(async () => {
      const toastId = toast.loading(isEdit ? "Synchronizing journal..." : "Publishing story...");

      try {
        const data = { ...values, cover_image: coverImage };
        if (isEdit) {
          await updateBlog(initialData.id, data);
          toast.success("Journal entry synchronized", { id: toastId });
        } else {
          await createBlog(data);
          toast.success("New story published to the orchard log", { id: toastId });
        }
        router.push("/admin/blogs");
        router.refresh();
      } catch (error: any) {
        toast.error(error.message || "Failed to save entry", { id: toastId });
      }
    });
  }

  function onInvalid() {
    const firstError = Object.values(form.formState.errors)[0];
    if (firstError?.message) {
      toast.error(firstError.message as string);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left Column: Content */}
          <div className="lg:col-span-8 space-y-8">
            <div className="data-card">
              <SectionHeader icon={<Type size={18} />} color="bg-primary/10 text-primary" title="Story Content" />

              <div className="space-y-6">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Article Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. The Science of Alphonso Ripening"
                        className="h-14 bg-muted border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-lg font-black"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="slug" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">SEO Slug</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={16} />
                          <Input
                            {...field}
                            placeholder="e.g. alphonso-ripening-science"
                            disabled
                            className="h-12 pl-10 bg-muted/50 border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-bold cursor-not-allowed"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Category</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={16} />
                          <Input
                            {...field}
                            placeholder="e.g. Orchard Updates"
                            className="h-12 pl-10 bg-muted border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-bold"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold" />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="excerpt" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Executive Summary (Excerpt)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="A short summary for the blog list view..."
                        className="min-h-[80px] bg-muted border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-medium"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="content" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Full Article (Markdown)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Write your story here..."
                        className="min-h-[400px] bg-muted border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-sm font-medium leading-relaxed font-mono"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />
              </div>
            </div>
          </div>

          {/* Right Column: Metadata & Media */}
          <div className="lg:col-span-4 space-y-8">
            <div className="data-card">
              <div className="flex items-center justify-between mb-8">
                <SectionHeader icon={<Plus size={18} />} color="bg-blue-100 text-blue-600" title="Cover Media" className="mb-0" />
                <CldUploadWidget
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                  onSuccess={(result: any) => setCoverImage(result.info.secure_url)}
                >
                  {({ open }) => (
                    <Button
                      type="button"
                      onClick={() => open()}
                      variant="outline"
                      className="h-10 border-dashed border-border rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                      Set Cover
                    </Button>
                  )}
                </CldUploadWidget>
              </div>

              <div className="aspect-video w-full bg-muted rounded-2xl overflow-hidden border border-border">
                {coverImage ? (
                  <div className="group relative w-full h-full">
                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCoverImage("")}
                      className="absolute top-2 right-2 h-8 w-8 bg-card/90 backdrop-blur-sm flex items-center justify-center rounded-full text-destructive shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
                    <Plus size={24} className="mb-2" />
                    <span className="text-[9px] font-black uppercase tracking-widest">No Cover Image</span>
                  </div>
                )}
              </div>
            </div>

            <div className="data-card">
              <SectionHeader icon={<User size={18} />} color="bg-orange-100 text-orange-600" title="Publication Info" />

              <div className="space-y-6">
                <FormField control={form.control} name="author" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Author Identity</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={16} />
                        <Input
                          {...field}
                          placeholder="Author name"
                          className="h-12 pl-10 bg-muted border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-bold"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="published_at" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Publication Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={16} />
                        <Input
                          {...field}
                          type="datetime-local"
                          className="h-12 pl-10 bg-muted border-transparent rounded-xl focus-visible:bg-card focus-visible:ring-primary/20 text-xs font-bold"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )} />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="admin-button-primary w-full h-16 shadow-xl shadow-primary/20 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest"
            >
              {isPending ? (
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
    </Form>
  );
}

function SectionHeader({ icon, color, title, className }: { icon: React.ReactNode; color: string; title: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 mb-8", className)}>
      <div className={cn("h-8 w-8 flex items-center justify-center rounded-lg", color)}>
        {icon}
      </div>
      <h3 className="text-sm font-black text-foreground uppercase">{title}</h3>
    </div>
  );
}
