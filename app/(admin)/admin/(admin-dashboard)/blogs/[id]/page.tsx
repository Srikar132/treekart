import { getBlogById } from "@/actions/blog.actions";
import { BlogForm } from "@/components/admin/blogs/blog-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const [{ id }] = await Promise.all([params, requireAdmin()]);
  const blog = await getBlogById(id);

  if (!blog) {
    notFound();
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/admin/blogs"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft size={14} />
          Back to Journal
        </Link>
        <div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Edit Story</h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Updating journal entry #{blog.id.slice(0, 8)}</p>
        </div>
      </div>

      <BlogForm initialData={blog} />
    </div>
  );
}
