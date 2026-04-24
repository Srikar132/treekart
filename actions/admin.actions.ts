"use server";

import { unstable_cache } from "next/cache";
import { requireAdmin, getSupabaseServer } from "@/lib/auth";
import { revalidateTag } from "next/cache";
import { revalidatePath } from "next/cache";
import { Database, OrderStatus, PlanType, TreeStatus } from "@/types/database.types";

type UserRole = Database["public"]["Enums"]["user_role"];
type RentalStatus = Database["public"]["Enums"]["rental_status"];
type HeroSlideUpdate = Database["public"]["Tables"]["hero_slides"]["Update"];
type TestimonialUpdate = Database["public"]["Tables"]["testimonials"]["Update"];
type TreeUpdateInsert = Database["public"]["Tables"]["tree_updates"]["Insert"];



// ============================================
// DASHBOARD ACTIONS
// ============================================
export async function getAdminStats() {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  // Fetch in parallel
  const [
    { count: userCount },
    { count: treeCount },
    { count: orderCount },
    { data: orders },
    { data: rentals }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("trees").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders")
      .select("total_amount")
      .in("status", ["confirmed", "shipped", "delivered"]),
    supabase.from("rentals")
      .select("amount_paid")
      .in("status", ["active", "completed"])
  ]);

  const orderRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
  const rentalRevenue = rentals?.reduce((sum, rental) => sum + (rental.amount_paid || 0), 0) || 0;

  const totalRevenue = orderRevenue + rentalRevenue;

  return {
    users: userCount || 0,
    trees: treeCount || 0,
    orders: orderCount || 0,
    revenue: totalRevenue
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
  plan_type: PlanType | "";
}

export async function getTrees(params: GetTreesParams) {
  await requireAdmin();               // cookies() — fine, no cache wrapper
  const supabase = await getSupabaseServer(); // cookies() — fine

  let query = supabase.from("trees").select(`
    id, variety, price, status, plan_type, photos,
    age_years, is_verified, created_at,
    farmers ( farm_name, location )
  `, { count: "exact" });

  if (params.q) query = query.ilike("variety", `%${params.q}%`);
  if (params.status) query = query.eq("status", params.status);
  if (params.plan_type) query = query.eq("plan_type", params.plan_type);

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
}

export async function adminUpdateTreeStatus(id: string, status: TreeStatus) {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("trees").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/trees");
  revalidatePath(`/rent`);
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
    profiles!inner (full_name, phone),
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

  const { error } = await supabase
    .from("rentals")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/rentals");
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
    revalidatePath(`/rent/${input.tree_id}`);
    revalidatePath(`/admin/trees/${input.tree_id}/updates`);
  }
  if (input.rental_id) {
    revalidatePath(`/admin/rentals/${input.rental_id}/updates`);
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
      phone
    )
  `, { count: "exact" });

  if (params.q) {
    query = query.or(`full_name.ilike.%${params.q}%,phone.ilike.%${params.q}%`, { referencedTable: "profiles" });
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
  const { requireAdmin } = await import("@/lib/auth");
  await requireAdmin();

  const supabase = await getSupabaseServer();

  // 1. Fetch current status to prevent illegal transitions
  const { data: currentOrder } = await supabase
    .from("orders")
    .select("status")
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
        phone
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
export async function getHeroSlides() {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.from("hero_slides").select("*").order("order_index", { ascending: true });
  if (error) return [];
  return data;
}

export async function adminGetHeroSlides() {
  await requireAdmin();
  return getHeroSlides();
}

export async function adminUpdateHeroSlide(id: string, input: any) {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("hero_slides").update(input).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/content");
}

export async function adminCreateHeroSlide(input: any) {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("hero_slides").insert(input);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/content");
}

export async function adminDeleteHeroSlide(id: string) {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("hero_slides").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/content");
}

export async function getTestimonials() {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
  if (error) return [];
  return data;
}

export async function adminGetTestimonials() {
  await requireAdmin();
  return getTestimonials();
}

export async function adminUpdateTestimonial(id: string, input: any) {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("testimonials").update(input).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/content");
}

export async function adminCreateTestimonial(input: any) {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("testimonials").insert(input);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/content");
}

export async function adminDeleteTestimonial(id: string) {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/content");
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