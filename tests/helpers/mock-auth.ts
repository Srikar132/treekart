import type { BrowserContext, Page } from "@playwright/test";
import type { CartItem } from "@/store/use-mango-cart";
import type { DeliveryAddress } from "@/types/checkout";
import type { SelectedRentalPlan } from "@/store/use-rental-store";

/**
 * ============================================================================
 * SIMULATED AUTH — read this before writing/trusting any spec that imports it
 * ============================================================================
 * TreeKart is phone + OTP only (lib/auth.ts, CLAUDE.md) — there is no
 * email/password path, and this environment has no live OTP/SMS credentials,
 * so a *real* sign-in cannot be scripted from Playwright.
 *
 * Every route under /account and /checkout is gated by `requireUser()`
 * (lib/auth.ts). That guard runs INSIDE a Next.js Server Component and calls
 * `supabase.auth.getUser()`, which — by design, for security — round-trips to
 * the Supabase Auth server directly from the Next.js *server process*, not
 * from the browser tab Playwright drives. `page.route()` / `context.route()`
 * only intercept requests dispatched by the browser page itself, so they
 * cannot see or fake that server-to-Supabase call, and this codebase has no
 * test-only auth bypass wired into the app.
 *
 * Given that hard constraint, `mockAuthSession()` below is a best-effort
 * simulation with three layers:
 *
 *   1. `context.addCookies()` seeds Supabase-shaped session cookies so any
 *      CLIENT component that talks to Supabase directly (a browser client)
 *      sees what looks like a live session.
 *   2. `page.route()` intercepts the Supabase Auth/REST host and answers with
 *      a canned `auth.users` + `profiles` row, mirroring the merge that
 *      `getUser()` performs in lib/auth.ts.
 *   3. Zustand-persisted client stores (mango cart / rental selection /
 *      delivery address) are seeded straight into `localStorage` via
 *      `page.addInitScript()`. This layer is NOT a mock — these stores really
 *      do hydrate from localStorage on load, so seeding it drives genuine,
 *      unmocked client-side behaviour (cart totals, the free-delivery
 *      threshold, address prefill, etc).
 *
 * NET EFFECT: specs that depend on data a Next.js Server Component fetched
 * from the real DB (order history rows, rental rows, one order's full detail)
 * are written against the documented/expected contract, and each such
 * assertion is commented at the call site as "server/DB-dependent — needs a
 * seeded Supabase project to assert against live output." Specs that exercise
 * CLIENT-SIDE logic (Zustand stores, form validation, the Razorpay hook,
 * hydration guards) are exercised for real, because that JS runs in the
 * browser regardless of how the page's initial HTML was produced.
 *
 * To point this suite at a real backend later: seed a staging Supabase
 * project, capture a genuine `storageState` from a real OTP login, and swap
 * `mockAuthSession()` for `test.use({ storageState })` — call sites here are
 * deliberately kept to a single import so that swap is one-line per file.
 * ============================================================================
 */

/**
 * Every test that needs a *real* server-rendered authenticated page (order
 * history rows, profile prefill, cart-checkout redirects, the email-guard
 * dialog, etc.) hits the wall described above: requireUser() redirects to
 * /auth/signin regardless of the client-side mocking this file does. Rather
 * than leave those as false failures, they're gated behind this flag — off
 * by default (skipped, not falsely passing/failing) until a seeded Supabase
 * test project (or a middleware test-bypass) exists for the dev server these
 * tests run against. Mirrors admin's `PLAYWRIGHT_ADMIN_BACKEND` (see
 * tests/admin/helpers/mock-admin-auth.ts) — flip on with
 * `PLAYWRIGHT_TEST_BACKEND=1` once that's wired up.
 */
export const HAS_SEEDED_TEST_BACKEND = process.env.PLAYWRIGHT_TEST_BACKEND === "1";

export interface MockProfile {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  role: "user" | "farmer" | "admin";
  avatar_url?: string | null;
}

/** Default simulated signed-in user — has a contact email on file. */
export const MOCK_USER: MockProfile = {
  id: "00000000-0000-4000-8000-000000000001",
  full_name: "Asha Reddy",
  phone: "+919876543210",
  email: "asha.reddy@example.com",
  role: "user",
  avatar_url: null,
};

/** Same identity, but with no contact email — for the order-email-guard specs. */
export const MOCK_USER_NO_EMAIL: MockProfile = {
  ...MOCK_USER,
  id: "00000000-0000-4000-8000-000000000002",
  email: null,
};

const SUPABASE_HOST_PATTERN = /supabase\.co|127\.0\.0\.1:54321|localhost:54321/;

/**
 * Applies the best-effort simulated session described above. Call this
 * before `page.goto(...)` in each test (or in a `beforeEach`).
 */
