"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getSupabaseServer() {
    const cookieStore = await cookies();
    return createClient(cookieStore);
}


export async function getUser() {
    const supabase = await getSupabaseServer();

    // Step 1 — get auth session (fast, from cookie)
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    // Step 2 — get role + profile fields.
    // `email` is an optional receipts-only contact field, never an auth identity.
    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role, avatar_url, phone, email")
        .eq("id", user.id)
        .single();

    if (!profile) return null;

    // Merge auth user + profile — single object used everywhere.
    return {
        id: user.id,
        created_at: user.created_at,
        updated_at: user.updated_at,
        ...profile,
        // Phone is the canonical identity; fall back to auth.users.phone.
        phone: profile.phone ?? user.phone ?? null,
    };
}

export type AuthUser = NonNullable<Awaited<ReturnType<typeof getUser>>>;

// ── Guards ─────────────────────────────────────────────────────────

export async function requireUser() {
    const user = await getUser();
    if (!user) redirect("/auth/signin");
    return user;
}

export async function requireAdmin() {
    const user = await getUser();
    if (!user) redirect("/admin/login");
    if (user.role !== "admin") redirect("/");
    return user;
}

export async function requireFarmer() {
    const user = await getUser();
    if (!user) redirect("/auth/signin");
    if (user.role !== "farmer" && user.role !== "admin") redirect("/");
    return user;
}