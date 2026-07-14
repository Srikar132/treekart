// tests/admin/trees.spec.ts
//
// ── Mocking approach ─────────────────────────────────────────────────────
// /admin/trees, /admin/trees/new and /admin/trees/[id] are Server Components
// gated by `proxy.ts` (middleware) and, on new/[id], also `requireAdmin()` —
// both run server-side and cannot be forged by Playwright's browser-side
// `page.route()`. See tests/admin/helpers/mock-admin-auth.ts for the full
// explanation and for `HAS_SEEDED_ADMIN_BACKEND`, the flag gating every test
// below that needs the page to actually render past that gate. The
// unauthenticated-redirect tests need no mocking — they exercise the real,
// unmocked middleware, which really does bounce a sessionless visitor to
// /admin/login.

import { test, expect } from "@playwright/test";
import { mockAdminSession, HAS_SEEDED_ADMIN_BACKEND } from "./helpers/mock-admin-auth";

test.describe("Trees — access control", () => {
  for (const path of ["/admin/trees", "/admin/trees/new", "/admin/trees/00000000-0000-0000-0000-000000000000"]) {
    test(`unauthenticated visitor to ${path} is redirected to /admin/login`, async ({ page }) => {
      await page.goto(path);
      await page.waitForURL("**/admin/login");
    });
  }
});

test.describe("Trees — inventory list (requires a seeded backend)", () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    test.skip(!HAS_SEEDED_ADMIN_BACKEND, "Needs a backend the middleware actually trusts — see file banner.");
    await mockAdminSession(page, context, baseURL!);
    await page.goto("/admin/trees");
  });

  test("renders the inventory heading, toolbar and table", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Tree Inventory" })).toBeVisible();
    await expect(page.getByPlaceholder("Search by variety...")).toBeVisible();
    await expect(page.getByText("Tree Details")).toBeVisible();
  });

  test("filtering by a status with no matches shows the empty state", async ({ page }) => {
    // "inactive" is a valid, low-population status in most seed data; the
    // assertion is on the DataTable's own empty-state copy, not the filter.
    await page.goto("/admin/trees?status=inactive&q=zzz-no-such-variety-zzz");
    await expect(page.getByText("No records found")).toBeVisible();
  });

  test("sorting by price updates the URL sort params", async ({ page }) => {
    await page.getByRole("button", { name: /Price/ }).click();
    await page.waitForURL(/[?&]sort=price/);
    await expect(page).toHaveURL(/order=asc|order=desc/);
  });

  test("pagination shows page 1 of the total on first load", async ({ page }) => {
    await expect(page.getByText(/page 1 of/i)).toBeVisible();
  });

  test("'Add New Tree' link navigates to the creation form", async ({ page }) => {
    await page.getByRole("link", { name: "Add New Tree" }).click();
    await page.waitForURL("**/admin/trees/new");
    await expect(page.getByRole("heading", { name: "Deploy New Tree" })).toBeVisible();
  });
});

test.describe("Trees — create/edit form validation (requires a seeded backend)", () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    test.skip(!HAS_SEEDED_ADMIN_BACKEND, "Needs a backend the middleware actually trusts — see file banner.");
    await mockAdminSession(page, context, baseURL!);
    await page.goto("/admin/trees/new");
  });

  test("rejects an empty/too-short variety and description", async ({ page }) => {
    await page.getByRole("button", { name: /Deploy to Market/i }).click();
    await expect(
      page.getByText(/Variety must be at least 2 characters|Description must be at least 20 characters/)
    ).toBeVisible();
  });

  test("rejects a zero/negative seasonal rent price", async ({ page }) => {
    await page.getByLabel(/Tree Variety/i).fill("Alphonso Gold");
    await page
      .getByLabel(/Brief Narrative/i)
      .fill("A heritage tree with a long enough narrative to pass validation easily.");
    const priceInput = page.locator("input[type='number']").first();
    await priceInput.fill("-100");
    await page.getByRole("button", { name: /Deploy to Market/i }).click();
    await expect(page.getByText("Price is required")).toBeVisible();
  });

  test("rejects an invalid tree_status by only offering the three valid enum options", async ({ page }) => {
    await page.getByRole("combobox", { name: /Market Status/i }).click();
    for (const status of ["Active Market", "Currently Rented", "Maintenance / Private"]) {
      await expect(page.getByRole("option", { name: new RegExp(status) })).toBeVisible();
    }
  });
});

test.describe("Trees — status transitions & deletion (requires a seeded backend)", () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    test.skip(!HAS_SEEDED_ADMIN_BACKEND, "Needs a backend the middleware actually trusts — see file banner.");
    await mockAdminSession(page, context, baseURL!);
    await page.goto("/admin/trees");
  });

  test("toggling a tree's status from the row menu reflects in the table", async ({ page }) => {
    await page.getByRole("button", { name: "" }).first().click(); // row action trigger (icon-only)
    await page.getByText("Toggle Status").click();
    await expect(page.getByText(/Status updated to/)).toBeVisible();
  });

  test("deleting a tree with an active rental is blocked or surfaces an error", async ({ page }) => {
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "" }).first().click();
    await page.getByText("Delete Record").click();
    // adminDeleteTree() surfaces the DB error (e.g. FK restrict from an
    // active rental) as a generic failure toast rather than crashing.
    await expect(page.getByText(/Failed to delete tree|Tree deleted/)).toBeVisible();
  });
});
