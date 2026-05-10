// app/admin/blogs/search-params.ts
import {
    createSearchParamsCache,
    parseAsInteger,
    parseAsString,
    parseAsStringEnum,
} from "nuqs/server";

export const blogsSearchParamsCache = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    pageSize: parseAsInteger.withDefault(5),
    sort: parseAsString.withDefault("published_at"),
    order: parseAsStringEnum(["asc", "desc"] as const).withDefault("desc"),
    q: parseAsString.withDefault(""),
    category: parseAsString.withDefault(""),
});

export type BlogsSearchParams = ReturnType<typeof blogsSearchParamsCache.parse>;
