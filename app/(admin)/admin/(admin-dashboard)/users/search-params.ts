// app/admin/users/search-params.ts
import {
    createSearchParamsCache,
    parseAsInteger,
    parseAsString,
    parseAsStringEnum,
} from "nuqs/server";

export const usersSearchParamsCache = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    pageSize: parseAsInteger.withDefault(15),
    sort: parseAsString.withDefault("created_at"),
    order: parseAsStringEnum(["asc", "desc"] as const).withDefault("desc"),
    q: parseAsString.withDefault(""),
    role: parseAsString.withDefault(""),
});

export type UsersSearchParams = ReturnType<typeof usersSearchParamsCache.parse>;
