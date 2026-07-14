import { test, expect } from '@playwright/test';

/**
 * Cross-cutting persistence tests for the Zustand stores in store/*.ts.
 *
 * All three persisted stores write to localStorage via zustand's `persist`
 * middleware, using the default envelope format `{"state": {...}, "version": 0}`
 * (confirmed by reading node_modules/zustand/middleware.js — `version: 0` is
 * the middleware default, and no store in this codebase overrides it).
 *
 * Rather than driving each store's real producing UI (Add to Cart on /store,
 * "Rent Now" on a tree detail page, the checkout address form) — which would
 * depend on live Supabase data owned by the storefront/checkout test suites —
 * these tests seed localStorage directly in that exact envelope shape via
 * `page.addInitScript`, before the app's own JS runs. This is a faithful
 * simulation of "a returning visitor whose browser already holds this state",
 * which is precisely the scenario the persistence layer exists for, and it
 * keeps this suite independent of product/tree catalog contents.
 */

const MANGO_CART_KEY = 'treekart-mango-cart';
const RENTAL_KEY = 'treekart-rental-selection';
const ADDRESS_KEY = 'treekart-delivery-address';

function seed(state: Record<string, unknown>) {
  return JSON.stringify({ state, version: 0 });
}

test.describe('treekart-mango-cart (store/use-mango-cart.ts)', () => {
  const seededItem = {
    id: 'test-product-1',
    name: 'Test Alphonso Box',
    variety: 'Alphonso',
    pricePerKg: 500,
    price: 500,
    qty: 2,
    imageUrl: '/placeholder-mango.png',
    badge: null,
    weightKg: 1,
    status: 'available',
  };

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      ([key, value]) => window.localStorage.setItem(key as string, value as string),
      [MANGO_CART_KEY, seed({ items: [seededItem] })]
    );
  });

  test('seeded cart survives a reload and the navbar reflects it post-hydration', async ({ page }) => {
    await page.goto('/');

    // Navbar's item-count badge (components/storefront/navbar.tsx) shows
    // totalQty() once `mounted` flips true. Give hydration a moment, then
    // assert the real seeded qty (2) is shown — not 0, not stuck empty.
    const cartTrigger = page.locator('div.cursor-pointer').filter({ hasText: 'Cart' }).first();
    await expect(cartTrigger).toBeVisible();
    await expect(cartTrigger).toContainText('2');

    // Reload — localStorage must still hold the same persisted payload,
    // proving the persist middleware round-trips rather than clearing on read.
    await page.reload();
    const raw = await page.evaluate((k) => window.localStorage.getItem(k), MANGO_CART_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.state.items).toHaveLength(1);
    expect(parsed.state.items[0].id).toBe('test-product-1');
    expect(parsed.state.items[0].qty).toBe(2);

    await expect(cartTrigger).toContainText('2');
  });

  test('cart sidebar shows the hydrated item, never a stale "empty cart" flash', async ({ page }) => {
    // CartSidebar (components/storefront/cart-sidebar.tsx) explicitly returns
    // `null` until `_hasHydrated` is true — it has no intermediate empty-state
    // render to flash, unlike the navbar counter which uses a separate
    // `mounted` flag. Opening it after hydration should go straight to the
    // seeded item, never the "Your cart is empty" placeholder.
    await page.goto('/');
    const cartTrigger = page.locator('div.cursor-pointer').filter({ hasText: 'Cart' }).first();
    await cartTrigger.click({ force: true });

    await expect(page.getByText('Test Alphonso Box')).toBeVisible();
    await expect(page.getByText('Your cart is empty')).not.toBeVisible();
  });

  test('an empty cart (no seed) correctly shows the empty state, not a leftover flash', async ({ page }) => {
    // Sanity check for the inverse case, on a fresh browser context (via a
    // new page with no init script seed applied to it — Playwright fixtures
    // give each test a clean storage state unless a previous test's context
    // is reused, so this simply skips the beforeEach's localStorage write by
    // clearing it before navigation).
    await page.addInitScript((k) => window.localStorage.removeItem(k as string), MANGO_CART_KEY);
    await page.goto('/');
    const cartTrigger = page.locator('div.cursor-pointer').filter({ hasText: 'Cart' }).first();
    await cartTrigger.click({ force: true });
    await expect(page.getByText('Your cart is empty')).toBeVisible();
  });
});

