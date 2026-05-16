"use server";

import { requireAdmin, getSupabaseServer } from "@/lib/auth";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { cache } from "react";
import { getSupabasePublic } from "@/utils/supabase/public";
import { Database, OrderStatus, PlanType, TreeStatus } from "@/types/database.types";
import {
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendRentalStatusUpdateEmail,
  sendTreeUpdatePostedEmail,
} from "@/lib/email";

type UserRole = Database["public"]["Enums"]["user_role"];
type RentalStatus = Database["public"]["Enums"]["rental_status"];
type TreeUpdateInsert = Database["public"]["Tables"]["tree_updates"]["Insert"];



// ============================================
// DASHBOARD ACTIONS
// ============================================
export async function getAdminStats() {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase.rpc("get_admin_stats");
  if (error) throw new Error(error.message);

  return {
    users: data.users,
    trees: data.trees,
    orders: data.orders,
    revenue: data.order_revenue + data.rental_revenue,
  };
}

export async function getRecentActivity() {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      profiles (full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: rentals } = await supabase
    .from("rentals")
    .select(`
      *,
      profiles (full_name),
      trees (variety)
    `)
    .order("rented_at", { ascending: false })
    .limit(5);

  return {
    recentOrders: orders || [],
    recentRentals: rentals || []
  };
}


// ===========================================
// TREE ACTIONS
// ===========================================
interface GetTreesParams {
  page: number;
  pageSize: number;
  sort: string;
  order: "asc" | "desc";
  q: string;
  status: TreeStatus | "";
  plan_id: string | "";
}

export async function getTrees(params: GetTreesParams) {
  await requireAdmin();               // cookies() — fine, no cache wrapper
  const supabase = await getSupabaseServer(); // cookies() — fine

  let query = supabase.from("trees").select(`
    id, variety, price, status, plan_id, photos,
    age_years, is_verified, created_at,
    farmers ( farm_name, location ),
    tree_plans ( name, badge_text, badge_color )
  `, { count: "exact" });

  if (params.q) query = query.ilike("variety", `%${params.q}%`);
  if (params.status) query = query.eq("status", params.status);
  if (params.plan_id) query = query.eq("plan_id", params.plan_id);

  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  const { data, count, error } = await query
    .order(params.sort, { ascending: params.order === "asc" })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { data: data ?? [], count: count ?? 0 };
}

export async function adminDeleteTree(id: string) {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("trees").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/trees");
  revalidateTag("trees", "max");
}

