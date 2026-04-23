// app/admin/products/search-params.ts
import {
    createSearchParamsCache,
    parseAsInteger,
    parseAsString,
    parseAsStringEnum,
} from "nuqs/server";
import type { ProductStatus, ProductBadge } from "@/types/database.types";

export const productsSearchParamsCache = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    pageSize: parseAsInteger.withDefault(15),
    sort: parseAsString.withDefault("created_at"),
    order: parseAsStringEnum(["asc", "desc"] as const).withDefault("desc"),
    q: parseAsString.withDefault(""),
    status: parseAsString.withDefault(""),
    badge: parseAsString.withDefault(""),
});

export type ProductsSearchParams = ReturnType<typeof productsSearchParamsCache.parse>;
