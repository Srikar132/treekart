// tests/admin/dashboard.spec.ts
//
// ── Mocking approach ─────────────────────────────────────────────────────
// The dashboard (app/(admin)/admin/(admin-dashboard)/page.tsx) is a Server
// Component behind BOTH `proxy.ts` middleware (role + AAL2 check) and, on
// every other admin page, `requireAdmin()` — all server-side. Playwright's
// `page.route()` can only intercept requests the BROWSER makes, so it cannot
// forge the server-side `supabase.auth.getUser()` call the middleware makes
// against the real configured Supabase project. See
// tests/admin/helpers/mock-admin-auth.ts for the full explanation.
//
// Practical effect used throughout this file:
//   - A request with NO session cookie at all is a real, unmocked, correctly
//     redirected case — `proxy.ts` sees `user === null` and bounces to
//     /admin/login. That test runs for real, always.
//   - A request with our FAKE session cookie is indistinguishable, from the
//     real middleware's point of view, from "no session" (the token doesn't
//     verify against the real project), so it *also* redirects to
//     /admin/login — not to "/" (non-admin) or to a specific MFA-challenge
//     state. Asserting those specific outcomes, and asserting the dashboard's
//     actual content, requires a real backend the middleware would accept.
//     Those tests are gated behind `HAS_SEEDED_ADMIN_BACKEND` (flip on with
//     `PLAYWRIGHT_ADMIN_BACKEND=1` once that exists) so the suite documents
//     the intended behaviour without silently lying about today's coverage.

import { test, expect } from "@playwright/test";
import {
  mockAdminSession,
  mockNonAdminSession,
  HAS_SEEDED_ADMIN_BACKEND,
} from "./helpers/mock-admin-auth";

test.describe("Admin dashboard — access control", () => {
  test("unauthenticated visitor is redirected to /admin/login", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL("**/admin/login");
  });

  test("a signed-in non-admin is redirected away from the dashboard", async ({ page, context, baseURL }) => {
    test.skip(!HAS_SEEDED_ADMIN_BACKEND, "Needs a backend the middleware actually trusts — see file banner.");
    await mockNonAdminSession(page, context, baseURL!);
    await page.goto("/admin");
    await page.waitForURL((url) => !url.pathname.startsWith("/admin") || url.pathname === "/admin/login");
    expect(page.url()).not.toContain("/admin/login");
  });

  test("an admin session at AAL1 only (no TOTP yet) is sent back to /admin/login for MFA", async ({
    page,
    context,
    baseURL,
  }) => {
    test.skip(!HAS_SEEDED_ADMIN_BACKEND, "Needs a backend the middleware actually trusts — see file banner.");
    await mockAdminSession(page, context, baseURL!, { aal: "aal1" });
    await page.goto("/admin");
    await page.waitForURL("**/admin/login");
  });
});

test.describe("Admin dashboard — content (requires a seeded backend)", () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    test.skip(!HAS_SEEDED_ADMIN_BACKEND, "Needs a backend the middleware actually trusts — see file banner.");
    await mockAdminSession(page, context, baseURL!, { aal: "aal2" });
  });

  test("renders the system overview stats grid", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "System Overview" })).toBeVisible();
    for (const label of ["Total Users", "Tree Inventory", "Store Orders", "Total Revenue"]) {
      await expect(page.getByText(label)).toBeVisible();
    }
  });

  test("renders recent tree rents and latest orders panels", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText("Recent Tree Rents")).toBeVisible();
    await expect(page.getByText("Latest Orders")).toBeVisible();
  });

  test("sidebar exposes every top-level admin section", async ({ page }) => {
    await page.goto("/admin");
    for (const label of [
      "Dashboard",
      "Trees",
      "Tree Rents",
      "Products",
      "Orders",
      "Users",
      "Journal",
      "Landing Content",
      "Settings",
    ]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test("'View All' on recent rentals navigates to the rentals list", async ({ page }) => {
    await page.goto("/admin");
    await page.getByRole("link", { name: /View All/i }).click();
    await page.waitForURL("**/admin/rentals");
  });
});
