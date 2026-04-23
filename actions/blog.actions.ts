"use server";

import { getSupabaseServer, requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getBlogs(page: number = 1, limit: number = 5) {
  const supabase = await getSupabaseServer();
  const offset = (page - 1) * limit;

  // Fetch blogs with count
  const { data, error, count } = await supabase
    .from("blogs")
    .select("*", { count: "exact" })
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) console.error("Error fetching blogs:", error);

  const safeCount = count ?? 0;
  const safeTotalPages = Math.ceil(safeCount / limit) || 1;

  return {
    data: data || [],
    count: safeCount,
    totalPages: safeTotalPages,
    currentPage: page
  };
}

export async function getBlogById(id: string) {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getBlogBySlug(slug: string) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export async function adminGetAllBlogs() {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function createBlog(input: any) {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("blogs")
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  revalidatePath("/admin/blogs");
  revalidatePath("/blog");
  return data;
}

export async function updateBlog(id: string, input: any) {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("blogs")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin/blogs");
  revalidatePath(`/admin/blogs/${id}`);
  revalidatePath("/blog");
  revalidatePath(`/blog/${data.slug}`);
  return data;
}

export async function deleteBlog(id: string) {
  await requireAdmin();
  const supabase = await getSupabaseServer();

  const { error } = await supabase
    .from("blogs")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/blogs");
  revalidatePath("/blog");
  return { success: true };
}
