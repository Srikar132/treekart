import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { getBlogs } from "@/actions/blog.actions";

export const metadata: Metadata = {
  title: "The Journal — TreeKart",
  description: "Notes from the orchard. Updates on harvest cycles, organic farming techniques, and the heritage of Alphonso mangoes.",
};

interface BlogPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const limit = 6;

  const { data: posts, totalPages, count } = await getBlogs(currentPage, limit);

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-32 space-y-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <span className="text-[10px] font-bold tracking-[0.4em] text-primary">
              The Journal
            </span>
            <h1 className="text-5xl md:text-8xl font-black text-foreground tracking-tighter leading-none">
              Notes from<br />The Orchard
            </h1>
          </div>
          <div className="max-w-xs space-y-4">
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground leading-relaxed">
              A chronological log of our seasonal progress, agricultural innovations, and farm philosophy.
            </p>
            <div className="h-px w-full bg-border/40" />
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-primary">
              <span>{count} Stories Published</span>
            </div>
          </div>
        </div>

        {/* Blog "Data Table" List */}
        <div className="border-t border-border min-h-[400px]">
          {posts.length > 0 ? (
            posts.map((post) => (
              <Link 
                href={`/blog/${post.slug}`} 
                key={post.id}
                className="group grid grid-cols-1 md:grid-cols-12 gap-6 py-12 border-b border-border/60 hover:bg-secondary/5 transition-colors px-4 -mx-4"
              >
                {/* Meta column */}
                <div className="md:col-span-3 space-y-1">
                  <p className="text-[10px] font-bold tracking-widest text-muted-foreground">
                    {new Date(post.published_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-[9px] font-bold tracking-[0.2em] text-primary">
                    {post.category || 'Orchard Updates'}
                  </p>
                </div>

                {/* Title & Excerpt column */}
                <div className="md:col-span-7 space-y-4">
                  <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors leading-none">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>

                {/* Action column */}
                <div className="md:col-span-2 flex items-center md:justify-end gap-3 group-hover:gap-5 transition-all">
                  <span className="text-[10px] font-black tracking-widest text-foreground">
                    Read More
                  </span>
                  <ArrowRight size={16} className="text-primary" />
                </div>
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center border-b border-border/40">
              <div className="w-20 h-20 bg-secondary/20 flex items-center justify-center">
                <BookOpen size={32} className="text-muted-foreground/30" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-foreground tracking-tight">No Stories Found</h3>
                <p className="text-xs text-muted-foreground tracking-widest max-w-xs mx-auto">
                  Our farm team is currently documenting new harvest updates. Please check back shortly.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-10 border-t border-border/40">
            <Link 
              href={`/blog?page=${currentPage - 1}`}
              className={`flex items-center gap-3 text-[10px] font-black tracking-widest transition-colors ${currentPage > 1 ? 'text-foreground hover:text-primary' : 'text-muted-foreground pointer-events-none opacity-30'}`}
            >
              <ChevronLeft size={16} />
              Previous
            </Link>
            
            <div className="hidden sm:flex gap-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link 
                  href={`/blog?page=${page}`}
                  key={page} 
                  className={`w-10 h-10 flex items-center justify-center text-[10px] font-black transition-colors ${page === currentPage ? 'bg-primary text-white' : 'hover:bg-secondary/20 text-muted-foreground'}`}
                >
                  {String(page).padStart(2, '0')}
                </Link>
              ))}
            </div>

            <Link 
              href={`/blog?page=${currentPage + 1}`}
              className={`flex items-center gap-3 text-[10px] font-black tracking-widest transition-colors ${currentPage < totalPages ? 'text-foreground hover:text-primary' : 'text-muted-foreground pointer-events-none opacity-30'}`}
            >
              Next
              <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
