// tests/admin/settings.spec.ts
//
// ── Mocking approach ─────────────────────────────────────────────────────
// /admin/settings is a Server Component that calls `requireAdmin()` directly
// in addition to sitting behind `proxy.ts` middleware — both server-side and
// out of reach for browser-side `page.route()` mocking. See
// tests/admin/helpers/mock-admin-auth.ts for the full explanation and
// `HAS_SEEDED_ADMIN_BACKEND`, which gates every test below that needs the
// page to actually render. The unauthenticated-redirect test needs no
// mocking — it exercises the real `requireAdmin()`/middleware redirect.

import { test, expect } from "@playwright/test";
import { mockAdminSession, HAS_SEEDED_ADMIN_BACKEND } from "./helpers/mock-admin-auth";

test.describe("Settings — access control", () => {
  test("unauthenticated visitor is redirected to /admin/login", async ({ page }) => {
    await page.goto("/admin/settings");
    await page.waitForURL("**/admin/login");
  });
});

test.describe("Settings — delivery charges (requires a seeded backend)", () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    test.skip(!HAS_SEEDED_ADMIN_BACKEND, "Needs a backend the middleware actually trusts — see file banner.");
    await mockAdminSession(page, context, baseURL!);
    await page.goto("/admin/settings");
  });

  test("renders the settings heading and delivery charges form", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await expect(page.getByText("Delivery Charges")).toBeVisible();
    await expect(page.getByLabel(/Store Delivery Fee/i)).toBeVisible();
    await expect(page.getByLabel(/Free Delivery Threshold/i)).toBeVisible();
    await expect(page.getByLabel(/Rental Delivery Fee/i)).toBeVisible();
  });

  test("rejects a negative delivery fee", async ({ page }) => {
    await page.getByLabel(/Store Delivery Fee/i).fill("-50");
    await page.getByRole("button", { name: "Save Settings" }).click();
    await expect(page.getByText("Must be 0 or more")).toBeVisible();
  });

  test("accepts zero as a valid free-delivery fee", async ({ page }) => {
    await page.getByLabel(/Rental Delivery Fee/i).fill("0");
    await page.getByRole("button", { name: "Save Settings" }).click();
    await expect(page.getByText("Delivery settings updated")).toBeVisible();
  });

  test("saving valid values shows a success toast and persists on reload", async ({ page }) => {
    await page.getByLabel(/Store Delivery Fee/i).fill("49");
    await page.getByLabel(/Free Delivery Threshold/i).fill("999");
    await page.getByLabel(/Rental Delivery Fee/i).fill("199");
    await page.getByRole("button", { name: "Save Settings" }).click();
    await expect(page.getByText("Delivery settings updated")).toBeVisible();
    await page.reload();
    await expect(page.getByLabel(/Store Delivery Fee/i)).toHaveValue("49");
  });
});