export async function adminUpdateTreeStatus(id: string, status: TreeStatus) {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  // ── Protection Layer: block premature "available" transition ────────────
  if (status === "available") {
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

  const { error } = await supabase.from("trees").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/trees");
  revalidatePath(`/rent`);
  revalidateTag("trees", "max");
}


// =============================================
// RENTALS ACTIONS
// =============================================

export async function getRentals(params: {
  page: number;
  pageSize: number;
  sort: string;
  order: "asc" | "desc";
  q?: string;
  status?: RentalStatus;
  season?: string;
}) {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  let query = supabase.from("rentals").select(`
    *,
    profiles!inner (full_name, phone, email),
    trees (
      variety,
      farmers (location)
    )
  `, { count: "exact" });

  if (params.q) {
    query = query.or(`full_name.ilike.%${params.q}%,phone.ilike.%${params.q}%`, { referencedTable: "profiles" });
  }
  if (params.status) query = query.eq("status", params.status);
  if (params.season) query = query.eq("season", params.season);

  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  const { data, count, error } = await query
    .order(params.sort, { ascending: params.order === "asc" })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { data: data ?? [], count: count ?? 0 };
}

export async function adminUpdateRentalStatus(id: string, status: RentalStatus) {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  // 1. Fetch rental with renter profile and tree info
  const { data: rental, error: fetchErr } = await supabase
    .from("rentals")
    .select(`
      tree_id,
      status,
      profiles (full_name, email),
      trees (variety)
    `)
    .eq("id", id)
    .single();

  if (fetchErr) throw new Error(fetchErr.message);

  // 2. If cancelling, clear tree reservation
  if (status === "cancelled" && rental?.tree_id) {
    await supabase
      .from("trees")
      .update({
        status: "available",
        reserved_until: null
      })
      .eq("id", rental.tree_id);
  }

  const { error } = await supabase
    .from("rentals")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/rentals");
  revalidatePath("/admin/trees");
  revalidateTag("trees", "max");

  // 3. Send email for completed/cancelled transitions
  if (status === "completed" || status === "cancelled") {
    const profile = rental?.profiles as any;
    const tree = rental?.trees as any;
    if (profile?.email) {
      sendRentalStatusUpdateEmail(
        profile.email,
        profile.full_name || "Valued Customer",
        id,
        tree?.variety || "Mango Tree",
        status
      ).catch((err) => console.error("[Rental Status Email] Failed:", err));
    }
  }
}

export async function adminDeleteRental(id: string) {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  const { error } = await supabase
    .from("rentals")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/rentals");
}

export async function adminGetRentalById(id: string) {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("rentals")
    .select(`
      *,
      profiles (full_name, phone),
      trees (id, variety, farmers (location))
    `)
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ============================================
// TREE UPDATE ACTIONS
// ============================================
export async function adminCreateTreeUpdate(input: TreeUpdateInsert) {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.from("tree_updates").insert(input).select().single();
  if (error) throw new Error(error.message);

  if (input.tree_id) {
    revalidatePath(`/trees/${input.tree_id}`, "page");
    revalidatePath(`/admin/trees/${input.tree_id}/updates`, "page");
  }
  if (input.rental_id) {
    revalidatePath(`/admin/rentals/${input.rental_id}/updates`, "page");

    // Email the renter about the new tree update
    const { data: rental } = await supabase
      .from("rentals")
      .select(`
        profiles (full_name, email),
        trees (variety)
      `)
      .eq("id", input.rental_id)
      .single();

    const profile = (rental?.profiles) as any;
    const tree = (rental?.trees) as any;
    if (profile?.email && input.title) {
      sendTreeUpdatePostedEmail(
        profile.email,
        profile.full_name || "Valued Customer",
        tree?.variety || "Mango Tree",
        input.title,
        input.description || null,
        input.rental_id
      ).catch((err) => console.error("[Tree Update Email] Failed:", err));
    }
  }

  return data;
}
export async function adminDeleteTreeUpdate(id: string, rentalId?: string) {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("tree_updates").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (rentalId) {
    revalidatePath(`/admin/rentals/${rentalId}/updates`);
  }
}


// =============================================
// PRODUCT ACTIONS 
// =============================================


// written inside product.actions.ts



// ===============================================
// ORDER ACTIONS
// ===============================================


export async function getAdminOrders(params: {
  page: number;
  pageSize: number;
  sort: string;
  order: "asc" | "desc";
  q?: string;
  status?: string;
}) {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  let query = supabase.from("orders").select(`
    *,
    profiles (
      full_name,
      phone,
      email
    )
  `, { count: "exact" });

  if (params.q) {
    query = query.or(`full_name.ilike.%${params.q}%,phone.ilike.%${params.q}%,email.ilike.%${params.q}%`, { referencedTable: "profiles" });
  }

  if (params.status) query = query.eq("status", params.status as OrderStatus);

  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  const { data, count, error } = await query
    .order(params.sort, { ascending: params.order === "asc" })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { data: data ?? [], count: count ?? 0 };
}

const STATUS_RANK = {
  pending: 0,
  confirmed: 1,
  shipped: 2,
  delivered: 3,
};

export async function adminUpdateOrderStatus(
  orderId: string,
  status: OrderStatus,
  trackingId?: string
) {

  await requireAdmin();

  const supabase = await getSupabaseServer();

  // 1. Fetch current status and user info to send emails
  const { data: currentOrder } = await supabase
    .from("orders")
    .select(`
      status,
      total_amount,
      profiles (
        full_name,
        email
      )
    `)
    .eq("id", orderId)
    .single();

  if (!currentOrder) throw new Error("Order not found");

  // 2. Enforce forward-only status updates
  const currentRank = STATUS_RANK[currentOrder.status as keyof typeof STATUS_RANK] ?? 0;
  const newRank = STATUS_RANK[status as keyof typeof STATUS_RANK] ?? 0;

  if (newRank < currentRank) {
    throw new Error(`Invalid transition: Cannot move order from ${currentOrder.status} back to ${status}`);
  }

  // 3. Perform the update
  const { error } = await supabase
    .from("orders")
    .update({
      status,
      tracking_id: trackingId || "",
    })
    .eq("id", orderId);

  if (error) throw new Error(error.message);

  // 4. Trigger Email Notifications
  const profile = currentOrder.profiles as any;
  if (profile?.email) {
    try {
      if (status === "shipped") {
        await sendOrderShippedEmail(profile.email, profile.full_name || "Valued Customer", orderId, trackingId);
      } else if (status === "delivered") {
        await sendOrderDeliveredEmail(profile.email, profile.full_name || "Valued Customer", orderId);
      }
    } catch (emailErr) {
      console.error("[AdminAction] Failed to send status update email:", emailErr);
      // We don't throw here to avoid rolling back the DB update if only the email fails
    }
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/dashboard");
}

export async function adminGetOrderById(id: string) {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      profiles (
        full_name,
        phone,
        email
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeleteOrder(id: string) {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
}

// =============================================
// BLOG ACTIONS
// ==============================================
export async function getAdminBlogs(params: {
  page: number;
  pageSize: number;
  sort: string;
  order: "asc" | "desc";
  q?: string;
  category?: string;
}) {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  let query = supabase.from("blogs").select("*", { count: "exact" });

  if (params.q) {
    query = query.ilike("title", `%${params.q}%`);
  }

  if (params.category) query = query.eq("category", params.category);

  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  const { data, count, error } = await query
    .order(params.sort, { ascending: params.order === "asc" })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { data: data ?? [], count: count ?? 0 };
}

export async function adminDeleteBlog(id: string) {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  const { error } = await supabase.from("blogs").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/blogs");
  revalidatePath("/blog");
}






// ===============================================
// CONTENT MANAGEMENT ACTIONS (HERO, TESTIMONIALS)
// ===============================================
export async function adminGetHeroSlides() {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.from("hero_slides").select("*").order("order_index", { ascending: true });
  if (error) return [];
  return data;
}

export async function adminUpdateHeroSlide(id: string, input: any) {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("hero_slides").update(input).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/content");
  revalidateTag("hero_slides", "max");
}

export async function adminCreateHeroSlide(input: any) {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("hero_slides").insert(input);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/content");
  revalidateTag("hero_slides", "max");
}

export async function adminDeleteHeroSlide(id: string) {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("hero_slides").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/content");
  revalidateTag("hero_slides", "max");
}

export async function adminUpdateHeroSlidesOrder(slides: { id: string; order_index: number }[]) {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  // Perform updates sequentially to ensure order_index integrity
  const updates = slides.map(s =>
    supabase.from("hero_slides").update({ order_index: s.order_index }).eq("id", s.id)
  );

  const results = await Promise.all(updates);
  const errors = results.filter(r => r.error);

  if (errors.length > 0) throw new Error("Some slides failed to update order");

  revalidatePath("/");
  revalidatePath("/admin/content");
  revalidateTag("hero_slides", "max");
}

export async function adminGetTestimonials() {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
  if (error) return [];
  return data;
}

export async function adminUpdateTestimonial(id: string, input: any) {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("testimonials").update(input).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/content");
  revalidateTag("testimonials", "max");
}

export async function adminCreateTestimonial(input: any) {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("testimonials").insert(input);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/content");
  revalidateTag("testimonials", "max");
}

// ============================================
// APP SETTINGS
// ============================================

const DEFAULT_SETTINGS = {
  store_delivery_fee: 99,
  store_free_delivery_threshold: 999,
  rental_delivery_fee: 0,
};

const _getCachedSettings = unstable_cache(
  async () => {
    const supabase = getSupabasePublic();
    const { data } = await supabase
      .from("app_settings")
      .select("store_delivery_fee, store_free_delivery_threshold, rental_delivery_fee")
      .eq("id", 1)
      .single();
    return (data as typeof DEFAULT_SETTINGS | null) ?? DEFAULT_SETTINGS;
  },
  ["app-settings"],
  { tags: ["app-settings"], revalidate: 3600 }
);

export const getAppSettings = cache(_getCachedSettings);

export async function adminUpdateDeliverySettings(input: {
  store_delivery_fee: number;
  store_free_delivery_threshold: number;
  rental_delivery_fee: number;
}) {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  const { error } = await supabase
    .from("app_settings")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) throw new Error(error.message);

  revalidateTag("app-settings", "max");
  revalidatePath("/admin/settings");
}

// ==============================================


export async function adminDeleteTestimonial(id: string) {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/content");
  revalidateTag("testimonials", "max");
}

export async function adminGetTreePlans() {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.from("tree_plans").select("*").order("created_at", { ascending: true });
  if (error) return [];
  return data;
}

export async function adminCreateTreePlan(input: any) {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("tree_plans").insert(input);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/content");
  revalidatePath("/store");
  revalidateTag("tree_plans", "max");
}

export async function adminUpdateTreePlan(id: string, input: any) {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("tree_plans").update(input).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/content");
  revalidatePath("/store");
  revalidateTag("tree_plans", "max");
}

export async function adminDeleteTreePlan(id: string) {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("tree_plans").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/content");
  revalidatePath("/store");
  revalidateTag("tree_plans", "max");
}



// =======================================================
// FARMER ACTIONS
// =======================================================
export async function adminGetAllFarmers() {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("farmers")
    .select("id, farm_name, location")
    .eq("status", "approved");
  if (error) throw new Error(error.message);
  return data;
}


// =============================================
// USERS ACTIONS
// =============================================
export async function getAdminUsers(params: {
  page: number;
  pageSize: number;
  sort: string;
  order: "asc" | "desc";
  q?: string;
  role?: string;
}) {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  let query = supabase.from("profiles").select("*", { count: "exact" });

  if (params.q) {
    query = query.or(`full_name.ilike.%${params.q}%,phone.ilike.%${params.q}%`);
  }

  if (params.role) query = query.eq("role", params.role as UserRole);

  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  const { data, count, error } = await query
    .order(params.sort, { ascending: params.order === "asc" })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { data: data ?? [], count: count ?? 0 };
}