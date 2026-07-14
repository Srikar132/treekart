import { test, expect } from "@playwright/test";
import type { CartItem } from "@/store/use-mango-cart";
import {
  mockAuthSession,
  MOCK_USER,
  seedMangoCart,
  seedDeliveryAddress,
  mockRazorpaySuccess,
  blockRazorpayScript,
  HAS_SEEDED_TEST_BACKEND,
} from "../helpers/mock-auth";

/**
 * Checkout → Store cart (/checkout/store)
 *
 * SIMULATED AUTH: see tests/helpers/mock-auth.ts. `/checkout/store`
 * (app/(checkout)/checkout/store/page.tsx) is a Server Component behind
 * `requireUser()` that also reads `getAppSettings()` for the delivery fee /
 * free-delivery threshold before handing off to the client
 * `<StoreCheckoutClient>`. The auth gate itself cannot be intercepted (see
 * helper file header); everything below the gate — the cart Zustand store,
 * address validation, the empty-cart redirect, and the Razorpay hook — is
 * real client-side code exercised for real via seeded localStorage and a
 * mocked `window.Razorpay`.
 *
 * NOTE ON `_hasHydrated`: both `useMangoCart` and `useDeliveryAddress` guard
 * their persisted values behind `_hasHydrated` to avoid an SSR/CSR mismatch.
 * Because `page.addInitScript()` seeds localStorage before any app JS runs,
 * hydration completes on the very first paint here — but tests still avoid
 * asserting on cart-derived totals in the same tick as `page.goto()` resolves;
 * they wait for a stable, hydration-dependent DOM node (e.g. the rendered
 * cart item name) before reading totals, rather than asserting immediately.
 */

const SAMPLE_ITEM: CartItem = {
  id: "prod-alphonso-1kg",
  name: "Alphonso Mango",
  variety: "Alphonso",
  pricePerKg: 600,
  price: 600,
  qty: 1,
  imageUrl: "https://res.cloudinary.com/demo/image/upload/mango.jpg",
  weightKg: 1,
  status: "available",
};

const VALID_ADDRESS = {
  name: MOCK_USER.full_name,
  phone: "9876543210",
  line1: "12-3 Orchard Lane",
  locality: "Benz Circle",
  city: "Vijayawada",
  district: "NTR",
  state: "Andhra Pradesh",
  pincode: "520008",
};

