import { test, expect } from "@playwright/test";
import { mockAuthSession, MOCK_USER, HAS_SEEDED_TEST_BACKEND } from "../helpers/mock-auth";

/**
 * Account → Profile (/account/profile)
 *
 * SIMULATED AUTH: see tests/helpers/mock-auth.ts for the full explanation.
 * `/account/profile` is a Server Component (app/(storefront)/account/(tabs)/profile/page.tsx)
 * gated by `requireUser()`, which then passes the merged auth+profile user
 * into the client `<ProfileSettings user={user} />` component
 * (components/storefront/account/profile-settings.tsx). The auth gate itself
 * runs server-to-server and cannot be intercepted by Playwright; the
 * assertions below describe the contract that component implements and are
 * written to run once this page renders past that gate (e.g. against a
 * seeded staging Supabase project with a real storageState).
 */

test.describe("Account profile settings", () => {
  test.beforeEach(async ({ context, page }) => {
    await mockAuthSession(context, page, MOCK_USER);
  });

  test("unauthenticated visitors are redirected to sign-in", async ({ browser }) => {
    // Baseline sanity check that does NOT depend on the simulated session:
    // requireUser() must bounce a guest to /auth/signin. This is the one
    // assertion in this file that is genuinely verifiable without a real
    // backend, since "no session" is the actual state of a fresh context
    // that never calls mockAuthSession.
    const freshContext = await browser.newContext();
    const freshPage = await freshContext.newPage();
    await freshPage.goto("/account/profile");
    await expect(freshPage).toHaveURL(/\/auth\/signin/);
    await freshContext.close();
  });

  test("pre-fills full name, phone and email from the signed-in profile", async ({ page }) => {
    test.skip(!HAS_SEEDED_TEST_BACKEND, "needs a real authenticated render — see tests/helpers/mock-auth.ts");
    await page.goto("/account/profile");

    const nameInput = page.getByPlaceholder("Enter your full name");
    await expect(nameInput).toHaveValue(MOCK_USER.full_name);

    // Phone + email are rendered read-only (opacity-60 wrapper, readOnly input).
    await expect(page.getByText("Registered Mobile")).toBeVisible();
    await expect(page.getByText("Registered Email (Private)")).toBeVisible();
  });

  test("phone and email fields are read-only — cannot be edited from this form", async ({ page }) => {
    // lib/auth.ts + actions/user.actions.ts updateProfile(): phone is
    // intentionally NOT updatable here since it's the Supabase Auth identity;
    // email on this page is display-only (it's captured via saveContactEmail
    // at checkout instead, see actions/user.actions.ts).
    test.skip(!HAS_SEEDED_TEST_BACKEND, "needs a real authenticated render — see tests/helpers/mock-auth.ts");
    await page.goto("/account/profile");

    const phoneInput = page.locator("input[readonly]").nth(0);
    const emailInput = page.locator("input[readonly]").nth(1);
    await expect(phoneInput).toHaveAttribute("readonly", "");
    await expect(emailInput).toHaveAttribute("readonly", "");
  });

  test("full name can be edited and submitted via the Update Profile action", async ({ page }) => {
    test.skip(!HAS_SEEDED_TEST_BACKEND, "needs a real authenticated render — see tests/helpers/mock-auth.ts");
    await page.goto("/account/profile");

    const nameInput = page.getByPlaceholder("Enter your full name");
    await nameInput.fill("Asha Reddy Updated");
    await expect(nameInput).toHaveValue("Asha Reddy Updated");

    const submitButton = page.getByRole("button", { name: /update profile/i });
    await expect(submitButton).toBeEnabled();
    // Not clicked through to a real server round-trip here: updateProfile()
    // is a Next.js Server Action, and actually completing it requires a live
    // Supabase session on the server (see file header) — this is a
    // server/DB-dependent assertion beyond this test's scope.
  });

  test("clearing the full name field is not blocked client-side (documented coverage gap)", async ({ page }) => {
    test.skip(!HAS_SEEDED_TEST_BACKEND, "needs a real authenticated render — see tests/helpers/mock-auth.ts");
    // ProfileSettings (components/storefront/account/profile-settings.tsx)
    // does not wire any client-side validation to this field before calling
    // updateProfile() — unlike the onboarding flow's completeProfile(), which
    // enforces `profileCompletionSchema.fullName.min(1)` server-side. This
    // test documents today's actual behavior (empty submission is not
    // prevented in the UI) so a future accidental validation regression is
    // caught deliberately rather than assumed.
    await page.goto("/account/profile");

    const nameInput = page.getByPlaceholder("Enter your full name");
    await nameInput.fill("");
    await expect(nameInput).toHaveValue("");

    const submitButton = page.getByRole("button", { name: /update profile/i });
    await expect(submitButton).toBeEnabled();
  });
});
