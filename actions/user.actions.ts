"use server";

import { requireUser, requireAdmin, getSupabaseServer } from "@/lib/auth";
import { profileCompletionSchema, orderEmailSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

// ── PROFILE ────────────────────────────────────────────────────────

/**
 * Onboarding — run after a new user's first OTP verification.
 * Name is required; email is optional here (it is required later, at checkout).
 */
export async function completeProfile(input: { fullName: string; email?: string }) {
    const user = await requireUser();

    const parsed = profileCompletionSchema.safeParse(input);
    if (!parsed.success) {
        const f = parsed.error.flatten().fieldErrors;
        return { success: false as const, error: f.fullName?.[0] ?? f.email?.[0] ?? "Invalid input." };
    }

    const supabase = await getSupabaseServer();
    const email = parsed.data.email?.trim();

    // Upsert, not update: the on_auth_user_created trigger normally seeds the row,
    // but an UPDATE against a missing row silently affects zero rows and reports
    // success — trapping the user in an endless onboarding loop. Upsert guarantees
    // the name is written even if the row is somehow absent.
    const { error } = await supabase
        .from("profiles")
        .upsert(
            {
                id: user.id,
                full_name: parsed.data.fullName.trim(),
                // Only write email when one was actually given — skipping must leave it null.
                ...(email ? { email } : {}),
            },
            { onConflict: "id" }
        );

    if (error) return { success: false as const, error: error.message };

    revalidatePath("/", "layout");
    return { success: true as const };
}

/**
 * Capture the contact email at checkout, for users who skipped it at sign-up.
 * Writes the same profiles.email so it is never requested twice.
 */
export async function saveContactEmail(input: { email: string }) {
    const user = await requireUser();

    const parsed = orderEmailSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false as const,
            error: parsed.error.flatten().fieldErrors.email?.[0] ?? "Enter a valid email address.",
        };
    }

    const supabase = await getSupabaseServer();
    const { error } = await supabase
        .from("profiles")
        .update({ email: parsed.data.email.trim() })
        .eq("id", user.id);

    if (error) return { success: false as const, error: error.message };

    revalidatePath("/", "layout");
    return { success: true as const };
}



export async function updateProfile(input: {
    fullName?: string;
    avatarUrl?: string;
}) {
    const user = await requireUser();
    const supabase = await getSupabaseServer();

    // Phone is intentionally NOT updatable here. It is the auth identity in
    // auth.users; writing profiles.phone alone desyncs the two (getUser prefers
    // profiles.phone, so the UI would show a number the user can't log in with).
    // A phone change must go through Supabase Auth's phone-change flow.
    const { error } = await supabase
        .from("profiles")
        .update({
            full_name: input.fullName,
            avatar_url: input.avatarUrl,
        })
        .eq("id", user.id);

    if (error) throw new Error(error.message);
    revalidatePath("/account");
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
        plan_id,
        gps_lat,
        gps_lng,
        photos,
        yield_min_kg,
        yield_max_kg,
        farmers (
          farm_name,
          location
        ),
        tree_plans (
          name,
          badge_text,
          badge_color
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
        farmers ( farm_name, location, is_organic ),
        tree_plans ( name, badge_text, badge_color )
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
    revalidatePath("/account");
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