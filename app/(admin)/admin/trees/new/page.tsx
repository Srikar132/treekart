import { TreeForm } from "@/components/admin/trees/tree-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewTreePage() {
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
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Deploy New Tree</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Onboard a new heritage Alphonso tree to the platform</p>
        </div>
      </div>

      <TreeForm />
    </div>
  );
}
