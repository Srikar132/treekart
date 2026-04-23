// app/(admin)/admin/rentals/search-params.ts
import {
    createSearchParamsCache,
    parseAsInteger,
    parseAsString,
    parseAsStringEnum,
} from "nuqs/server";
import type { RentalStatus } from "@/types/database.types";

export const rentalsSearchParamsCache = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    pageSize: parseAsInteger.withDefault(15),
    sort: parseAsString.withDefault("rented_at"),
    order: parseAsStringEnum(["asc", "desc"] as const).withDefault("desc"),
    q: parseAsString.withDefault(""),
    status: parseAsStringEnum(["active", "completed", "cancelled"] as const).withDefault("" as RentalStatus),
    season: parseAsString.withDefault(""),
});

export type RentalsParams = ReturnType<typeof rentalsSearchParamsCache.parse>;
