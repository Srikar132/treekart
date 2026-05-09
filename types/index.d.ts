import { Farmer, Tree } from "./database.types";


export type TreeListItem = Pick<
    Tree,
    | "id" | "variety" | "price" | "plan_type" | "age_years"
    | "yield_min_kg" | "yield_max_kg" | "photos" | "source"
    | "status" | "created_at" | "description"
> & {
    farmers: Pick<Farmer, "id" | "farm_name" | "location" | "is_organic"> | null;
};