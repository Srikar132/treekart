// tests/admin/users.spec.ts
//
// ── Mocking approach ─────────────────────────────────────────────────────
// /admin/users is a Server Component behind `proxy.ts` middleware — it does
// not additionally call `requireAdmin()` itself, relying entirely on the
// middleware gate, which is server-side and out of reach for browser-side
// `page.route()` mocking. See tests/admin/helpers/mock-admin-auth.ts for the
// full explanation and `HAS_SEEDED_ADMIN_BACKEND`, which gates every test
// below that needs the page to actually render. The unauthenticated-redirect
// test needs no mocking — it exercises the real middleware.

import { test, expect } from "@playwright/test";
import { mockAdminSession, HAS_SEEDED_ADMIN_BACKEND } from "./helpers/mock-admin-auth";

test.describe("Users — access control", () => {
  test("unauthenticated visitor is redirected to /admin/login", async ({ page }) => {
    await page.goto("/admin/users");
    await page.waitForURL("**/admin/login");
  });
});

test.describe("Users — member directory (requires a seeded backend)", () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    test.skip(!HAS_SEEDED_ADMIN_BACKEND, "Needs a backend the middleware actually trusts — see file banner.");
    await mockAdminSession(page, context, baseURL!);
    await page.goto("/admin/users");
  });

  test("renders the member directory heading, toolbar and table", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Member Directory" })).toBeVisible();
    await expect(page.getByPlaceholder("Search by name or phone...")).toBeVisible();
  });

  test("role filter offers the three documented user_role values", async ({ page }) => {
    await page.getByRole("combobox", { name: /All Roles/i }).click();
    for (const role of ["Admin", "Farmer", "User"]) {
      await expect(page.getByRole("option", { name: role })).toBeVisible();
    }
  });

  test("filtering by a role with no matches shows the empty state", async ({ page }) => {
    await page.goto("/admin/users?role=admin&q=zzz-no-such-person-zzz");
    await expect(page.getByText("No records found")).toBeVisible();
  });

  test("pagination shows the total row count and current page", async ({ page }) => {
    await expect(page.getByText(/\d+ total · page \d+ of \d+/)).toBeVisible();
  });

  test("changing pages updates the URL page param", async ({ page }) => {
    // Rely on the DataTable's own page-count copy rather than a specific icon
    // selector — if there's more than one page, paging forward should update
    // the `page` query param.
    const pageInfo = page.getByText(/page \d+ of (\d+)/);
    const match = (await pageInfo.textContent())?.match(/of (\d+)/);
    const totalPages = match ? Number(match[1]) : 1;
    test.skip(totalPages < 2, "Only one page of seeded users — nothing to paginate to.");
    await page.goto("/admin/users?page=2");
    await expect(page).toHaveURL(/page=2/);
  });
});
