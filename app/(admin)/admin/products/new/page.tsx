import { ProductForm } from "@/components/admin/products/product-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="space-y-4">
        <Link 
          href="/admin/products" 
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
        >
          <ChevronLeft size={14} />
          Back to Shop Inventory
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Add New Product</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Register a new mango box or organic product to the shop</p>
        </div>
      </div>

      <ProductForm />
    </div>
  );
}
