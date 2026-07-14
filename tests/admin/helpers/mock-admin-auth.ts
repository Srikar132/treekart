// tests/admin/helpers/mock-admin-auth.ts
//
// ── Shared mock-auth utilities for the /admin Playwright suite ─────────────
//
// There are no live admin credentials or TOTP secrets available in this
// environment (see .claude/CLAUDE.md — admin sign-in is phone+OTP followed by
// TOTP MFA against a real Supabase project). These helpers fake a signed-in
// admin session two ways:
//
//   1. Cookie injection — seed the `sb-<project-ref>-auth-token` cookie that
//      `@supabase/ssr` reads, with a structurally valid (base64-JSON, JWT-
//      shaped access token) fake session carrying custom `aal`/`amr` claims.
//   2. Route interception — `page.route()` stubs the Supabase REST/Auth
//      endpoints (`auth/v1/user`, `rest/v1/profiles`, `auth/v1/factors`, ...)
//      that BROWSER code calls directly, so client components see the
//      role/AAL we want.
//
// ── Known limitation — read before trusting a "renders the dashboard" test ──
// `proxy.ts` (-> utils/supabase/proxy.ts) and every Server Component / Server
// Action in app/(admin)/** run inside the Next.js dev server process, not
// inside the Playwright-controlled browser. `page.route` can only intercept
// requests the BROWSER issues; it cannot stub the server-side
// `supabase.auth.getUser()` call the middleware makes on every request, nor
// the server-side data fetches (`getAdminStats`, `getTrees`, etc.). So:
//
//   - Fully reliable, unmocked: anonymous-visitor redirects (no cookie at
//     all is a real, correct 401-ish path through the real middleware),
//     client-side zod validation, DataTable URL/state interactions.
//   - Best-effort via this helper: "authenticated as admin at AAL2" /
//     "AAL1 only" / "non-admin role" scenarios on Server Component pages.
//     These stub what the BROWSER can see, matching the behavioural contract
//     described in CLAUDE.md, but the real gate is `proxy.ts` talking to the
//     real configured Supabase project — so whether the page actually
//     renders past the redirect still depends on that project accepting (or
//     this repo's middleware being pointed at) a matching session. Wiring a
//     seeded Supabase test project (or a middleware test-bypass flag) is the
//     follow-up that would make these fully self-contained in CI.
//   - Fully reliable and mock-free: the admin login page itself
//     (app/(admin)/admin/(admin-auth)/login/page.tsx) does ALL of its OTP +
//     MFA work with the BROWSER Supabase client (`createClient()` from
//     utils/supabase/client.ts), so login-mfa.spec.ts's route stubs are
//     exercising the real client code, not a shortcut.

import fs from "node:fs";
import path from "node:path";
import type { BrowserContext, Page } from "@playwright/test";

// ── Env resolution ──────────────────────────────────────────────────────────
// Playwright test files run under Node, so process.env is available, but
// Next's .env.local isn't auto-loaded into that process — read it directly.
function loadEnvLocal(): Record<string, string> {
    const envPath = path.resolve(__dirname, "../../../.env.local");
    const out: Record<string, string> = {};
    try {
        const raw = fs.readFileSync(envPath, "utf-8");
        for (const line of raw.split("\n")) {
            const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
            if (match) out[match[1]] = match[2].trim();
        }
    } catch {
        // .env.local not present in this environment — callers fall back below.
    }
    return out;
}

const ENV = loadEnvLocal();

export const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ENV.NEXT_PUBLIC_SUPABASE_URL ||
    "https://yjdgedlmdhgviqlmmzjw.supabase.co";

export const PROJECT_REF = new URL(SUPABASE_URL).hostname.split(".")[0];
export const AUTH_COOKIE_NAME = `sb-${PROJECT_REF}-auth-token`;

// ── Fake session construction ───────────────────────────────────────────────