export async function mockAuthSession(
  context: BrowserContext,
  page: Page,
  profile: MockProfile = MOCK_USER
) {
  await context.addCookies([
    {
      name: "sb-access-token",
      value: "e2e-mock-access-token",
      url: "http://localhost:3000",
    },
    {
      name: "sb-refresh-token",
      value: "e2e-mock-refresh-token",
      url: "http://localhost:3000",
    },
  ]);

  // Best-effort interception of any browser-issued Supabase Auth/REST calls
  // (e.g. from a client-side Supabase client). Does NOT reach the server-side
  // requireUser() call — see file header.
  await page.route(SUPABASE_HOST_PATTERN, async (route) => {
    const url = route.request().url();

    if (url.includes("/auth/v1/user")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: profile.id,
          phone: profile.phone,
          created_at: new Date().toISOString(),
        }),
      });
    }

    if (url.includes("/rest/v1/profiles")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            full_name: profile.full_name,
            role: profile.role,
            avatar_url: profile.avatar_url ?? null,
            phone: profile.phone,
            email: profile.email,
          },
        ]),
      });
    }

    return route.continue();
  });
}

// ── Zustand localStorage seeding ────────────────────────────────────────────
// These mirror each store's `persist` config (name + partialize) exactly —
// see store/use-mango-cart.ts, store/use-rental-store.ts,
// store/use-delivery-address.ts. This is real state, not a network mock.

export async function seedMangoCart(page: Page, items: CartItem[]) {
  await page.addInitScript((itemsJson) => {
    window.localStorage.setItem(
      "treekart-mango-cart",
      JSON.stringify({ state: { items: JSON.parse(itemsJson) }, version: 0 })
    );
  }, JSON.stringify(items));
}

export async function seedDeliveryAddress(page: Page, address: Partial<DeliveryAddress>) {
  await page.addInitScript((addressJson) => {
    window.localStorage.setItem(
      "treekart-delivery-address",
      JSON.stringify({ state: { address: JSON.parse(addressJson) }, version: 0 })
    );
  }, JSON.stringify(address));
}

export async function seedRentalSelection(page: Page, plan: SelectedRentalPlan) {
  await page.addInitScript((planJson) => {
    window.localStorage.setItem(
      "treekart-rental-selection",
      JSON.stringify({ state: { selectedPlan: JSON.parse(planJson) }, version: 0 })
    );
  }, JSON.stringify(plan));
}

// ── Razorpay mocking ─────────────────────────────────────────────────────
// hooks/use-razorpay.ts polls `window.Razorpay` every 500ms for up to 15s.
// Real Razorpay checkout.js is never loaded in these tests — see
// app layout's <Script> tag for where it'd normally come from.

/**
 * Installs a fake `window.Razorpay` constructor whose `.open()` immediately
 * (asynchronously) invokes the success handler with a deterministic payment
 * payload. Use for the "happy path" checkout tests.
 *
 * Also blocks the real checkout.js request (see `blockRazorpayScript`) so
 * that, if this test environment genuinely has network access to Razorpay's
 * CDN, the real script can't load moments later and clobber `window.Razorpay`
 * with the real implementation — the stub must be the only thing that ever
 * defines that global.
 */
export async function mockRazorpaySuccess(page: Page) {
  await blockRazorpayScript(page);
  await page.addInitScript(() => {
    // @ts-expect-error - test-only global shim
    window.Razorpay = function RazorpayMock(options: {
      order_id: string;
      handler: (result: Record<string, string>) => void;
    }) {
      return {
        open: () => {
          setTimeout(() => {
            options.handler({
              razorpay_payment_id: "pay_mock_e2e",
              razorpay_order_id: options.order_id,
              razorpay_signature: "mock_signature_e2e",
            });
          }, 30);
        },
      };
    };
  });
}

/**
 * Installs a fake `window.Razorpay` whose `.open()` immediately fires the
 * modal's `onDismiss` callback — simulates the shopper closing the payment
 * modal without paying. Also blocks the real checkout.js request — see the
 * note on `mockRazorpaySuccess`.
 */
export async function mockRazorpayDismiss(page: Page) {
  await blockRazorpayScript(page);
  await page.addInitScript(() => {
    // @ts-expect-error - test-only global shim
    window.Razorpay = function RazorpayMock(options: {
      modal?: { ondismiss?: () => void };
    }) {
      return {
        open: () => {
          setTimeout(() => {
            options.modal?.ondismiss?.();
          }, 30);
        },
      };
    };
  });
}

/**
 * Blocks the real Razorpay checkout.js script from ever loading so
 * `window.Razorpay` is never defined. Exercises the 15s poll timeout /
 * "payment gateway is not ready" path in hooks/use-razorpay.ts. Tests using
 * this helper should not wait the full 15s in real time; instead assert the
 * button stays disabled or that `openRazorpay` throws when forced early.
 */
export async function blockRazorpayScript(page: Page) {
  await page.route(/checkout\.razorpay\.com/, (route) => route.abort());
}
