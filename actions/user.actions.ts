"use server";

import { requireUser, requireAdmin, getSupabaseServer } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ── PROFILE ────────────────────────────────────────────────────────



export async function updateProfile(input: {
    fullName?: string;
    phone?: string;
    avatarUrl?: string;
}) {
    const user = await requireUser();
    const supabase = await getSupabaseServer();

    const { error } = await supabase
        .from("profiles")
        .update({
            full_name: input.fullName,
            phone: input.phone,
            avatar_url: input.avatarUrl,
        })
        .eq("id", user.id);

    if (error) throw new Error(error.message);
    revalidatePath("/dashboard/profile");
}


// ── RENTALS ────────────────────────────────────────────────────────

export async function getMyRentals() {
    const user = await requireUser();
    const supabase = await getSupabaseServer();

    const { data, error } = await supabase
        .from("rentals")
        .select(`
      *,
      trees (
        id,
        variety,
        plan_type,
        gps_lat,
        gps_lng,
        photos,
        yield_min_kg,
        yield_max_kg,
        farmers (
          farm_name,
          location
        )
      )
    `)
        .eq("user_id", user.id)
        .order("rented_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
}

export async function getMyRentalById(rentalId: string) {
    const user = await requireUser();
    const supabase = await getSupabaseServer();

    const { data, error } = await supabase
        .from("rentals")
        .select(`
      *,
      trees (
        *,
        farmers ( farm_name, location, is_organic )
      ),
      tree_updates (
        id,
        title,
        description,
        video_url,
        photos,
        posted_at
      )
    `)
        .eq("id", rentalId)
        .eq("user_id", user.id) // user can only see their own rentals
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function confirmDelivery(rentalId: string) {
    const user = await requireUser();
    const supabase = await getSupabaseServer();

    const { error } = await supabase
        .from("rentals")
        .update({ status: "completed" })
        .eq("id", rentalId)
        .eq("user_id", user.id); // can only confirm own rental

    if (error) throw new Error(error.message);
    revalidatePath(`/dashboard/my-tree/${rentalId}`);
    revalidatePath("/dashboard");
}

// ── FARMER REGISTRATION ────────────────────────────────────────────

export async function registerAsFarmer(input: {
    farmName: string;
    location: string;
    farmSizeAcres: number;
    isOrganic: boolean;
    documents: string[]; // Cloudinary URLs
}) {
    const user = await requireUser();
    const supabase = await getSupabaseServer();

    // Check not already registered
    const { data: existing } = await supabase
        .from("farmers")
        .select("id, status")
        .eq("profile_id", user.id)
        .single();

    if (existing) {
        if (existing.status === "pending")
            throw new Error("Your application is already under review");
        if (existing.status === "approved")
            throw new Error("You are already a registered farmer");
    }

    const { error } = await supabase.from("farmers").insert({
        profile_id: user.id,
        farm_name: input.farmName,
        location: input.location,
        farm_size_acres: input.farmSizeAcres,
        is_organic: input.isOrganic,
        documents: input.documents as any,
        status: "pending",
        commission_pct: 15, // default 15%, admin can adjust
    });

    if (error) throw new Error(error.message);
    revalidatePath("/farmer");
}

// ── CUSTOM PLAN LEAD ───────────────────────────────────────────────

export async function submitCustomPlanLead(input: {
    name: string;
    email: string;
    phone: string;
    treeCount: number;
    message: string;
}) {
    const supabase = await getSupabaseServer();

    const { error } = await supabase.from("custom_plan_leads").insert({
        name: input.name,
        email: input.email,
        phone: input.phone,
        tree_count: input.treeCount,
        message: input.message,
        status: "new",
    });

    if (error) throw new Error(error.message);
}

// ── ADMIN ──────────────────────────────────────────────────────────

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

export async function adminApproveFarmer(
    farmerId: string,
    commissionPct?: number
) {
    await requireAdmin();
    const supabase = await getSupabaseServer();

    // Approve farmer record
    const { data: farmer, error } = await supabase
        .from("farmers")
        .update({
            status: "approved",
            rejection_reason: null,
            ...(commissionPct ? { commission_pct: commissionPct } : {}),
        })
        .eq("id", farmerId)
        .select("profile_id")
        .single();

    if (error) throw new Error(error.message);

    // Upgrade profile role to farmer
    if (farmer?.profile_id) {
        await supabase
            .from("profiles")
            .update({ role: "farmer" })
            .eq("id", farmer.profile_id);
    }

    revalidatePath("/admin/farmers");
}

export async function adminRejectFarmer(
    farmerId: string,
    reason: string
) {
    await requireAdmin();
    const supabase = await getSupabaseServer();

    const { data: farmer, error } = await supabase
        .from("farmers")
        .update({
            status: "rejected",
            rejection_reason: reason,
        })
        .eq("id", farmerId)
        .select("profile_id")
        .single();

    if (error) throw new Error(error.message);

    // Revert role back to user if it was upgraded
    if (farmer?.profile_id) {
        await supabase
            .from("profiles")
            .update({ role: "user" })
            .eq("id", farmer.profile_id);
    }

    revalidatePath("/admin/farmers");
}

export async function adminUpdateLeadStatus(
    leadId: string,
    status: "new" | "contacted" | "quoted" | "closed",
    adminNotes?: string
) {
    await requireAdmin();
    const supabase = await getSupabaseServer();

    const { error } = await supabase
        .from("custom_plan_leads")
        .update({
            status,
            ...(adminNotes ? { admin_notes: adminNotes } : {}),
        })
        .eq("id", leadId);

    if (error) throw new Error(error.message);
    revalidatePath("/admin/custom-plans");
}