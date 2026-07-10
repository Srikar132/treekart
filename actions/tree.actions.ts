"use server";

import { getSupabaseServer, requireUser, requireAdmin } from "@/lib/auth";
import { Database, TreeInsert } from "@/types/database.types";
import Razorpay from "razorpay";
import crypto from "crypto";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { getSupabasePublic } from "@/utils/supabase/public";
import { sendRentalConfirmedEmail } from "@/lib/email";
import { getAppSettings } from "@/actions/admin.actions";
import { EmailRequiredError } from "@/lib/order-email-guard";
import { cache } from "react";


export type TreeSortOption = "newest" | "price_asc" | "price_desc" | "age_asc" | "age_desc";

export async function getTreePlans() {
    const supabase = getSupabasePublic();
    const { data, error } = await supabase
        .from("tree_plans")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

    if (error) return [];
    return data;
}

export interface GetTreesOptions {
    filters?: {
        planId?: string[];
        minPrice?: number;
        maxPrice?: number;
        minAge?: number;
        maxAge?: number;
        status?: Database["public"]["Enums"]["tree_status"][];
    };
    sort?: TreeSortOption;
    page?: number;
    limit?: number;
    excludeId?: string;
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
// ── PUBLIC ─────────────────────────────────────────────────────────

const _getAvailableTreesCached = unstable_cache(
    async (options?: GetTreesOptions) => {
        const supabase = await getSupabasePublic();

        let query = supabase
            .from("trees")
            .select(`
      *,
      farmers (
        id,
        farm_name,
        location,
        is_organic,
        profile_id
      ),
      tree_plans (
        id,
        name,
        badge_text,
        badge_color
      ),
      rentals (
        status,
        profiles (
          full_name,
          avatar_url
        )
      )
    `, { count: "exact" })
            .eq("is_verified", true);

        const statusFilter = options?.filters?.status || ["available"];
        query = query.in("status", statusFilter);

        if (options?.excludeId) {
            query = query.neq("id", options.excludeId);
        }

        if (options?.filters) {
            const { planId, minPrice, maxPrice, minAge, maxAge } = options.filters;
            if (planId && planId.length > 0) {
                query = query.in("plan_id", planId);
            }
            if (minPrice !== undefined) {
                query = query.gte("price", minPrice);
            }
            if (maxPrice !== undefined) {
                query = query.lte("price", maxPrice);
            }
            if (minAge !== undefined) {
                query = query.gte("age_years", minAge);
            }
            if (maxAge !== undefined) {
                query = query.lte("age_years", maxAge);
            }
        }

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
                case "age_asc":
                    query = query.order("age_years", { ascending: true });
                    break;
                case "age_desc":
                    query = query.order("age_years", { ascending: false });
                    break;
            }
        } else {
            query = query.order("source", { ascending: true }).order("created_at", { ascending: false });
        }

        const page = options?.page && options.page > 0 ? options.page : 1;
        const limit = options?.limit && options.limit > 0 ? options.limit : 10;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        query = query.range(from, to);

        const { data, error, count } = await query;
        if (error) throw new Error(error.message);

        return {
            trees: data,
            totalCount: count || 0,
            page,
            limit,
            totalPages: count ? Math.ceil(count / limit) : 0,
        };
    },
    ["available-trees"],
    { tags: ["trees"], revalidate: 3600 }
);

export async function getAvailableTrees(options?: GetTreesOptions) {
    return _getAvailableTreesCached(options);
}


// ── getTreeById ────────────────────────────────────────────────────
// Returns tree + farmer only. No rental data embedded.
const _getTreeByIdCached = unstable_cache(
    async (treeId: string) => {
        const supabase = await getSupabasePublic();

        const { data: tree, error } = await supabase
            .from("trees")
            .select(`
      *,
      farmers (
        id,
        farm_name,
        location,
        is_organic
      ),
      tree_plans (
        id,
        name,
        badge_text,
        badge_color
      )
    `)
            .eq("id", treeId)
            .single();

        if (error) throw new Error(error.message);
        return tree ?? null;
    },
    ["tree-by-id"],
    { tags: ["trees"], revalidate: 3600 }
);

export async function getTreeById(treeId: string) {
    return _getTreeByIdCached(treeId);
}

// ── getActiveRental ────────────────────────────────────────────────
// Public data — renter's name/avatar is shown to all visitors.
// Uses public client so cookies() is NOT called → route stays ISR-eligible.
const _getActiveRentalCached = unstable_cache(
    async (treeId: string) => {
        const supabase = getSupabasePublic();

        const { data, error } = await supabase
            .from("rentals")
            .select(`
      id,
      status,
      user_id,
      season,
      profiles (
        full_name,
        avatar_url
      )
    `)
            .eq("tree_id", treeId)
            .eq("status", "active")
            .limit(1)
            .maybeSingle();

        if (error) throw new Error(error.message);
        return data;
    },
    ["active-rental"],
    { tags: ["rentals"], revalidate: 300 }
);

