// app/(storefront)/blog/[slug]/page.tsx
import { getBlogBySlug } from "@/actions/blog.actions";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Calendar, User, Tag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  return (
    <article className="min-h-screen bg-background pb-24">
      {/* Editorial Header */}
      <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden bg-slate-900">
        {blog.cover_image ? (
          <Image
            src={blog.cover_image}
            alt={blog.title}
            fill
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-grove/20 to-mango/20 opacity-50" />
        )}

        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container pb-12 md:pb-20">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 text-xs font-bold uppercase tracking-widest transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Journal
            </Link>

            <div className="max-w-4xl">
              <Badge className="mb-6 bg-mango text-white border-0 px-4 py-1.5 shadow-lg shadow-mango/20 uppercase tracking-widest text-[10px] font-black">
                {blog.category}
              </Badge>
              <h1 className="text-white text-balance mb-8">
                {blog.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-white/80">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-mango" />
                  <span className="text-sm font-bold uppercase tracking-wider">{blog.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-mango" />
                  <span className="text-sm font-bold uppercase tracking-wider">
                    {new Date(blog.published_at || blog.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mt-12 md:mt-20">
        <div className="max-w-3xl mx-auto">
          {/* Excerpt/Intro */}
          {blog.excerpt && (
            <p className="p-xl !text-foreground font-medium border-l-4 border-mango pl-8 mb-16 italic leading-relaxed">
              {blog.excerpt}
            </p>
          )}

          {/* Body Content */}
          <div className="prose prose-slate prose-lg max-w-none 
            prose-headings:font-heading prose-headings:text-foreground prose-headings:uppercase prose-headings:tracking-tight
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-8
            prose-strong:text-foreground prose-strong:font-black
            prose-blockquote:border-mango prose-blockquote:bg-mango/5 prose-blockquote:py-2 prose-blockquote:px-8 prose-blockquote:rounded-r-xl
            prose-li:text-muted-foreground
            prose-img:rounded-3xl prose-img:shadow-2xl
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {blog.content || ""}
            </ReactMarkdown>
          </div>

          {/* Footer Tags */}
          <div className="mt-20 pt-10 border-t border-slate-100 flex items-center gap-4">
            <Tag size={16} className="text-mango" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filed under:</span>
            <Badge variant="outline" className="rounded-full text-[10px] font-black uppercase tracking-widest border-slate-200">
              {blog.category}
            </Badge>
          </div>
        </div>
      </div>
    </article>
  );
}
