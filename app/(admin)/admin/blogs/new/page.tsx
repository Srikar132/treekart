import { BlogForm } from "@/components/admin/blogs/blog-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewBlogPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="space-y-4">
        <Link 
          href="/admin/blogs" 
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
        >
          <ChevronLeft size={14} />
          Back to Journal
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Write New Story</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Share a new harvest log or orchard update</p>
        </div>
      </div>

      <BlogForm />
    </div>
  );
}
