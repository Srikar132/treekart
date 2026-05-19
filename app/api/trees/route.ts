import { NextRequest, NextResponse } from "next/server";
import { getAvailableTrees, type GetTreesOptions, type TreeSortOption } from "@/actions/tree.actions";
import type { Database } from "@/types/database.types";

type TreeStatus = Database["public"]["Enums"]["tree_status"];

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;

  const planId = p.get("planId")?.split(",").filter(Boolean);
  const status = p.get("status")?.split(",").filter(Boolean) as TreeStatus[] | undefined;

  const options: GetTreesOptions = {
    page: p.get("page") ? Number(p.get("page")) : 1,
    limit: p.get("limit") ? Number(p.get("limit")) : 12,
    sort: (p.get("sort") as TreeSortOption) || undefined,
    excludeId: p.get("excludeId") ?? undefined,
    filters: {
      planId: planId?.length ? planId : undefined,
      status: status?.length ? status : undefined,
      minPrice: p.get("minPrice") ? Number(p.get("minPrice")) : undefined,
      maxPrice: p.get("maxPrice") ? Number(p.get("maxPrice")) : undefined,
      minAge: p.get("minAge") ? Number(p.get("minAge")) : undefined,
      maxAge: p.get("maxAge") ? Number(p.get("maxAge")) : undefined,
    },
  };

  try {
    const data = await getAvailableTrees(options);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30" },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