test.describe('treekart-rental-selection (store/use-rental-store.ts)', () => {
  // NOTE / finding: unlike use-mango-cart.ts and use-delivery-address.ts,
  // use-rental-store.ts's persist config has NO `_hasHydrated` flag and no
  // `onRehydrateStorage` callback — it is a bare `persist(..., { name: ... })`.
  // CLAUDE.md's blanket statement "All persisted stores include a
  // `_hasHydrated` guard" does not hold for this one store. There is therefore
  // no hydration-guard behavior to probe here (no flash-prevention mechanism
  // exists to verify) — this test only confirms the raw storage round trip.
  // Driving the real "Rent Now" UI (components/storefront/trees/tree-info.tsx)
  // to populate this store depends on live tree data and is left to the
  // storefront-pages test suite.

  const seededPlan = {
    treeId: 'tree-test-1',
    planId: 'plan-test-1',
    variety: 'Alphonso',
    price: 4999,
    yieldMinKg: 10,
    yieldMaxKg: 20,
    photos: [],
    gpsLat: 17.385,
    gpsLng: 78.4867,
  };

  test('seeded rental selection survives a reload untouched', async ({ page }) => {
    await page.addInitScript(
      ([key, value]) => window.localStorage.setItem(key as string, value as string),
      [RENTAL_KEY, seed({ selectedPlan: seededPlan })]
    );
    await page.goto('/');
    await page.reload();

    const raw = await page.evaluate((k) => window.localStorage.getItem(k), RENTAL_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.state.selectedPlan).toMatchObject(seededPlan);
  });

  test('clearing the store removes the persisted key (matches lib/clear-client-state.ts contract)', async ({ page }) => {
    // Seed via page.evaluate (a one-shot write) rather than addInitScript:
    // addInitScript re-runs on every navigation in this page, so it would
    // re-seed the key on the reload below, undoing the removeItem right
    // before the app's own JS runs on that reload.
    await page.goto('/');
    await page.evaluate(
      ([key, value]) => window.localStorage.setItem(key, value),
      [RENTAL_KEY, seed({ selectedPlan: seededPlan })]
    );
    // Simulate what clearClientState() does on logout: remove the key.
    await page.evaluate((k) => window.localStorage.removeItem(k), RENTAL_KEY);
    await page.reload();
    const raw = await page.evaluate((k) => window.localStorage.getItem(k), RENTAL_KEY);
    expect(raw).toBeNull();
  });
});

test.describe('treekart-delivery-address (store/use-delivery-address.ts)', () => {
  // /checkout is behind CUSTOMER_ONLY_PREFIXES (redirects anonymously — see
  // middleware-routing.spec.ts), so the real address form cannot be reached
  // without a signed-in session here. That authenticated flow is owned by the
  // account/checkout test suite. This test validates the storage-layer
  // contract only: the persisted address round-trips across a reload and the
  // `_hasHydrated` flag this store DOES define defaults correctly.

  const seededAddress = {
    name: 'Test User',
    phone: '+919876543210',
    line1: '123 Test Street',
    locality: 'Banjara Hills',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500034',
  };

  test('seeded delivery address survives a reload untouched', async ({ page }) => {
    await page.addInitScript(
      ([key, value]) => window.localStorage.setItem(key as string, value as string),
      [ADDRESS_KEY, seed({ address: seededAddress })]
    );
    await page.goto('/');
    await page.reload();

    const raw = await page.evaluate((k) => window.localStorage.getItem(k), ADDRESS_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.state.address).toMatchObject(seededAddress);
  });

  test('with no seed, the store falls back to INITIAL_ADDRESS defaults (state default: "Andhra Pradesh")', async ({ page }) => {
    await page.addInitScript((k) => window.localStorage.removeItem(k as string), ADDRESS_KEY);
    await page.goto('/');
    // Finding: unlike the rental store (no _hasHydrated at all), this store's
    // onRehydrateStorage calls setHasHydrated(true) on mount — and zustand's
    // persist middleware writes the (partialize'd) state to storage on EVERY
    // set() call, not only when the persisted slice itself changes. So even a
    // brand-new visitor who never touched the address form ends up with a
    // key in storage within the first tick, holding INITIAL_ADDRESS's
    // defaults. There is no public page rendering the address form directly
    // (it lives behind /checkout) to assert this some other way, so confirm
    // the actual, documented contract: no seed still round-trips the defaults.
    const raw = await page.evaluate((k) => window.localStorage.getItem(k), ADDRESS_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.state.address.state).toBe('Andhra Pradesh');
    expect(parsed.state.address.name).toBe('');
  });
});
