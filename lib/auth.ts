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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return profile ?? null;
}

export async function requireUser() {
    const profile = await getUser();
    if (!profile) redirect("/login");
    return profile;
}

export async function requireAdmin() {
    const profile = await getUser();
    if (!profile || profile.role !== "admin") redirect("/");
    return profile;
}

export async function requireFarmer() {
    const profile = await getUser();
    if (!profile || (profile.role !== "farmer" && profile.role !== "admin")) {
        redirect("/");
    }
    return profile;
}
