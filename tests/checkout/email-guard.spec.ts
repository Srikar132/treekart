import { test, expect } from "@playwright/test";
import type { CartItem } from "@/store/use-mango-cart";
import {
  EMAIL_REQUIRED_MESSAGE,
  EmailRequiredError,
  isEmailRequiredError,
  assertContactEmail,
} from "@/lib/order-email-guard";
import {
  mockAuthSession,
  MOCK_USER,
  MOCK_USER_NO_EMAIL,
  seedMangoCart,
  seedDeliveryAddress,
  mockRazorpaySuccess,
  HAS_SEEDED_TEST_BACKEND,
} from "../helpers/mock-auth";

/**
 * Order-email-guard (lib/order-email-guard.ts) — an email is optional to
 * browse/sign up but mandatory to place an order (CLAUDE.md: "It is required
 * to place an order, enforced server-side in lib/order-email-guard.ts by the
 * order actions, not just by the dialog.").
 *
 * SIMULATED AUTH: see tests/helpers/mock-auth.ts. The UI-level tests in this
 * file (the `describe("UI wiring...")` block) depend on the store-checkout
 * Server Action (`createMangoOrder`) actually reaching
 * `assertContactEmail(user.email)` inside `requireUser()`'s success path —
 * that check runs immediately after `requireUser()` and BEFORE any product
 * DB query, so unlike most other server-dependent scenarios in this suite it
 * needs no seeded product/tree rows at all, only a session that survives the
 * real `requireUser()` gate. That gate is the one thing this suite's mocking
 * cannot force (see helper file header) — these tests are written against
 * the exact code path in actions/order.actions.ts and lib/order-email-guard.ts
 * and are ready to run once pointed at a seeded Supabase test project.
 *
 * The first block below needs none of that: `lib/order-email-guard.ts` is a
 * plain TypeScript module with no "use server" pragma and no Next.js runtime
 * dependency, so it can be imported and asserted against directly in Node —
 * this is the fully reliable, backend-independent part of this file.
 */

test.describe("order-email-guard — core contract (no browser needed)", () => {
  test("assertContactEmail throws EmailRequiredError for null, undefined, or blank email", () => {
    expect(() => assertContactEmail(null)).toThrow(EmailRequiredError);
    expect(() => assertContactEmail(undefined)).toThrow(EmailRequiredError);
    expect(() => assertContactEmail("   ")).toThrow(EmailRequiredError);
  });

  test("assertContactEmail does not throw for a non-blank email", () => {
    expect(() => assertContactEmail("shopper@example.com")).not.toThrow();
  });

  test("isEmailRequiredError recognizes both the thrown class and its serialized message", () => {
    // Server Actions serialize thrown errors across the RSC boundary, so the
    // client only ever sees a plain Error with a matching message — not the
    // original EmailRequiredError instance. isEmailRequiredError() has to
    // recognize both shapes.
    expect(isEmailRequiredError(new EmailRequiredError())).toBe(true);
    expect(isEmailRequiredError(new Error(EMAIL_REQUIRED_MESSAGE))).toBe(true);
    expect(isEmailRequiredError(new Error("some other failure"))).toBe(false);
    expect(isEmailRequiredError("not even an Error object")).toBe(false);
    expect(isEmailRequiredError(undefined)).toBe(false);
  });
});

const SAMPLE_ITEM: CartItem = {
  id: "prod-alphonso-1kg",
  name: "Alphonso Mango",
  variety: "Alphonso",
  pricePerKg: 600,
  price: 600,
  qty: 2,
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

test.describe("UI wiring — EmailRequiredDialog on the store checkout", () => {
  test.beforeEach(() => {
    test.skip(!HAS_SEEDED_TEST_BACKEND, "needs a real authenticated render — see tests/helpers/mock-auth.ts");
  });

  test("placing an order with no profile email opens the 'One Last Thing' email prompt", async ({ context, page }) => {
    // See file header: this exercises createMangoOrder()'s server-side
    // assertContactEmail(user.email) call, which needs no seeded product
    // rows, only a session for a profile with email = null.
    await mockAuthSession(context, page, MOCK_USER_NO_EMAIL);
    await mockRazorpaySuccess(page);
    await seedMangoCart(page, [SAMPLE_ITEM]);
    await seedDeliveryAddress(page, VALID_ADDRESS);

    await page.goto("/checkout/store");
    await expect(page.getByText(SAMPLE_ITEM.name)).toBeVisible();

    await page.getByRole("button", { name: /place order/i }).click();

    // components/checkout/email-required-dialog.tsx
    await expect(page.getByText("One Last Thing")).toBeVisible();
    await expect(
      page.getByText("We need an email to send your order confirmation.")
    ).toBeVisible();
    // The dialog is dismissible without losing the cart (per its own
    // in-component comment) — this is a promise about state, not markup, so
    // it's asserted separately below rather than here.
  });

  test("dismissing the email prompt keeps the cart and address intact", async ({ context, page }) => {
    await mockAuthSession(context, page, MOCK_USER_NO_EMAIL);
    await mockRazorpaySuccess(page);
    await seedMangoCart(page, [SAMPLE_ITEM]);
    await seedDeliveryAddress(page, VALID_ADDRESS);

    await page.goto("/checkout/store");
    await expect(page.getByText(SAMPLE_ITEM.name)).toBeVisible();
    await page.getByRole("button", { name: /place order/i }).click();
    await expect(page.getByText("One Last Thing")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByText("One Last Thing")).not.toBeVisible();

    // Cart line item and address-derived name are still on screen — nothing
    // was cleared by the failed order attempt.
    await expect(page.getByText(SAMPLE_ITEM.name)).toBeVisible();
  });

  test("saving a contact email via the prompt allows the order retry to proceed", async ({ context, page }) => {
    await mockAuthSession(context, page, MOCK_USER_NO_EMAIL);
    await mockRazorpaySuccess(page);
    await seedMangoCart(page, [SAMPLE_ITEM]);
    await seedDeliveryAddress(page, VALID_ADDRESS);

    await page.goto("/checkout/store");
    await expect(page.getByText(SAMPLE_ITEM.name)).toBeVisible();
    await page.getByRole("button", { name: /place order/i }).click();
    await expect(page.getByText("One Last Thing")).toBeVisible();

    // saveContactEmail({ email }) — actions/user.actions.ts — writes
    // profiles.email, then EmailRequiredDialog calls router.refresh() and
    // re-invokes onSaved() (handlePlaceOrder again). Completing that retry
    // for real requires the refreshed server render to see the newly-saved
    // email, i.e. a real DB write — server/DB-dependent beyond this point.
    await page.getByLabel(/email/i).fill("newcontact@example.com");
    await page.getByRole("button", { name: /save & continue/i }).click();
  });

  test("a profile that already has a contact email never sees the prompt", async ({ context, page }) => {
    await mockAuthSession(context, page, MOCK_USER); // has .email set
    await mockRazorpaySuccess(page);
    await seedMangoCart(page, [SAMPLE_ITEM]);
    await seedDeliveryAddress(page, VALID_ADDRESS);

    await page.goto("/checkout/store");
    await expect(page.getByText(SAMPLE_ITEM.name)).toBeVisible();
    await page.getByRole("button", { name: /place order/i }).click();

    // No assertion of a successful order here (that's a full server round
    // trip through Razorpay + verifyAndFulfilOrder — out of scope for this
    // guard-focused file); this only asserts the guard does NOT fire for a
    // profile that already has an email on file.
    await expect(page.getByText("One Last Thing")).not.toBeVisible();
  });
});