// React.cache() deduplicates the two Suspense-boundary calls within the same render.
export const getActiveRental = cache(async (treeId: string) => {
    return _getActiveRentalCached(treeId);
});

// ── getTreeUpdates ─────────────────────────────────────────────────
// Scoped to a rental, not a tree. Old rentals' updates won't bleed.
const _getTreeUpdatesCached = unstable_cache(
    async (rentalId: string) => {
        const supabase = getSupabasePublic();

        const { data, error } = await supabase
            .from("tree_updates")
            .select("*")
            .eq("rental_id", rentalId)
            .order("posted_at", { ascending: false });

        if (error) throw new Error(error.message);
        return data ?? [];
    },
    ["tree-updates"],
    { tags: ["rentals"], revalidate: 300 }
);

export async function getTreeUpdates(rentalId: string) {
    return _getTreeUpdatesCached(rentalId);
}


// TREE RENTALS -- CHECKOUT
export async function reserveTree(treeId: string) {
    const user = await requireUser();
    const supabase = await getSupabaseServer();

    // Check tree is still available
    const { data: tree, error: fetchError } = await supabase
        .from("trees")
        .select("id, status, price, plan_id, yield_min_kg, yield_max_kg, variety")
        .eq("id", treeId)
        .single();

    if (fetchError || !tree) throw new Error("Tree not found");
    if (tree.status !== "available") throw new Error("Tree is no longer available");

    // Mark as reserved — 15 min TTL handled by pg_cron (see note below)
    const { error } = await supabase
        .from("trees")
        .update({ status: "inactive" }) // use inactive as "reserved"
        .eq("id", treeId)
        .eq("status", "available"); // atomic check — prevents race condition

    if (error) throw new Error("Failed to reserve tree");

    return tree;
}


export async function releaseTreeReservation(treeId: string) {
    const user = await requireUser();
    const supabase = await getSupabaseServer();

    // Delete the pending rental owned by this user — confirms ownership before releasing tree
    const { data: deleted } = await supabase
        .from("rentals")
        .delete()
        .eq("tree_id", treeId)
        .eq("user_id", user.id)
        .eq("status", "pending")
        .select("id");

    // Only release tree if we actually held the reservation
    if (deleted && deleted.length > 0) {
        await supabase
            .from("trees")
            .update({ status: "available" })
            .eq("id", treeId)
            .eq("status", "inactive");
    }
}

export async function createRentalOrder(input: {
    treeId: string;
    deliveryAddress: {
        name: string;
        phone: string;
        line1: string;
        city: string;
        state: string;
        pincode: string;
    };
    visitRequested: boolean;
}) {
    const user = await requireUser();

    // Server-side gate — never trust the checkout dialog. The tree is already
    // reserved by this point, so release it before rejecting or it stays locked.
    if (!user.email?.trim()) {
        await releaseTreeReservation(input.treeId);
        throw new EmailRequiredError();
    }

    const supabase = await getSupabaseServer();

    // Fetch tree price
    const { data: tree } = await supabase
        .from("trees")
        .select("price, plan_id, variety")
        .eq("id", input.treeId)
        .single();

    if (!tree) throw new Error("Tree not found");

    const settings = await getAppSettings();
    const rentalDeliveryFee = settings.rental_delivery_fee;
    const totalPaise = Math.round(((tree.price ?? 0) + rentalDeliveryFee) * 100);

    // Create Razorpay order
    const rzpOrder = await razorpay.orders.create({
        amount: totalPaise,
        currency: "INR",
        receipt: `rental_${Date.now()}`,
        notes: {
            tree_id: input.treeId,
            user_id: user.id,
            plan_id: tree.plan_id ?? "",
        },
    });

    // Compute season
    const now = new Date();
    const season =
        now.getMonth() >= 3
            ? `${now.getFullYear()}-${(now.getFullYear() + 1).toString().slice(2)}`
            : `${now.getFullYear() - 1}-${now.getFullYear().toString().slice(2)}`;

    // Insert pending rental — all delivery details stored here so verifyAndFulfilRental
    // doesn't need to receive them from the client (prevents tampering)
    const { data: rental, error: rentalInsertError } = await supabase
        .from("rentals")
        .insert({
            user_id: user.id,
            tree_id: input.treeId,
            season,
            status: "pending",
            payment_id: rzpOrder.id, // Razorpay ORDER id — replaced by payment id on fulfilment
            amount_paid: (tree.price ?? 0) + rentalDeliveryFee,
            delivery_address: input.deliveryAddress,
            visit_requested: input.visitRequested,
        })
        .select("id")
        .single();

    if (rentalInsertError) throw new Error("Failed to create pending rental: " + rentalInsertError.message);

    return {
        rentalId: rental.id,
        rzpOrderId: rzpOrder.id,
        amount: totalPaise,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID!,
        rentalDeliveryFee,
    };
}


