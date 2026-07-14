import { test, expect } from "@playwright/test";

// Admin gating lives in two places that must agree:
//   - utils/supabase/proxy.ts (the Next.js proxy/middleware) — runs on every
//     request, redirects unauthenticated visitors to /admin/login and
//     non-admin/under-AAL2 sessions away from /admin/**.
//   - lib/auth.ts `requireAdmin()` — the same guard, defense-in-depth, called
//     from server components/actions directly.
//
// Both checks call `supabase.auth.getUser()` and query `profiles.role` from
// the Next.js server process itself (Edge/Node runtime -> Supabase's cloud
// API), never as a request the *browser* dispatches. Playwright's
// `page.route()` can only intercept requests the browser makes, so it cannot
// see or fake that server-to-Supabase call. That means the "logged in as a
// non-admin, redirected away from /admin" scenario cannot be exercised here
// without either a real Supabase test project + seeded non-admin user, or
// swapping in a mock Supabase endpoint for the dev server itself — both out
// of scope for this environment. It's left as `test.fixme` below with the
// reasoning inline rather than faking coverage with a cookie that would just
// fail `getUser()` and collapse back into the "unauthenticated" case.
//
// What IS fully real and deterministic, with zero mocking: every unauthenticated
// redirect, since a fresh Playwright context starts with no cookies at all.

test.describe("unauthenticated visitors", () => {
    test("GET /admin redirects to /admin/login", async ({ page }) => {
        await page.goto("/admin");
        await expect(page).toHaveURL(/\/admin\/login$/);
    });

    test("GET /admin/orders redirects to /admin/login", async ({ page }) => {
        await page.goto("/admin/orders");
        await expect(page).toHaveURL(/\/admin\/login$/);
    });

    test("GET /admin/users redirects to /admin/login", async ({ page }) => {
        await page.goto("/admin/users");
        await expect(page).toHaveURL(/\/admin\/login$/);
    });

    test("GET /admin/trees/new redirects to /admin/login", async ({ page }) => {
        await page.goto("/admin/trees/new");
        await expect(page).toHaveURL(/\/admin\/login$/);
    });

    test("the redirect does not leak the originally-requested admin path in the query string", async ({
        page,
    }) => {
        // Unlike the customer-facing redirectToSignin() helper (which preserves
        // `redirectTo` so the user lands back where they started), the admin
        // branch in proxy.ts's PHASE 1 does a bare redirect with no query
        // string — there is no post-MFA destination to remember from an
        // unauthenticated hit.
        await page.goto("/admin/orders/some-id");
        const url = new URL(page.url());
        expect(url.pathname).toBe("/admin/login");
        expect(url.search).toBe("");
    });

    test("GET /admin/login itself is not redirected away and renders the portal", async ({
        page,
    }) => {
        await page.goto("/admin/login");
        await expect(page).toHaveURL(/\/admin\/login$/);
        await expect(
            page.getByRole("heading", { name: /admin/i })
        ).toBeVisible();
        // The admin login page's Field component renders a plain sibling
        // <label> (no htmlFor), so it isn't associated with the input for
        // getByLabel — target the input by its placeholder instead.
        await expect(page.getByPlaceholder("9876543210")).toBeVisible();
    });
});

test.describe("non-admin authenticated session", () => {
    // See the file-level comment: requireAdmin()/the proxy validate the
    // session by calling Supabase directly from the Next.js server process.
    // Playwright cannot intercept that call, and a forged/garbage session
    // cookie doesn't exercise the "authenticated but wrong role" branch — it
    // just fails auth.getUser() and is treated as unauthenticated, which is a
    // different code path already covered above. Unfixme this once a seeded
    // Supabase test project (or a proxy'd Supabase mock reachable from the
    // dev server) is available.
    test.fixme(
        "a logged-in user with role 'user' hitting /admin is redirected to /",
        async ({ page }) => {
            await page.goto("/admin");
            await expect(page).toHaveURL("/");
        }
    );

    test.fixme(
        "a logged-in user with role 'farmer' hitting /admin is redirected to /farmer",
        async ({ page }) => {
            await page.goto("/admin");
            await expect(page).toHaveURL(/\/farmer/);
        }
    );
});
