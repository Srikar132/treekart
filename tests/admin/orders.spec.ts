// tests/admin/orders.spec.ts
//
// ── Mocking approach ─────────────────────────────────────────────────────
// /admin/orders and /admin/orders/[id] are Server Components behind
// `proxy.ts` middleware — server-side, not reachable by browser-side
// `page.route()` mocking. See tests/admin/helpers/mock-admin-auth.ts for the
// full explanation and `HAS_SEEDED_ADMIN_BACKEND`, which gates every test
// below that needs the page to actually render. The unauthenticated-redirect
// tests need no mocking — they exercise the real middleware.

import { test, expect } from "@playwright/test";
import { mockAdminSession, HAS_SEEDED_ADMIN_BACKEND } from "./helpers/mock-admin-auth";

test.describe("Orders — access control", () => {
  for (const path of ["/admin/orders", "/admin/orders/00000000-0000-0000-0000-000000000000"]) {
    test(`unauthenticated visitor to ${path} is redirected to /admin/login`, async ({ page }) => {
      await page.goto(path);
      await page.waitForURL("**/admin/login");
    });
  }
});

test.describe("Orders — fulfillment list (requires a seeded backend)", () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    test.skip(!HAS_SEEDED_ADMIN_BACKEND, "Needs a backend the middleware actually trusts — see file banner.");
    await mockAdminSession(page, context, baseURL!);
    await page.goto("/admin/orders");
  });

  test("renders the fulfillment heading, toolbar and table", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Fulfillment Center" })).toBeVisible();
    await expect(page.getByPlaceholder("Search by customer name or phone...")).toBeVisible();
  });

  test("filtering by cancelled status with no matches shows the empty state", async ({ page }) => {
    await page.goto("/admin/orders?status=cancelled&q=zzz-no-such-order-zzz");
    await expect(page.getByText("No records found")).toBeVisible();
  });

  test("status filter offers the documented order_status values", async ({ page }) => {
    await page.getByRole("combobox", { name: /All Status/i }).click();
    for (const status of ["Confirmed", "Shipped", "Delivered", "Cancelled"]) {
      await expect(page.getByRole("option", { name: status })).toBeVisible();
    }
  });

  test("sorting by amount updates the URL sort params", async ({ page }) => {
    await page.getByRole("button", { name: /Amount/ }).click();
    await page.waitForURL(/[?&]sort=total_amount/);
  });

  test("clicking a row opens the order manifest detail page", async ({ page }) => {
    const firstRow = page.getByRole("row").nth(1);
    await firstRow.click();
    await page.waitForURL(/\/admin\/orders\/[^/]+$/);
    await expect(page.getByRole("heading", { name: "Order Manifest" })).toBeVisible();
  });
});

test.describe("Orders — status transitions (requires a seeded backend)", () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    test.skip(!HAS_SEEDED_ADMIN_BACKEND, "Needs a backend the middleware actually trusts — see file banner.");
    await mockAdminSession(page, context, baseURL!);
  });

  test("the fulfillment pipeline stepper reflects the current order_status", async ({ page }) => {
    // Assumes at least one seeded order with status "shipped".
    await page.goto("/admin/orders?status=shipped");
    const firstRow = page.getByRole("row").nth(1);
    await firstRow.click();
    await expect(page.getByText("Shipped").first()).toBeVisible();
  });

  test("marking a confirmed order as shipped, then delivered, updates the pipeline", async ({ page }) => {
    await page.goto("/admin/orders?status=confirmed");
    const firstRow = page.getByRole("row").nth(1);
    await firstRow.click();
    await page.getByRole("button", { name: "Shipped" }).click();
    await expect(page.getByText("Order status updated to shipped")).toBeVisible();
    await page.getByRole("button", { name: "Delivered" }).click();
    await expect(page.getByText("Order status updated to delivered")).toBeVisible();
  });

  test("delivered orders can no longer be cancelled", async ({ page }) => {
    await page.goto("/admin/orders?status=delivered");
    const firstRow = page.getByRole("row").nth(1);
    await firstRow.click();
    await expect(page.getByText("Cancel Order")).not.toBeVisible();
  });

  test("cancelling an order shows the refund-initiated confirmation and banner", async ({ page }) => {
    await page.goto("/admin/orders?status=confirmed");
    const firstRow = page.getByRole("row").nth(1);
    await firstRow.click();
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Cancel Order" }).click();
    await expect(page.getByText(/Order cancelled\. Refund initiated if applicable\./)).toBeVisible();
    await expect(page.getByText("This order has been cancelled.")).toBeVisible();
  });
});