test.describe("Store checkout — cart, address & delivery fee", () => {
  // NOTE: mockRazorpaySuccess() is applied per-test (not in a blanket
  // beforeEach) because the Place Order button is `disabled={!razorpayLoaded}`
  // — any test that needs to actually click it must stub window.Razorpay
  // first, but the "script never loads" test at the bottom of this file
  // needs the opposite (no stub at all) to be meaningful.
  test.beforeEach(async ({ context, page }) => {
    test.skip(!HAS_SEEDED_TEST_BACKEND, "needs a real authenticated render — see tests/helpers/mock-auth.ts");
    await mockAuthSession(context, page, MOCK_USER);
  });

  test("visiting checkout with an empty cart redirects back to /store", async ({ page }) => {
    // StoreCheckoutClient's effect: `if (items.length === 0 && step !== "success") router.replace("/store")`.
    // No cart is seeded for this test, so the store starts empty.
    await page.goto("/checkout/store");
    await expect(page).toHaveURL(/\/store$/);
  });

  test("removing every item from the cart while on the checkout page redirects to /store", async ({ page }) => {
    // StoreCheckoutClient's own summary view has no per-item remove control
    // (that lives in the header cart drawer, which isn't mounted under the
    // minimal (checkout) layout — see app/(checkout)/checkout/layout.tsx).
    // We simulate "the cart emptied while the shopper was on this page" the
    // way it would genuinely happen — e.g. the persisted store syncing to 0
    // items — by rewriting the persisted localStorage entry directly and
    // reloading. A raw localStorage write alone would NOT reactively update
    // the already-hydrated in-memory Zustand store in the same tab (the
    // store doesn't listen for storage events), so the reload is what makes
    // this a faithful re-hydration rather than a no-op.
    await seedMangoCart(page, [SAMPLE_ITEM]);
    await page.goto("/checkout/store");
    await expect(page.getByText(SAMPLE_ITEM.name)).toBeVisible();

    await page.evaluate(() => {
      const raw = window.localStorage.getItem("treekart-mango-cart");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      parsed.state.items = [];
      window.localStorage.setItem("treekart-mango-cart", JSON.stringify(parsed));
    });
    await page.reload();

    await expect(page).toHaveURL(/\/store$/);
  });

  test("delivery fee is charged when the cart subtotal is just under the ₹999 free-delivery threshold", async ({ page }) => {
    // The threshold shown on this page comes from `getAppSettings()`
    // (actions/admin.actions.ts), a server-side read of the `app_settings`
    // table — NOT from the client store's own hardcoded
    // FREE_DELIVERY_THRESHOLD in store/use-mango-cart.ts (that constant only
    // backs the cart drawer's own total, not this checkout summary). When
    // that DB read fails or is unseeded, `getAppSettings()` falls back to
    // `DEFAULT_SETTINGS` (store_delivery_fee: 99, store_free_delivery_threshold: 999),
    // which is also what CLAUDE.md documents ("free above ₹999") — these
    // tests assume that fallback/default configuration.
    const belowThresholdItem: CartItem = { ...SAMPLE_ITEM, price: 900, qty: 1 };
    await seedMangoCart(page, [belowThresholdItem]);
    await seedDeliveryAddress(page, VALID_ADDRESS);
    await page.goto("/checkout/store");

    await expect(page.getByText(SAMPLE_ITEM.name)).toBeVisible();
    await expect(page.getByText("Subtotal")).toBeVisible();
    // Delivery row must show a non-zero fee, not "Free", below the threshold.
    // The label and value are sibling <span>s inside one flex row (see
    // store-checkout-client.tsx), so grab the value via an xpath sibling
    // lookup rather than an invalid ".." CSS combinator.
    const deliveryLabel = page.getByText("Delivery", { exact: true });
    const deliveryValue = deliveryLabel.locator("xpath=following-sibling::span[1]");
    await expect(deliveryValue).toHaveText(/^₹\d/);
  });

  test("delivery is free when the cart subtotal is at or above the ₹999 threshold", async ({ page }) => {
    const atThresholdItem: CartItem = { ...SAMPLE_ITEM, price: 999, qty: 1 };
    await seedMangoCart(page, [atThresholdItem]);
    await seedDeliveryAddress(page, VALID_ADDRESS);
    await page.goto("/checkout/store");

    await expect(page.getByText(SAMPLE_ITEM.name)).toBeVisible();
    const deliveryLabel = page.getByText("Delivery", { exact: true });
    const deliveryValue = deliveryLabel.locator("xpath=following-sibling::span[1]");
    await expect(deliveryValue).toHaveText(/free/i);
  });

  test("placing an order without filling the address form surfaces field-level validation errors", async ({ page }) => {
    // lib/checkout-validation.ts validateAddress() runs client-side, before
    // any network call — handlePlaceOrder() returns early on failure, so
    // this is fully exercisable without a backend. The button must still be
    // enabled to click, hence the Razorpay stub.
    await mockRazorpaySuccess(page);
    await seedMangoCart(page, [SAMPLE_ITEM]);
    // Seed a blank address. NOTE: name/phone won't stay blank — StoreCheckoutClient
    // unconditionally re-syncs them from the signed-in profile on mount
    // (`updateStoreAddress({ name: user.full_name, phone: user.phone })`), so
    // those two fields are deliberately NOT asserted as "required" here; only
    // the fields that effect doesn't touch will still be empty at submit time.
    await seedDeliveryAddress(page, {
      name: "", phone: "", line1: "", city: "", state: "", pincode: "",
    });
    await page.goto("/checkout/store");

    await expect(page.getByText(SAMPLE_ITEM.name)).toBeVisible();
    const placeOrderButton = page.getByRole("button", { name: /place order/i });
    await placeOrderButton.click();

    await expect(page.getByText("Street address is required")).toBeVisible();
    await expect(page.getByText("Locality/Area is required")).toBeVisible();
    await expect(page.getByText("City is required")).toBeVisible();
    await expect(page.getByText("Enter a valid 6-digit pincode")).toBeVisible();
  });

  test("an invalid Indian mobile number is rejected by address validation", async ({ page }) => {
    // Seeding an invalid phone via localStorage alone isn't enough: the same
    // profile-sync effect described above overwrites the phone field with
    // the (valid) signed-in user's number on mount. To genuinely exercise
    // the phone regex in lib/checkout-validation.ts, this test edits the
    // field live, the way a shopper correcting their number would.
    await mockRazorpaySuccess(page);
    await seedMangoCart(page, [SAMPLE_ITEM]);
    await seedDeliveryAddress(page, VALID_ADDRESS);
    await page.goto("/checkout/store");

    await expect(page.getByText(SAMPLE_ITEM.name)).toBeVisible();
    await page.locator("#phone").fill("12345"); // fails /^[6-9]\d{9}$/
    await page.getByRole("button", { name: /place order/i }).click();

    await expect(page.getByText("Enter a valid 10-digit Indian mobile number")).toBeVisible();
  });

  test("the State field accepts values from the Indian states list used across the app", async ({ page }) => {
    // types/checkout.ts exports INDIAN_STATES, the canonical list used
    // across address forms. The current AddressForm renders state as a
    // free-text Input (not a <Select>), so this asserts the field accepts
    // and reflects one of the canonical state names rather than asserting
    // on select options.
    await seedMangoCart(page, [SAMPLE_ITEM]);
    await seedDeliveryAddress(page, VALID_ADDRESS);
    await page.goto("/checkout/store");

    await expect(page.getByText(SAMPLE_ITEM.name)).toBeVisible();
    const stateInput = page.locator("#state");
    await expect(stateInput).toHaveValue("Andhra Pradesh");
  });

  test("the Place Order button stays disabled while the Razorpay script has not loaded", async ({ page }) => {
    // hooks/use-razorpay.ts: `loaded` starts false and the button is
    // `disabled={loading || !razorpayLoaded}`. Blocking checkout.js keeps
    // `window.Razorpay` undefined so `loaded` never flips true.
    await blockRazorpayScript(page);
    await seedMangoCart(page, [SAMPLE_ITEM]);
    await seedDeliveryAddress(page, VALID_ADDRESS);
    await page.goto("/checkout/store");

    await expect(page.getByText(SAMPLE_ITEM.name)).toBeVisible();
    const placeOrderButton = page.getByRole("button", { name: /place order/i });
    await expect(placeOrderButton).toBeDisabled();

    // The hook gives up polling after 15s (see use-razorpay.ts) — this test
    // does not sleep for the full real-time timeout; it only asserts the
    // immediate, deterministic "not yet loaded" state, which is the
    // regression-prone part of this behaviour.
  });
});
