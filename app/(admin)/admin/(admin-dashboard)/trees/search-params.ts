// app/admin/trees/search-params.ts
import {
    createSearchParamsCache,
    parseAsInteger,
    parseAsString,
    parseAsStringEnum,
} from "nuqs/server";
import type { TreeStatus, PlanType } from "@/types/database.types";

export const treesSearchParamsCache = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    pageSize: parseAsInteger.withDefault(15),
    sort: parseAsString.withDefault("created_at"),
    order: parseAsStringEnum(["asc", "desc"] as const).withDefault("desc"),
    q: parseAsString.withDefault(""),
    status: parseAsStringEnum(["available", "rented", "inactive"] as const).withDefault("" as TreeStatus),
    plan_type: parseAsStringEnum(["basic", "standard", "max"] as const).withDefault("" as PlanType),
});

export type TreesSearchParams = ReturnType<typeof treesSearchParamsCache.parse>;