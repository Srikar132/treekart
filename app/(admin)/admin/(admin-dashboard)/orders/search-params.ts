// app/admin/orders/search-params.ts
import {
    createSearchParamsCache,
    parseAsInteger,
    parseAsString,
    parseAsStringEnum,
} from "nuqs/server";

export const ordersSearchParamsCache = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    pageSize: parseAsInteger.withDefault(5),
    sort: parseAsString.withDefault("created_at"),
    order: parseAsStringEnum(["asc", "desc"] as const).withDefault("desc"),
    q: parseAsString.withDefault(""),
    status: parseAsString.withDefault(""),
});

export type OrdersSearchParams = ReturnType<typeof ordersSearchParamsCache.parse>;
