"use server";

import { getSupabaseServer } from "@/lib/auth";
import { Database } from "@/types/database.types";

type ProductBadge = Database["public"]["Enums"]["product_badge"];
type ProductStatus = Database["public"]["Enums"]["product_status"];

export type ProductSortOption = "newest" | "price_asc" | "price_desc" | "weight_asc" | "weight_desc";

export interface GetProductsOptions {
    filters?: {
        badge?: ProductBadge[];
        status?: ProductStatus[];
        minPrice?: number;
        maxPrice?: number;
    };
    sort?: ProductSortOption;
    page?: number;
    limit?: number;
    excludeId?: string;
}

// ── PUBLIC ─────────────────────────────────────────────────────────

export async function getMangoProducts(options?: GetProductsOptions) {
    const supabase = await getSupabaseServer();

    let query = supabase
        .from("mango_products")
        .select("*", { count: "exact" });

    // Apply filters
    if (options?.excludeId) {
        query = query.neq("id", options.excludeId);
    }

    if (options?.filters) {
        const { badge, status, minPrice, maxPrice } = options.filters;
        if (badge && badge.length > 0) {
            query = query.in("badge", badge);
        }
        if (status && status.length > 0) {
            query = query.in("status", status);
        }
        if (minPrice !== undefined) {
            query = query.gte("price", minPrice);
        }
        if (maxPrice !== undefined) {
            query = query.lte("price", maxPrice);
        }
    }

    // Apply sorting
    if (options?.sort) {
        switch (options.sort) {
            case "newest":
                query = query.order("created_at", { ascending: false });
                break;
            case "price_asc":
                query = query.order("price", { ascending: true });
                break;
            case "price_desc":
                query = query.order("price", { ascending: false });
                break;
            case "weight_asc":
                query = query.order("weight_kg", { ascending: true });
                break;
            case "weight_desc":
                query = query.order("weight_kg", { ascending: false });
                break;
        }
    } else {
        // Default sort
        query = query.order("created_at", { ascending: false });
    }

    // Apply pagination
    const page = options?.page && options.page > 0 ? options.page : 1;
    const limit = options?.limit && options.limit > 0 ? options.limit : 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return {
        products: data,
        totalCount: count || 0,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0,
    };
}

export async function getProductById(productId: string) {
    const supabase = await getSupabaseServer();

    const { data, error } = await supabase
        .from("mango_products")
        .select("*")
        .eq("id", productId)
        .single();

    if (error) throw new Error(error.message);
    return data;
}
