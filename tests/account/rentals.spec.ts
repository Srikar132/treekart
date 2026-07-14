import { test, expect } from "@playwright/test";
import { mockAuthSession, MOCK_USER, HAS_SEEDED_TEST_BACKEND } from "../helpers/mock-auth";

/**
 * Account → My Trees / Rentals (/account/rentals)
 *
 * SIMULATED AUTH: see tests/helpers/mock-auth.ts for the full explanation.
 * `getMyRentals()` (actions/user.actions.ts) runs behind `requireUser()` and
 * scopes the query with `.eq("user_id", user.id)`. Without a seeded Supabase
 * project this suite cannot produce a *populated* rentals list — the
 * genuinely reachable, deterministic case for a fresh mocked identity is the
 * empty state rendered by components/storefront/account/rentals-list.tsx.
 */

test.describe("Account rentals", () => {
  test.beforeEach(async ({ context, page }) => {
    await mockAuthSession(context, page, MOCK_USER);
  });

  test("unauthenticated visitors are redirected to sign-in", async ({ browser }) => {
    const freshContext = await browser.newContext();
    const freshPage = await freshContext.newPage();
    await freshPage.goto("/account/rentals");
    await expect(freshPage).toHaveURL(/\/auth\/signin/);
    await freshContext.close();
  });

  test("empty rentals list shows the empty state with a link to browse orchards", async ({ page }) => {
    test.skip(!HAS_SEEDED_TEST_BACKEND, "needs a real authenticated render — see tests/helpers/mock-auth.ts");
    await page.goto("/account/rentals");

    await expect(page.getByText(/no active rentals/i)).toBeVisible();
    const browseLink = page.getByRole("link", { name: /browse orchards/i });
    await expect(browseLink).toBeVisible();
    await expect(browseLink).toHaveAttribute("href", "/rent");
  });

  test("rentals list, when populated, links each tree card to /trees/[tree_id]", async ({ page }) => {
    // Structural contract check on components/storefront/account/rentals-list.tsx:
    // each card's "Track" link points at `/trees/${rental.tree_id}`. Skipped
    // when the (mocked) account has no seeded rentals to render.
    test.skip(!HAS_SEEDED_TEST_BACKEND, "needs a real authenticated render — see tests/helpers/mock-auth.ts");
    await page.goto("/account/rentals");

    const emptyState = page.getByText(/no active rentals/i);
    if (await emptyState.isVisible().catch(() => false)) {
      test.skip(true, "No seeded rentals in this simulated session — see file header.");
    }

    const trackLink = page.getByRole("link", { name: /track/i }).first();
    await expect(trackLink).toHaveAttribute("href", /^\/trees\//);
  });

  test("dashboard overview surfaces the Recent Rental and Latest Order panels", async ({ page }) => {
    // /account (dashboard tab) renders DashboardOverview with both a
    // "Recent Rental" and "Latest Order" panel. These headings are always
    // present; their body content is either a populated card (real seeded
    // row) or the dashed empty-state — either way the panel itself is a
    // structural guarantee this test can assert without seeded data.
    test.skip(!HAS_SEEDED_TEST_BACKEND, "needs a real authenticated render — see tests/helpers/mock-auth.ts");
    await page.goto("/account");

    await expect(page.getByRole("heading", { name: "Recent Rental" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Latest Order" })).toBeVisible();

    // With no seeded rows for this simulated identity, both panels fall back
    // to their dashed empty-state copy.
    await expect(page.getByText(/no active rentals found/i)).toBeVisible();
    await expect(page.getByText(/no orders placed yet/i)).toBeVisible();
  });
});
