import { getTreeById, getTreeUpdates } from "@/actions/tree.actions";
import { TreeUpdateForm } from "@/components/admin/trees/tree-update-form";
import { ChevronLeft, History, Trash2, Video, ImageIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { adminDeleteTreeUpdate } from "@/actions/admin.actions";

import { requireAdmin } from "@/lib/auth";

interface TreeUpdatesPageProps {
  params: Promise<{ id: string }>;
}

export default async function TreeUpdatesPage({ params }: TreeUpdatesPageProps) {
  await requireAdmin();
  const { id } = await params;
  const tree = await getTreeById(id);
  const updates = await getTreeUpdates(id);

  if (!tree) {
    notFound();
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="space-y-4">
        <Link 
          href="/admin/trees" 
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
        >
          <ChevronLeft size={14} />
          Back to Inventory
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Growth Timeline</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Heritage {tree.variety} #{tree.id.slice(0, 8)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left: New Update Form */}
        <div className="lg:col-span-5">
          <TreeUpdateForm treeId={id} />
        </div>

        {/* Right: Existing Timeline */}
        <div className="lg:col-span-7 space-y-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Historical Log ({updates.length})</p>
          
          <div className="relative space-y-6 before:absolute before:left-5 before:top-4 before:bottom-4 before:w-px before:bg-slate-100">
            {updates.map((update: any) => (
              <div key={update.id} className="relative pl-12 group">
                <div className="absolute left-3 top-2 h-4 w-4 rounded-full bg-white border-2 border-primary ring-4 ring-white z-10" />
                <div className="data-card group-hover:border-primary/20 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{new Date(update.posted_at).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mt-1">{update.title}</h4>
                    </div>
                    <form action={async () => {
                      "use server";
                      await adminDeleteTreeUpdate(update.id);
                    }}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-destructive rounded-lg">
                        <Trash2 size={14} />
                      </Button>
                    </form>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">{update.description}</p>
                  
                  <div className="flex flex-wrap gap-3">
                    {update.photos?.map((photo: string, i: number) => (
                      <div key={i} className="h-20 w-28 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                        <img src={photo} alt="Growth evidence" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {update.video_url && (
                      <div className="h-20 w-36 rounded-xl bg-slate-900 flex items-center justify-center text-white gap-2 border border-slate-800 shadow-xl group/video cursor-pointer">
                        <Video size={16} className="text-primary group-hover/video:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Stream Log</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {updates.length === 0 && (
              <div className="data-card text-center py-12">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No growth updates recorded yet</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
