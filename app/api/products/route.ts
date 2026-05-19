import { NextRequest, NextResponse } from "next/server";
import { getMangoProducts, type GetProductsOptions, type ProductSortOption } from "@/actions/products.actions";
import type { Database } from "@/types/database.types";

type ProductBadge = Database["public"]["Enums"]["product_badge"];
type ProductStatus = Database["public"]["Enums"]["product_status"];

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;

  const badge = p.get("badge")?.split(",").filter(Boolean) as ProductBadge[] | undefined;
  const status = p.get("status")?.split(",").filter(Boolean) as ProductStatus[] | undefined;

  const options: GetProductsOptions = {
    page: p.get("page") ? Number(p.get("page")) : 1,
    limit: p.get("limit") ? Number(p.get("limit")) : 12,
    sort: (p.get("sort") as ProductSortOption) || undefined,
    excludeId: p.get("excludeId") ?? undefined,
    filters: {
      badge: badge?.length ? badge : undefined,
      status: status?.length ? status : undefined,
      minPrice: p.get("minPrice") ? Number(p.get("minPrice")) : undefined,
      maxPrice: p.get("maxPrice") ? Number(p.get("maxPrice")) : undefined,
    },
  };

  try {
    const data = await getMangoProducts(options);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
