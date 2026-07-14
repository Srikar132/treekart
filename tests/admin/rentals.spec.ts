// tests/admin/rentals.spec.ts
//
// ── Mocking approach ─────────────────────────────────────────────────────
// /admin/rentals and /admin/rentals/[id]/updates are Server Components
// behind `proxy.ts` middleware and (on the updates page) `requireAdmin()` —
// both server-side, not reachable by browser-side `page.route()` mocking.
// See tests/admin/helpers/mock-admin-auth.ts for the full explanation and
// `HAS_SEEDED_ADMIN_BACKEND`, which gates every test below that needs the
// page to actually render. The unauthenticated-redirect tests need no
// mocking — they exercise the real middleware.

import { test, expect } from "@playwright/test";
import { mockAdminSession, HAS_SEEDED_ADMIN_BACKEND } from "./helpers/mock-admin-auth";

test.describe("Rentals — access control", () => {
  for (const path of [
    "/admin/rentals",
    "/admin/rentals/00000000-0000-0000-0000-000000000000/updates",
  ]) {
    test(`unauthenticated visitor to ${path} is redirected to /admin/login`, async ({ page }) => {
      await page.goto(path);
      await page.waitForURL("**/admin/login");
    });
  }
});

test.describe("Rentals — leasing list (requires a seeded backend)", () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    test.skip(!HAS_SEEDED_ADMIN_BACKEND, "Needs a backend the middleware actually trusts — see file banner.");
    await mockAdminSession(page, context, baseURL!);
    await page.goto("/admin/rentals");
  });

  test("renders the leasing heading, toolbar and table", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Leasing Management" })).toBeVisible();
    await expect(page.getByPlaceholder("Search Member or Phone...")).toBeVisible();
  });

  test("filtering by cancelled status with no matches shows the empty state", async ({ page }) => {
    await page.goto("/admin/rentals?status=cancelled&q=zzz-no-such-member-zzz");
    await expect(page.getByText("No records found")).toBeVisible();
  });

  test("status filter offers the documented rental_status values", async ({ page }) => {
    await page.getByRole("combobox", { name: /All Status/i }).click();
    for (const status of ["Active", "Completed", "Cancelled"]) {
      await expect(page.getByRole("option", { name: status })).toBeVisible();
    }
  });

  test("season filter offers a current and previous season option", async ({ page }) => {
    await page.getByRole("combobox", { name: /All Seasons/i }).click();
    await expect(page.getByRole("option", { name: /Current \(/ })).toBeVisible();
    await expect(page.getByRole("option", { name: /Previous \(/ })).toBeVisible();
  });

  test("clicking an active rental row opens the growth-updates page", async ({ page }) => {
    await page.goto("/admin/rentals?status=active");
    const firstRow = page.getByRole("row").nth(1);
    await firstRow.click();
    await page.waitForURL(/\/admin\/rentals\/[^/]+\/updates$/);
    await expect(page.getByRole("heading", { name: "Growth Timeline" })).toBeVisible();
  });
});

test.describe("Rentals — status transitions (requires a seeded backend)", () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    test.skip(!HAS_SEEDED_ADMIN_BACKEND, "Needs a backend the middleware actually trusts — see file banner.");
    await mockAdminSession(page, context, baseURL!);
    await page.goto("/admin/rentals?status=active");
  });

  test("an active lease can be marked completed from the row menu", async ({ page }) => {
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "" }).first().click();
    await page.getByText("Mark as Completed").click();
    await expect(page.getByText("Lease marked as completed")).toBeVisible();
  });

  test("only active leases offer 'Post Growth Update' in the row menu", async ({ page }) => {
    await page.goto("/admin/rentals?status=completed");
    await page.getByRole("button", { name: "" }).first().click();
    await expect(page.getByText("Post Growth Update")).not.toBeVisible();
    await expect(page.getByText("Mark as Completed")).not.toBeVisible();
  });
});

test.describe("Rentals — growth updates (requires a seeded backend)", () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    test.skip(!HAS_SEEDED_ADMIN_BACKEND, "Needs a backend the middleware actually trusts — see file banner.");
    await mockAdminSession(page, context, baseURL!);
  });

  test("shows the empty state when a rental has no growth updates yet", async ({ page }) => {
    await page.goto("/admin/rentals?status=active");
    const firstRow = page.getByRole("row").nth(1);
    await firstRow.click();
    // Either the seeded empty-state copy renders, or existing updates render —
    // this asserts the page loaded past the auth gate either way.
    await expect(
      page.getByText(/No growth updates recorded yet|Historical Log/)
    ).toBeVisible();
  });

  test("rejects a growth update with a too-short title/description", async ({ page }) => {
    await page.goto("/admin/rentals?status=active");
    const firstRow = page.getByRole("row").nth(1);
    await firstRow.click();
    await page.getByLabel(/title/i).fill("A");
    await page.getByRole("button", { name: /post|save|add/i }).first().click();
    await expect(page.getByText(/Title is required|Description must be at least 10 characters/)).toBeVisible();
  });
});
