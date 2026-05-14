"use server";

import { getSupabaseServer, requireUser, requireAdmin } from "@/lib/auth";
import { Database, TreeInsert } from "@/types/database.types";
import Razorpay from "razorpay";
import crypto from "crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { getSupabasePublic } from "@/utils/supabase/public";
import { sendRentalConfirmedEmail } from "@/lib/email";


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

export async function getAvailableTrees(options?: GetTreesOptions) {
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

    // Apply filters
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
            case "age_asc":
                query = query.order("age_years", { ascending: true });
                break;
            case "age_desc":
                query = query.order("age_years", { ascending: false });
                break;
        }
    } else {
        // Default sort
        query = query.order("source", { ascending: true }).order("created_at", { ascending: false });
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
        trees: data,
        totalCount: count || 0,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0,
    };
}


// ── getTreeById ────────────────────────────────────────────────────
// Returns tree + farmer only. No rental data embedded.
export async function getTreeById(treeId: string) {
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
}

// ── getActiveRental ────────────────────────────────────────────────
// Only call this when tree.status === "rented".
// Returns the single active rental with the renter's profile.
export async function getActiveRental(treeId: string) {
    const supabase = await getSupabaseServer();

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
    return data; // null if somehow no active rental despite status
}

// ── getTreeUpdates ─────────────────────────────────────────────────
// Scoped to a rental, not a tree. Old rentals' updates won't bleed.
export async function getTreeUpdates(rentalId: string) {
    const supabase = await getSupabasePublic();

    const { data, error } = await supabase
        .from("tree_updates")
        .select("*")
        .eq("rental_id", rentalId)
        .order("posted_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
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
    const supabase = await getSupabaseServer();
    await supabase
        .from("trees")
        .update({ status: "available" })
        .eq("id", treeId)
        .eq("status", "inactive");
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
    const supabase = await getSupabaseServer();

    // Fetch tree price
    const { data: tree } = await supabase
        .from("trees")
        .select("price, plan_id, variety")
        .eq("id", input.treeId)
        .single();

    if (!tree) throw new Error("Tree not found");

    const totalPaise = Math.round((tree.price ?? 0) * 100);

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

    return {
        rzpOrderId: rzpOrder.id,
        amount: totalPaise,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID!,
        treeDetails: tree,
        deliveryAddress: input.deliveryAddress,
        visitRequested: input.visitRequested,
    };
}


export async function verifyAndFulfilRental(payload: {
    treeId: string;
    rzpOrderId: string;
    rzpPaymentId: string;
    rzpSignature: string;
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
    const supabase = await getSupabaseServer();

    // DEBUG: Verify session identity
    // const { data: { user: authUser } } = await supabase.auth.getUser();
    // console.log("Log: Supabase sees Auth ID:", authUser?.id);
    // console.log("Log: Code is sending User ID:", user.id);

    // Verify HMAC signature
    const body = `${payload.rzpOrderId}|${payload.rzpPaymentId}`;
    const expectedSig = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(body)
        .digest("hex");

    if (expectedSig !== payload.rzpSignature) {
        await releaseTreeReservation(payload.treeId);
        throw new Error("Payment verification failed");
    }

    // Get current season
    const now = new Date();
    const season =
        now.getMonth() >= 3
            ? `${now.getFullYear()}-${(now.getFullYear() + 1).toString().slice(2)}`
            : `${now.getFullYear() - 1}-${now.getFullYear().toString().slice(2)}`;

    // Fetch tree details for the final record
    const { data: tree } = await supabase
        .from("trees")
        .select("price, variety")
        .eq("id", payload.treeId)
        .single();

    if (!tree) throw new Error("Tree details not found for finalization");

    // Compute the reservation expiry — 1 year from today (end of mango season: May 31 of next year)
    const rentalStart = new Date();
    const reservedUntil = new Date(rentalStart);
    reservedUntil.setFullYear(reservedUntil.getFullYear() + 1);
    // Always expire at end of May to align with mango season
    reservedUntil.setMonth(4); // May (0-indexed)
    reservedUntil.setDate(31);
    reservedUntil.setHours(23, 59, 59, 999);

    // IMPORTANT: rentals.user_id must exactly equal auth.uid() (UUID)
    const { data: rental, error: rentalError } = await supabase
        .from("rentals")
        .insert({
            user_id: user.id, // must be UUID
            tree_id: payload.treeId,
            season,
            status: "active",
            payment_id: payload.rzpPaymentId,
            amount_paid: tree.price, // keep as-is; type should match column type
            delivery_address: payload.deliveryAddress, // remove `as any`
            visit_requested: payload.visitRequested,
        })
        .select()
        .single();

    if (rentalError) {
        console.log(rentalError);
        throw new Error("Failed to create rental: " + rentalError.message);
    }

    const { error: treeUpdateError } = await supabase
        .from("trees")
        .update({ status: "rented", reserved_until: reservedUntil.toISOString() })
        .eq("id", payload.treeId);

    if (treeUpdateError) {
        console.error("CRITICAL: Failed to update tree status to rented:", treeUpdateError);
    }

    revalidatePath("/account");
    revalidatePath("/rent");
    revalidateTag("trees", "max");

    // Send confirmation email — non-blocking so payment success is never blocked by email failure
    sendRentalConfirmedEmail(
        user.email!,
        user.full_name || "Valued Customer",
        rental.id,
        tree.variety || "Mango Tree",
        tree.price ?? 0,
        season
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