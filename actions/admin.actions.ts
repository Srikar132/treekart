"use server";

import { requireAdmin, getSupabaseServer } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Database } from "@/types/database.types";

type UserRole = Database["public"]["Enums"]["user_role"];
type RentalStatus = Database["public"]["Enums"]["rental_status"];
type HeroSlideUpdate = Database["public"]["Tables"]["hero_slides"]["Update"];
type TestimonialUpdate = Database["public"]["Tables"]["testimonials"]["Update"];
type TreeUpdateInsert = Database["public"]["Tables"]["tree_updates"]["Insert"];

export async function getAdminStats() {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  // Fetch in parallel
  const [
    { count: userCount },
    { count: treeCount },
    { count: orderCount },
    { data: orders }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("trees").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total_amount").eq("status", "confirmed")
  ]);

  const revenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

  return {
    users: userCount || 0,
    trees: treeCount || 0,
    orders: orderCount || 0,
    revenue: revenue
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
export async function adminGetAllUsers() {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function adminUpdateUserRole(id: string, role: UserRole) {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}

export async function adminGetAllRentals() {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("rentals")
    .select(`
      *,
      profiles (full_name , phone),
      trees (variety)
    `)
    .order("rented_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
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

export async function adminGetHeroSlides() {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.from("hero_slides").select("*").order("order_index", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function adminUpdateHeroSlide(id: string, input: HeroSlideUpdate) {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("hero_slides").update(input).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/content");
}

export async function adminGetTestimonials() {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function adminUpdateTestimonial(id: string, input: TestimonialUpdate) {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("testimonials").update(input).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/content");
}

export async function adminCreateTreeUpdate(input: TreeUpdateInsert) {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.from("tree_updates").insert(input).select().single();
  if (error) throw new Error(error.message);

  if (input.tree_id) {
    revalidatePath(`/rent/${input.tree_id}`);
  }

  return data;
}

export async function adminDeleteTreeUpdate(id: string) {
  await requireAdmin();
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("tree_updates").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