function base64url(input: object): string {
    return Buffer.from(JSON.stringify(input))
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

export interface FakeSessionOptions {
    userId?: string;
    phone?: string;
    /** aal2 = phone OTP + TOTP both passed. aal1 = phone OTP only. */
    aal?: "aal1" | "aal2";
}

export interface FakeSession {
    access_token: string;
    token_type: "bearer";
    expires_in: number;
    expires_at: number;
    refresh_token: string;
    user: {
        id: string;
        aud: string;
        role: string;
        phone: string;
        email: undefined;
        app_metadata: Record<string, unknown>;
        user_metadata: Record<string, unknown>;
        created_at: string;
    };
}

/**
 * Builds a JWT-*shaped* (unsigned) fake session. Good enough for any code
 * path that only ever locally decodes the current session (e.g.
 * `mfa.getAuthenticatorAssuranceLevel()`), and paired with the route stubs
 * below for anything that calls out to Supabase over the network.
 */
export function buildFakeSession(opts: FakeSessionOptions = {}): FakeSession {
    const userId = opts.userId ?? "00000000-0000-4000-8000-000000000001";
    const phone = opts.phone ?? "+919999999999";
    const aal = opts.aal ?? "aal2";
    const now = Math.floor(Date.now() / 1000);
    const amr =
        aal === "aal2"
            ? [{ method: "otp", timestamp: now - 120 }, { method: "totp", timestamp: now }]
            : [{ method: "otp", timestamp: now - 120 }];

    const header = base64url({ alg: "HS256", typ: "JWT" });
    const payload = base64url({
        sub: userId,
        aud: "authenticated",
        role: "authenticated",
        aal,
        amr,
        phone,
        exp: now + 3600,
        iat: now,
    });
    // No real signature — nothing that runs inside the browser verifies one
    // (getSession()/getAuthenticatorAssuranceLevel() decode locally). Anything
    // that DOES verify (server-side auth.getUser()) is out of reach anyway —
    // see the module-level caveat.
    const accessToken = `${header}.${payload}.fake-signature`;

    return {
        access_token: accessToken,
        token_type: "bearer",
        expires_in: 3600,
        expires_at: now + 3600,
        refresh_token: "fake-refresh-token",
        user: {
            id: userId,
            aud: "authenticated",
            role: "authenticated",
            phone,
            email: undefined,
            app_metadata: {},
            user_metadata: {},
            created_at: new Date().toISOString(),
        },
    };
}

/** Seeds the @supabase/ssr session cookie the browser client reads on load. */
export async function injectFakeSessionCookie(
    context: BrowserContext,
    baseURL: string,
    session: FakeSession
) {
    const value = "base64-" + Buffer.from(JSON.stringify(session)).toString("base64");
    const url = new URL(baseURL);
    await context.addCookies([
        {
            name: AUTH_COOKIE_NAME,
            value,
            domain: url.hostname,
            path: "/",
            httpOnly: false,
            secure: false,
            sameSite: "Lax",
        },
    ]);
}

export type ProfileRole = "admin" | "farmer" | "user";

/**
 * Stubs the Supabase endpoints the BROWSER talks to directly:
 *   - GET  auth/v1/user      -> supabase.auth.getUser() (client-side callers)
 *   - GET  rest/v1/profiles  -> the `.from("profiles").select(...)` merge/role
 *                               check used by lib/auth.ts's getUser() and by
 *                               the admin login page after verifyOtp
 *   - GET  auth/v1/factors   -> mfa.listFactors()
 *
 * Does NOT and cannot stub the equivalent calls proxy.ts / Server Components
 * make server-side — see the module-level caveat.
 */
export async function mockSupabaseBrowserBackend(
    page: Page,
    opts: { role: ProfileRole; fullName?: string | null; session: FakeSession }
) {
    const { role, fullName = "Test Admin", session } = opts;

    await page.route(`${SUPABASE_URL}/auth/v1/user`, (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(session.user),
        })
    );

    await page.route(`${SUPABASE_URL}/rest/v1/profiles**`, (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            // Every caller here (lib/auth.ts's getUser(), the admin login
            // page's role check) uses `.single()`, which asks PostgREST for a
            // plain object (not an array) via the `Accept:
            // application/vnd.pgrst.object+json` header.
            body: JSON.stringify({
                id: session.user.id,
                full_name: fullName,
                role,
                avatar_url: null,
                phone: session.user.phone,
                email: null,
            }),
        })
    );

    await page.route(`${SUPABASE_URL}/auth/v1/factors**`, (route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                totp: [{ id: "factor-1", status: "verified", factor_type: "totp" }],
                all: [{ id: "factor-1", status: "verified", factor_type: "totp" }],
            }),
        })
    );
}

