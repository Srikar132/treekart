"use server";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { getSupabaseServer } from "@/lib/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { recoveryCodeSchema } from "@/lib/validations";
import { recoveryAj } from "@/lib/arcjet";

const CODE_COUNT = 8;
const CODE_BYTES = 5; // 5 bytes -> 8 base32 chars -> 40 bits of entropy per code
const ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ0123456789"; // no I/L/O/U — unambiguous when written down

/** Codes are high-entropy random strings, not passwords, so a plain SHA-256 is appropriate. */
function hashCode(code: string): string {
    return createHash("sha256").update(normalize(code)).digest("hex");
}

/** Accept the code however the user types it: spaces, dashes, lower case. */
function normalize(code: string): string {
    return code.replace(/[\s-]/g, "").toUpperCase();
}

function generateCode(): string {
    const bytes = randomBytes(CODE_BYTES);
    let out = "";
    for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
    // A second chunk so each code is 10 chars, displayed as XXXXX-XXXXX
    const more = randomBytes(CODE_BYTES);
    for (const b of more) out += ALPHABET[b % ALPHABET.length];
    return `${out.slice(0, 5)}-${out.slice(5)}`;
}

function constantTimeEquals(a: string, b: string): boolean {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
}

/** The caller must be an authenticated admin (first factor already passed). */
async function requireAdminSession() {
    const supabase = await getSupabaseServer();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") return null;
    return { supabase, userId: user.id };
}

/**
 * Issue a fresh set of recovery codes. Called immediately after a successful
 * TOTP enrolment. Returns the plaintext codes ONCE — only hashes are persisted,
 * and they are never logged.
 *
 * Regenerating invalidates any previous set.
 */
export async function generateRecoveryCodes(): Promise<
    { success: true; codes: string[] } | { success: false; error: string }
> {
    const session = await requireAdminSession();
    if (!session) return { success: false, error: "Not authorized." };

    const admin = createAdminClient();

    // Invalidate the previous set — a rotated set must not leave old codes live.
    await admin.from("admin_recovery_codes").delete().eq("user_id", session.userId);

    const codes = Array.from({ length: CODE_COUNT }, generateCode);
    const rows = codes.map((code) => ({
        user_id: session.userId,
        code_hash: hashCode(code),
    }));

    const { error } = await admin.from("admin_recovery_codes").insert(rows);
    if (error) {
        console.error("generateRecoveryCodes: insert failed", error.message);
        return { success: false, error: "Could not generate recovery codes." };
    }

    return { success: true, codes };
}

/**
 * Redeem a recovery code.
 *
 * IMPORTANT: this does NOT grant AAL2. Supabase only mints aal2 from a real
 * mfa.verify(). A code merely authorizes removing the lost TOTP factor; the
 * admin must then enrol a new one and verify it.
 *
 * Guards: an aal1 session (phone OTP already passed) + role === 'admin' +
 * single-use + rate limited. A leaked code alone must never be sufficient.
 */
export async function redeemRecoveryCode(
    input: { code: string }
): Promise<{ success: true } | { success: false; error: string }> {
    // Uniform failure message — never reveal whether a code exists.
    const GENERIC = "That recovery code is not valid.";

    const decision = await recoveryAj.protect({ headers: await headers() });
    if (decision.isDenied()) {
        return { success: false, error: "Too many attempts. Please try again later." };
    }

    const parsed = recoveryCodeSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: GENERIC };

    const session = await requireAdminSession();
    if (!session) return { success: false, error: GENERIC };

    const admin = createAdminClient();
    const candidateHash = hashCode(parsed.data.code);

    const { data: rows, error } = await admin
        .from("admin_recovery_codes")
        .select("id, code_hash")
        .eq("user_id", session.userId)
        .is("used_at", null);

    if (error || !rows?.length) return { success: false, error: GENERIC };

    const match = (rows as { id: string; code_hash: string }[]).find((r) =>
        constantTimeEquals(r.code_hash, candidateHash)
    );
    if (!match) return { success: false, error: GENERIC };

    // Consume the code first. If the unenrol below fails, the code is still spent —
    // that is the safe direction to fail.
    const { error: consumeError } = await admin
        .from("admin_recovery_codes")
        .update({ used_at: new Date().toISOString() })
        .eq("id", match.id)
        .is("used_at", null); // guards a concurrent double-redeem

    if (consumeError) return { success: false, error: GENERIC };

    // Remove every TOTP factor so the admin is forced to enrol afresh.
    const { data: factorData } = await admin.auth.admin.mfa.listFactors({
        userId: session.userId,
    });

    for (const factor of factorData?.factors ?? []) {
        if (factor.factor_type === "totp") {
            await admin.auth.admin.mfa.deleteFactor({
                id: factor.id,
                userId: session.userId,
            });
        }
    }

    return { success: true };
}
