// tests/admin/blogs.spec.ts
//
// ── Mocking approach ─────────────────────────────────────────────────────
// /admin/blogs, .../new and .../[id] are Server Components behind `proxy.ts`
// + `requireAdmin()`, both server-side — out of reach for browser-side
// `page.route()` mocking. See tests/admin/helpers/mock-admin-auth.ts for the
// full explanation and `HAS_SEEDED_ADMIN_BACKEND`, which gates every test
// below that needs the page to actually render. The unauthenticated-redirect
// tests need no mocking — they exercise the real middleware.

import { test, expect } from "@playwright/test";
import { mockAdminSession, HAS_SEEDED_ADMIN_BACKEND } from "./helpers/mock-admin-auth";

test.describe("Blogs — access control", () => {
  for (const path of ["/admin/blogs", "/admin/blogs/new", "/admin/blogs/00000000-0000-0000-0000-000000000000"]) {
    test(`unauthenticated visitor to ${path} is redirected to /admin/login`, async ({ page }) => {
      await page.goto(path);
      await page.waitForURL("**/admin/login");
    });
  }
});

test.describe("Blogs — journal list (requires a seeded backend)", () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    test.skip(!HAS_SEEDED_ADMIN_BACKEND, "Needs a backend the middleware actually trusts — see file banner.");
    await mockAdminSession(page, context, baseURL!);
    await page.goto("/admin/blogs");
  });

  test("renders the journal heading, toolbar and table", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Journal Management" })).toBeVisible();
    await expect(page.getByPlaceholder("Search by story title...")).toBeVisible();
  });

  test("filtering by a category with no matches shows the empty state", async ({ page }) => {
    await page.goto("/admin/blogs?category=News&q=zzz-no-such-story-zzz");
    await expect(page.getByText("No records found")).toBeVisible();
  });

  test("category filter offers the documented categories", async ({ page }) => {
    await page.getByRole("combobox", { name: /All Categories/i }).click();
    for (const category of ["Orchard Life", "Guides", "News"]) {
      await expect(page.getByRole("option", { name: category })).toBeVisible();
    }
  });

  test("'Write New Story' link navigates to the creation form", async ({ page }) => {
    await page.getByRole("link", { name: "Write New Story" }).click();
    await page.waitForURL("**/admin/blogs/new");
    await expect(page.getByRole("heading", { name: "Write New Story" })).toBeVisible();
  });
});

test.describe("Blogs — create form validation (requires a seeded backend)", () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    test.skip(!HAS_SEEDED_ADMIN_BACKEND, "Needs a backend the middleware actually trusts — see file banner.");
    await mockAdminSession(page, context, baseURL!);
    await page.goto("/admin/blogs/new");
  });

  test("rejects a title shorter than 5 characters", async ({ page }) => {
    await page.getByLabel(/Article Title/i).fill("Hi");
    await page.getByRole("button", { name: /Publish Story/i }).click();
    await expect(page.getByText("Title must be at least 5 characters")).toBeVisible();
  });

  test("rejects an empty category and author", async ({ page }) => {
    await page.getByLabel(/Article Title/i).fill("The Science of Alphonso Ripening");
    await page.getByRole("button", { name: /Publish Story/i }).click();
    await expect(
      page.getByText(/Category is required|Excerpt must be at least 10 characters/)
    ).toBeVisible();
  });

  test("rejects a too-short excerpt and content body", async ({ page }) => {
    await page.getByLabel(/Article Title/i).fill("The Science of Alphonso Ripening");
    await page.getByLabel(/Category/i).fill("Guides");
    await page.getByLabel(/Executive Summary/i).fill("Too short");
    await page.getByLabel(/Full Article/i).fill("Also too short");
    await page.getByRole("button", { name: /Publish Story/i }).click();
    await expect(
      page.getByText(/Excerpt must be at least 10 characters|Content must be at least 20 characters/)
    ).toBeVisible();
  });
});

test.describe("Blogs — deletion (requires a seeded backend)", () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    test.skip(!HAS_SEEDED_ADMIN_BACKEND, "Needs a backend the middleware actually trusts — see file banner.");
    await mockAdminSession(page, context, baseURL!);
    await page.goto("/admin/blogs");
  });

  test("cancelling the delete confirmation leaves the entry in place", async ({ page }) => {
    page.once("dialog", (dialog) => dialog.dismiss());
    const rowCountBefore = await page.getByRole("row").count();
    await page.getByRole("button", { name: "" }).first().click();
    await page.getByText("Delete Entry").click();
    await expect(page.getByRole("row")).toHaveCount(rowCountBefore);
  });

  test("confirming delete removes the entry and shows a toast", async ({ page }) => {
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "" }).first().click();
    await page.getByText("Delete Entry").click();
    await expect(page.getByText(/Journal entry removed/)).toBeVisible();
  });
});
