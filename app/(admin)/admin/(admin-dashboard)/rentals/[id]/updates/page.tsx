import { getTreeUpdates } from "@/actions/tree.actions";
import { TreeUpdateForm } from "@/components/admin/trees/tree-update-form";
import { ChevronLeft, History, Video, ImageIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminGetRentalById } from "@/actions/admin.actions";
import { DeleteUpdateBtn } from "@/components/admin/trees/delete-update-btn";
import { requireAdmin } from "@/lib/auth";
import { TreeUpdate } from "@/types/database.types";

interface TreeUpdatesPageProps {
  params: Promise<{ id: string }>;
}

export default async function TreeUpdatesPage({ params }: TreeUpdatesPageProps) {
  await requireAdmin();
  const { id } = await params; // This is the rentalId

  const rental = await adminGetRentalById(id);
  if (!rental) {
    notFound();
  }

  const updates = await getTreeUpdates(id);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/admin/rentals"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft size={14} />
          Back to Rentals
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Growth Timeline</h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Heritage {rental.trees?.variety} Log &mdash; {rental.profiles?.full_name} ({rental.season})
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: New Update Form */}
        <div className="lg:col-span-5">
          <div className="sticky top-8">
            <TreeUpdateForm treeId={rental.tree_id!} rentalId={id} />
          </div>
        </div>

        {/* Right: Existing Timeline */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Historical Log ({updates.length})</p>
            <History size={14} className="text-muted-foreground/30" />
          </div>

          <div className="relative space-y-8 before:absolute before:left-5 before:top-4 before:bottom-4 before:w-px before:bg-border">
            {updates.map((update: TreeUpdate) => (
              <GrowthUpdateCard key={update.id} update={update} rentalId={id} />
            ))}

            {updates.length === 0 && (
              <div className="data-card text-center py-20 border-dashed border-2 bg-muted/50">
                <div className="h-12 w-12 bg-card rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground/30">
                  <ImageIcon size={20} />
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No growth updates recorded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GrowthUpdateCard({ update, rentalId }: { update: TreeUpdate; rentalId: string }) {
  return (
    <div className="relative pl-12 group">
      <div className="absolute left-3 top-2 h-4 w-4 rounded-full bg-card border-2 border-primary ring-4 ring-card z-10" />
      <div className="data-card group-hover:border-primary/20 transition-all duration-300 hover:shadow-md">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
              {update.posted_at ? new Date(update.posted_at).toLocaleDateString(undefined, { dateStyle: 'full' }) : 'N/A'}
            </p>
            <h4 className="text-sm font-black text-foreground uppercase tracking-tight mt-1">{update.title}</h4>
          </div>

          <DeleteUpdateBtn updateId={update.id} rentalId={rentalId} />
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mb-6 font-medium">{update.description}</p>


        {update.video_url && (
          <div className="h-20 w-36 rounded-xl bg-card flex items-center justify-center text-foreground gap-2 border border-border shadow-xl group/video cursor-pointer hover:bg-muted transition-colors">
            <Video size={16} className="text-primary group-hover/video:scale-110 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-widest">Stream Log</span>
          </div>
        )}
      </div>
    </div>
  );
}
