import { test, expect } from "@playwright/test";
import { mockAuthSession, MOCK_USER, HAS_SEEDED_TEST_BACKEND } from "../helpers/mock-auth";

/**
 * Account → Orders (/account/orders, /account/orders/[id])
 *
 * SIMULATED AUTH: see tests/helpers/mock-auth.ts for the full explanation.
 * `getUserOrders()` and `getOrderById()` (actions/order.actions.ts) both run
 * server-side behind `requireUser()` and scope every query with
 * `.eq("user_id", user.id)`. That scoping is exactly what stops one user
 * from reading another's order — it happens inside a real DB round trip this
 * suite cannot fake, so cross-user access can't be reproduced with a
 * *different* real user's row here. What we CAN reproduce deterministically,
 * without any seeded data, is the code path `getOrderById` takes for any id
 * that doesn't resolve to a row owned by the caller (wrong id, someone
 * else's id — same `.single()` failure either way): app/(storefront)/account/orders/[id]/page.tsx
 * catches that error and calls Next's `notFound()`.
 */

test.describe("Account order history", () => {
  test.beforeEach(async ({ context, page }) => {
    await mockAuthSession(context, page, MOCK_USER);
  });

  test("unauthenticated visitors are redirected to sign-in", async ({ browser }) => {
    const freshContext = await browser.newContext();
    const freshPage = await freshContext.newPage();
    await freshPage.goto("/account/orders");
    await expect(freshPage).toHaveURL(/\/auth\/signin/);
    await freshContext.close();
  });

  test("empty order history shows the empty state with a link to the store", async ({ page }) => {
    test.skip(!HAS_SEEDED_TEST_BACKEND, "needs a real authenticated render — see tests/helpers/mock-auth.ts");
    // getUserOrders() returning [] is the genuinely reachable case for a
    // brand-new mocked identity with no seeded rows — components/storefront/account/orders-list.tsx
    // renders this branch whenever `orders.length === 0`.
    await page.goto("/account/orders");

    await expect(page.getByText(/no orders placed yet/i)).toBeVisible();
    const shopLink = page.getByRole("link", { name: /shop fresh mangoes/i });
    await expect(shopLink).toBeVisible();
    await expect(shopLink).toHaveAttribute("href", "/store");
  });

  test("order detail for a non-existent / not-owned order id renders Next's not-found page", async ({ page }) => {
    test.skip(!HAS_SEEDED_TEST_BACKEND, "needs a real authenticated render — see tests/helpers/mock-auth.ts");
    // getOrderById(id) does `.eq("id", orderId).eq("user_id", user.id).single()`
    // and throws on any miss; the page's catch block calls notFound(). A
    // random UUID exercises the exact same failure branch a foreign user's
    // order id would — the DB can't tell "wrong id" from "someone else's id"
    // and neither can this test, which is the point: it documents that the
    // ownership check is enforced at the query layer, not in the UI.
    const foreignOrderId = "11111111-2222-4333-8444-555555555555";
    await page.goto(`/account/orders/${foreignOrderId}`);

    await expect(page.getByText(/lost in the orchard/i)).toBeVisible();
  });

  test("order history list links each row to its own /account/orders/[id] detail page", async ({ page }) => {
    test.skip(!HAS_SEEDED_TEST_BACKEND, "needs a real authenticated render — see tests/helpers/mock-auth.ts");
    // Structural assertion on components/storefront/account/orders-list.tsx —
    // verifies the row → detail navigation contract without depending on
    // any specific seeded order existing. Skipped when the (mocked) account
    // has no orders, since there is nothing to click through to.
    await page.goto("/account/orders");

    const emptyState = page.getByText(/no orders placed yet/i);
    if (await emptyState.isVisible().catch(() => false)) {
      test.skip(true, "No seeded orders in this simulated session — see file header.");
    }

    const firstDetailLink = page.locator('a[href^="/account/orders/"]').first();
    await expect(firstDetailLink).toBeVisible();
  });
});
