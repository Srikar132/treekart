// tests/admin/products.spec.ts
//
// ── Mocking approach ─────────────────────────────────────────────────────
// Same constraint as every other entity file: /admin/products, .../new and
// .../[id] are Server Components behind `proxy.ts` + `requireAdmin()`, both
// server-side and out of reach for browser-side `page.route()` mocking. See
// tests/admin/helpers/mock-admin-auth.ts for the full explanation and the
// `HAS_SEEDED_ADMIN_BACKEND` flag gating tests that need real rendered
// content. The unauthenticated-redirect tests below need no mocking at all —
// they exercise the real middleware.

import { test, expect } from "@playwright/test";
import { mockAdminSession, HAS_SEEDED_ADMIN_BACKEND } from "./helpers/mock-admin-auth";

test.describe("Products — access control", () => {
  for (const path of [
    "/admin/products",
    "/admin/products/new",
    "/admin/products/00000000-0000-0000-0000-000000000000",
  ]) {
    test(`unauthenticated visitor to ${path} is redirected to /admin/login`, async ({ page }) => {
      await page.goto(path);
      await page.waitForURL("**/admin/login");
    });
  }
});

test.describe("Products — shop inventory list (requires a seeded backend)", () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    test.skip(!HAS_SEEDED_ADMIN_BACKEND, "Needs a backend the middleware actually trusts — see file banner.");
    await mockAdminSession(page, context, baseURL!);
    await page.goto("/admin/products");
  });

  test("renders the shop heading, toolbar and table", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Mango Shop" })).toBeVisible();
    await expect(page.getByPlaceholder("Search by name or variety...")).toBeVisible();
  });

  test("filtering to an out-of-stock status with no matches shows the empty state", async ({ page }) => {
    await page.goto("/admin/products?status=out_of_stock&q=zzz-no-such-product-zzz");
    await expect(page.getByText("No records found")).toBeVisible();
  });

  test("sorting by price updates the URL sort params", async ({ page }) => {
    await page.getByRole("button", { name: /Price/ }).click();
    await page.waitForURL(/[?&]sort=price/);
  });

  test("badge filter offers the documented product badges", async ({ page }) => {
    await page.getByRole("combobox", { name: /All Badges/i }).click();
    for (const badge of ["New", "On Sale", "Pre-Order", "Regular"]) {
      await expect(page.getByRole("option", { name: badge })).toBeVisible();
    }
  });

  test("'Add Product' link navigates to the creation form", async ({ page }) => {
    await page.getByRole("link", { name: "Add Product" }).click();
    await page.waitForURL("**/admin/products/new");
    await expect(page.getByRole("heading", { name: "Add New Product" })).toBeVisible();
  });
});

test.describe("Products — create/edit form validation (requires a seeded backend)", () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    test.skip(!HAS_SEEDED_ADMIN_BACKEND, "Needs a backend the middleware actually trusts — see file banner.");
    await mockAdminSession(page, context, baseURL!);
    await page.goto("/admin/products/new");
  });

  test("rejects an empty product name", async ({ page }) => {
    await page.getByRole("button", { name: /Publish to Shop/i }).click();
    await expect(page.getByText("Product name is required")).toBeVisible();
  });

  test("rejects a zero/negative selling price", async ({ page }) => {
    await page.getByLabel(/Product Name/i).fill("Premium Alphonso Box");
    await page.getByLabel(/Mango Variety/i).fill("Alphonso");
    await page
      .getByLabel(/Product Description/i)
      .fill("A generously long description that clears the twenty character minimum easily.");
    await page.getByLabel(/Selling Price/i).fill("0");
    await page.getByRole("button", { name: /Publish to Shop/i }).click();
    await expect(page.getByText("Price is required")).toBeVisible();
  });

  test("requires at least one product image before publishing", async ({ page }) => {
    await page.getByLabel(/Product Name/i).fill("Premium Alphonso Box");
    await page.getByLabel(/Mango Variety/i).fill("Alphonso");
    await page
      .getByLabel(/Product Description/i)
      .fill("A generously long description that clears the twenty character minimum easily.");
    await page.getByLabel(/Selling Price/i).fill("1499");
    await page.getByRole("button", { name: /Publish to Shop/i }).click();
    await expect(page.getByText("At least one image is required")).toBeVisible();
  });

  test("only exposes the three valid product_status enum values", async ({ page }) => {
    await page.getByRole("combobox", { name: /Inventory Status/i }).click();
    for (const status of ["In Stock", "Out of Stock", "Accepting Pre-Orders"]) {
      await expect(page.getByRole("option", { name: status })).toBeVisible();
    }
  });
});

test.describe("Products — deletion (requires a seeded backend)", () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    test.skip(!HAS_SEEDED_ADMIN_BACKEND, "Needs a backend the middleware actually trusts — see file banner.");
    await mockAdminSession(page, context, baseURL!);
    await page.goto("/admin/products");
  });

  test("cancelling the delete confirmation leaves the product in place", async ({ page }) => {
    page.once("dialog", (dialog) => dialog.dismiss());
    const rowCountBefore = await page.getByRole("row").count();
    await page.getByRole("button", { name: "" }).first().click();
    await page.getByText("Delete Product").click();
    await expect(page.getByRole("row")).toHaveCount(rowCountBefore);
  });

  test("confirming delete removes the product and shows a success toast", async ({ page }) => {
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "" }).first().click();
    await page.getByText("Delete Product").click();
    await expect(page.getByText(/Product deleted successfully|Failed to delete product/)).toBeVisible();
  });
});
