import { getTreeById } from "@/actions/tree.actions";
import { TreeForm } from "@/components/admin/trees/tree-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";

interface EditTreePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTreePage({ params }: EditTreePageProps) {
  await requireAdmin();
  const { id } = await params;
  const tree = await getTreeById(id);

  if (!tree) {
    notFound();
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="space-y-4">
        <Link 
          href="/admin/trees" 
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft size={14} />
          Back to Inventory
        </Link>
        <div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Edit Heritage Tree</h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Updating details for tree #{tree.id.slice(0, 8)}</p>
        </div>
      </div>

      <TreeForm initialData={tree} />
    </div>
  );
}
