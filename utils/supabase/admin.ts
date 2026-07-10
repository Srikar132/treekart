import "server-only";

import { createClient } from "@supabase/supabase-js";

// Service-role client. Bypasses RLS entirely — never import this into a client
// component, a route that echoes its results, or anything reachable by a user.
//
// Needed because unenrolling a *verified* MFA factor normally requires AAL2,
// which a locked-out admin cannot reach by definition. Only the admin API can.
//
// Deliberately untyped: it touches `admin_recovery_codes`, which is created by
// the phone-OTP migration and therefore absent from types/database.types.ts until
// `supabase gen types typescript` is re-run against the migrated database.
// Once regenerated, add the `<Database>` generic back.
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error("Supabase service-role credentials are not configured");
    }

    return createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}