/**
 * Convenience combo: cookie + browser-backend stubs for an "admin, given
 * AAL level" scenario. Call before `page.goto('/admin/...')`.
 * See the module-level caveat: this reliably fakes what the BROWSER sees,
 * not what proxy.ts's server-side check sees.
 */
export async function mockAdminSession(
    page: Page,
    context: BrowserContext,
    baseURL: string,
    opts: { aal?: "aal1" | "aal2"; fullName?: string | null } = {}
) {
    const session = buildFakeSession({ aal: opts.aal ?? "aal2" });
    await injectFakeSessionCookie(context, baseURL, session);
    await mockSupabaseBrowserBackend(page, { role: "admin", fullName: opts.fullName, session });
    return session;
}

/** Same, but the profile role is "user" — for the non-admin redirect scenario. */
export async function mockNonAdminSession(
    page: Page,
    context: BrowserContext,
    baseURL: string
) {
    const session = buildFakeSession({ aal: "aal1" });
    await injectFakeSessionCookie(context, baseURL, session);
    await mockSupabaseBrowserBackend(page, { role: "user", fullName: "Regular Person", session });
    return session;
}

/**
 * Stubs `window.turnstile` before any page script runs, so the admin login
 * form's captcha gate resolves immediately without depending on Cloudflare's
 * real challenges.cloudflare.com script being reachable from the test runner.
 */
export async function stubTurnstile(
    page: Page,
    opts: { token?: string; autoVerify?: boolean } = {}
) {
    const token = opts.token ?? "test-turnstile-token";
    const autoVerify = opts.autoVerify ?? true;
    await page.addInitScript(
        ({ tok, auto }) => {
            (window as unknown as { turnstile: unknown }).turnstile = {
                // `auto=false` simulates a widget that rendered but was never
                // solved by the visitor — onVerify is simply never called.
                render: (_el: HTMLElement, cbOpts: { callback?: (token: string) => void }) => {
                    if (auto) setTimeout(() => cbOpts.callback?.(tok), 0);
                    return "test-widget-id";
                },
                reset: () => {},
                remove: () => {},
            };
        },
        { tok: token, auto: autoVerify }
    );
}

/** Asserts that visiting `path` with no session bounces to /admin/login (real, unmocked). */
export async function expectUnauthenticatedRedirectsToLogin(page: Page, path: string) {
    await page.goto(path);
    await page.waitForURL("**/admin/login");
}

/**
 * Every Server Component page and Server Action under app/(admin)/** re-checks
 * the session server-side (proxy.ts middleware + requireAdmin()), which this
 * suite cannot forge (see the module-level caveat) without a real backend the
 * Next dev server itself is configured to trust. Tests that need a genuinely
 * rendered dashboard/list/form page are gated behind this flag so the suite is
 * green-by-default (skipped, not falsely passing or failing) until that real
 * backend exists; flip it on by running Playwright with
 * `PLAYWRIGHT_ADMIN_BACKEND=1` once a seeded Supabase test project (or a
 * middleware test-bypass) is wired up for the dev server the tests run against.
 */
export const HAS_SEEDED_ADMIN_BACKEND = process.env.PLAYWRIGHT_ADMIN_BACKEND === "1";