export async function verifyAndFulfilRental(payload: {
    rentalId: string;
    rzpOrderId: string;
    rzpPaymentId: string;
    rzpSignature: string;
}) {
    const user = await requireUser();
    const supabase = await getSupabaseServer();

    // 1. Look up the pending rental with ownership check
    const { data: rental, error: fetchError } = await supabase
        .from("rentals")
        .select("id, status, tree_id, amount_paid, season")
        .eq("id", payload.rentalId)
        .eq("user_id", user.id)
        .single();

    if (fetchError || !rental) throw new Error("Rental not found");

    // 2. Idempotency — webhook may have already fulfilled this
    if (rental.status === "active") return { success: true, rentalId: rental.id };
    if (rental.status !== "pending") throw new Error("Rental in unexpected state: " + rental.status);

    // 3. Verify HMAC signature
    const expectedSig = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(`${payload.rzpOrderId}|${payload.rzpPaymentId}`)
        .digest("hex");

    if (expectedSig !== payload.rzpSignature) {
        await releaseTreeReservation(rental.tree_id!);
        throw new Error("Payment verification failed");
    }

    // 4. Compute reservation expiry — end of May next year (mango season)
    const reservedUntil = new Date();
    reservedUntil.setFullYear(reservedUntil.getFullYear() + 1);
    reservedUntil.setMonth(4); // May (0-indexed)
    reservedUntil.setDate(31);
    reservedUntil.setHours(23, 59, 59, 999);

    // 5. Atomic fulfilment: activate rental + mark tree rented in one transaction
    const { error: rpcError } = await supabase.rpc("fulfil_rental", {
        p_rental_id: rental.id,
        p_rzp_payment_id: payload.rzpPaymentId,
        p_tree_id: rental.tree_id!,
        p_reserved_until: reservedUntil.toISOString(),
    });

    if (rpcError) throw new Error("Failed to finalise rental: " + rpcError.message);

    // 6. Fetch tree variety for email (non-critical, best-effort)
    const { data: tree } = await supabase
        .from("trees")
        .select("variety")
        .eq("id", rental.tree_id!)
        .single();

    revalidatePath("/account");
    revalidatePath("/rent");
    revalidateTag("trees", "max");
    revalidateTag("rentals", "max");

    sendRentalConfirmedEmail(
        user.email!,
        user.full_name || "Valued Customer",
        rental.id,
        tree?.variety || "Mango Tree",
        rental.amount_paid,
        rental.season ?? ""
    ).catch((err) => console.error("[Rental Email] Failed to send confirmation:", err));

    return { success: true, rentalId: rental.id };
}


// ── ADMIN - TREE MUTATIONS ──────────────────────────────────────────────────────────
export async function createTree(input: TreeInsert) {
    await requireAdmin();
    const supabase = await getSupabaseServer();

    const { data, error } = await supabase
        .from("trees")
        .insert(input)
        .select()
        .single();

    if (error) throw new Error(error.message);

    revalidatePath("/rent", "page");
    revalidatePath("/admin/trees", "page");
    revalidateTag("trees", "max");

    return data;
}

export async function updateTree(id: string, input: Database["public"]["Tables"]["trees"]["Update"]) {
    await requireAdmin();
    const supabase = await getSupabaseServer();

    // ── Protection Layer: block premature "available" transition ────────────
    if (input.status === "available") {
        const { data: current, error: fetchErr } = await supabase
            .from("trees")
            .select("status, reserved_until")
            .eq("id", id)
            .single();

        if (fetchErr) throw new Error(fetchErr.message);

        if (current?.status === "rented" && current.reserved_until) {
            const expiry = new Date(current.reserved_until);
            if (expiry > new Date()) {
                const formatted = expiry.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                });
                throw new Error(
                    `Cannot mark tree as Available — it is reserved until ${formatted}. The rental period must expire first.`
                );
            }
        }
    }
    // ─────────────────────────────────────────────────────────────────────────

    const { data, error } = await supabase
        .from("trees")
        .update(input)
        .eq("id", id)
        .select()
        .single();

    if (error) throw new Error(error.message);

    revalidatePath("/rent", "page");
    revalidatePath(`/trees/${id}`, "page");
    revalidatePath("/admin/trees", "page");
    revalidatePath(`/admin/trees/${id}`, "page");
    revalidateTag("trees", "max");

    return data;
}