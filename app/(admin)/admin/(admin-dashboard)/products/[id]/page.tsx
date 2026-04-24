import { getProductById } from "@/actions/products.actions";
import { ProductForm } from "@/components/admin/products/product-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  await requireAdmin();
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

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
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Edit Product</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Updating details for product #{product.id.slice(0, 8)}</p>
        </div>
      </div>

      <ProductForm initialData={product} />
    </div>
  );
}
