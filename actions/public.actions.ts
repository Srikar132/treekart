"use server";

import { unstable_cache } from "next/cache";
import { getSupabasePublic } from "@/utils/supabase/public";
import { getAvailableTrees } from "./tree.actions";

// ===============================================
// PUBLIC CACHED CONTENT ENDPOINTS
// ===============================================

/**
 * Get hero slides using public Supabase instance and cached indefinitely 
 * until revalidated by an admin action via "hero_slides" tag.
 */
export const getCachedHeroSlides = unstable_cache(
  async () => {
    const supabase = getSupabasePublic();
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .order("order_index", { ascending: true });
    if (error) return [];
    return data;
  },
  ["public-hero-slides"],
  { tags: ["hero_slides"] }
);

/**
 * Get testimonials using public Supabase instance and cached indefinitely
 * until revalidated by an admin action via "testimonials" tag.
 */
export const getCachedTestimonials = unstable_cache(
  async () => {
    const supabase = getSupabasePublic();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return [];
    return data;
  },
  ["public-testimonials"],
  { tags: ["testimonials"] }
);

/**
 * Get active tree plans using public Supabase instance and cached indefinitely
 * until revalidated by an admin action via "tree_plans" tag.
 */
export const getCachedTreePlans = unstable_cache(
  async () => {
    const supabase = getSupabasePublic();
    const { data, error } = await supabase
      .from("tree_plans")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });
    
    if (error) return [];
    return data;
  },
  ["public-tree-plans"],
  { tags: ["tree_plans"] }
);

/**
 * Get featured available trees cached
 */
export const getCachedFeaturedAvailableTrees = unstable_cache(
  async () => {
    return getAvailableTrees({ filters: { status: ["available"] }, limit: 8 });
  },
  ["public-featured-available-trees"],
  { tags: ["trees"], revalidate: 3600 }
);

/**
 * Get featured rented trees cached
 */
export const getCachedFeaturedRentedTrees = unstable_cache(
  async () => {
    return getAvailableTrees({ filters: { status: ["rented"] }, limit: 8 });
  },
  ["public-featured-rented-trees"],
  { tags: ["trees"], revalidate: 3600 }
);
