// tests/admin/login-mfa.spec.ts
//
// ── Mocking approach (read this before touching assertions) ────────────────
// app/(admin)/admin/(admin-auth)/login/page.tsx does ALL of its work with the
// BROWSER Supabase client (`createClient()` from utils/supabase/client.ts) —
// signInWithOtp, verifyOtp, mfa.enroll/challenge/verify/listFactors, and the
// `profiles.role` lookup are all fetch calls the browser makes directly. That
// means, unlike every other page in app/(admin)/**, this page's entire OTP +
// TOTP MFA flow CAN be faithfully driven end-to-end with `page.route()` stubs
// — no server-side mocking gap here. See tests/admin/helpers/mock-admin-auth.ts
// for the shared stub helpers and a longer explanation of why the OTHER admin
// spec files can't do this.
//
// The one thing we deliberately do NOT stub is the final "land on /admin"
// step: `generateRecoveryCodes` / `redeemRecoveryCode` (actions/admin-mfa.actions.ts)
// and the `/admin` route itself are gated server-side (requireAdmin() /
// proxy.ts), which really does run against this environment's configured
// Supabase project. Since there is no real logged-in admin, those real calls
// deterministically fail/redirect — which is itself useful, observable
// behaviour we assert on directly instead of faking.

import { test, expect } from "@playwright/test";
import {
  stubTurnstile,
  mockSupabaseBrowserBackend,
  buildFakeSession,
  SUPABASE_URL,
} from "./helpers/mock-admin-auth";
import type { Page } from "@playwright/test";

const VALID_PHONE = "9876543210";

/** Mocks signInWithOtp (phone step -> otp step). */
async function mockSendOtp(page: Page) {
  await page.route(`${SUPABASE_URL}/auth/v1/otp`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  );
}

/**
 * Mocks verifyOtp to succeed, returning a session whose JWT/user shape drives
 * the page's post-verify branching (role check, then AAL routing) the same
 * way Supabase's real gotrue-js does: `currentLevel` comes from the JWT's
 * `aal` claim, `nextLevel` becomes "aal2" only if the returned user has a
 * verified TOTP factor.
 */
async function mockVerifyOtp(
  page: Page,
  opts: { role: "admin" | "user"; hasVerifiedFactor: boolean }
) {
  const session = buildFakeSession({ aal: "aal1" });
  const factors = opts.hasVerifiedFactor
    ? [{ id: "factor-1", status: "verified", factor_type: "totp" }]
    : [];
  await page.route(`${SUPABASE_URL}/auth/v1/verify`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ...session, user: { ...session.user, factors } }),
    })
  );
  await mockSupabaseBrowserBackend(page, { role: opts.role, session });
  // getAuthenticatorAssuranceLevel() (auth-js GoTrueClient._getAuthenticatorAssuranceLevel)
  // computes nextLevel from a SEPARATE `GET /auth/v1/user` call's `user.factors`,
  // not from the /verify response above — mockSupabaseBrowserBackend's generic
  // stub doesn't include factors, so override it here or the app always takes
  // the "no verified factor" (enroll) branch regardless of hasVerifiedFactor.
  await page.route(`${SUPABASE_URL}/auth/v1/user`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ...session.user, factors }),
    })
  );
}

test.describe("Admin login — phone step", () => {
  test("renders the phone entry step by default", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
    await expect(page.getByPlaceholder("9876543210")).toBeVisible();
  });

  test("rejects an invalid mobile number before sending any code", async ({ page }) => {
    await stubTurnstile(page);
    await page.goto("/admin/login");
    await page.getByPlaceholder("9876543210").fill("123");
    await page.getByRole("button", { name: "Send OTP" }).click();
    await expect(page.getByText("Enter a valid 10-digit mobile number.")).toBeVisible();
    // Still on the phone step — no request should have advanced us forward.
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  });

  test("blocks sending when the captcha has not been solved yet", async ({ page }) => {
    // autoVerify: false — a widget that rendered but the visitor never solved.
    await stubTurnstile(page, { autoVerify: false });
    await page.goto("/admin/login");
    await page.getByPlaceholder("9876543210").fill(VALID_PHONE);
    await page.getByRole("button", { name: "Send OTP" }).click();
    await expect(
      page.getByText("Verifying you're human — one moment, then try again.")
    ).toBeVisible();
  });

  test("advances to the OTP step once the code is sent", async ({ page }) => {
    await stubTurnstile(page);
    await mockSendOtp(page);
    await page.goto("/admin/login");
    await page.getByPlaceholder("9876543210").fill(VALID_PHONE);
    await page.getByRole("button", { name: "Send OTP" }).click();
    await expect(page.getByRole("heading", { name: "Verify" })).toBeVisible();
    await expect(page.getByText(/Code sent to/i)).toBeVisible();
  });
});

test.describe("Admin login — OTP verification", () => {
  async function goToOtpStep(page: Page) {
    await stubTurnstile(page);
    await mockSendOtp(page);
    await page.goto("/admin/login");
    await page.getByPlaceholder("9876543210").fill(VALID_PHONE);
    await page.getByRole("button", { name: "Send OTP" }).click();
    await expect(page.getByRole("heading", { name: "Verify" })).toBeVisible();
  }

  test("shows an error and stays put on an invalid/expired code", async ({ page }) => {
    await goToOtpStep(page);
    await page.route(`${SUPABASE_URL}/auth/v1/verify`, (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error_code: "otp_expired", msg: "Token has expired or is invalid" }),
      })
    );
    await page.getByPlaceholder("••••••").fill("000000");
    await page.getByRole("button", { name: "Verify" }).click();
    // Supabase's real error message is "Token has expired or is invalid" —
    // the toast surfaces error.message verbatim (see login/page.tsx catch
    // block), so match that exact wording rather than a paraphrase.
    await expect(page.getByText(/token has expired or is invalid/i)).toBeVisible();
  });

  test("denies access and does not proceed to MFA for a non-admin profile", async ({ page }) => {
    await goToOtpStep(page);
    await mockVerifyOtp(page, { role: "user", hasVerifiedFactor: false });
    await page.getByPlaceholder("••••••").fill("123456");
    await page.getByRole("button", { name: "Verify" }).click();
    await expect(page.getByText("Access denied: administrative privileges required.")).toBeVisible();
    // Never reaches an MFA step.
    await expect(page.getByRole("heading", { name: "Two-Factor" })).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Set Up Authenticator" })).not.toBeVisible();
  });

  test("routes an admin with an existing authenticator to the MFA challenge step", async ({ page }) => {
    await goToOtpStep(page);
    await mockVerifyOtp(page, { role: "admin", hasVerifiedFactor: true });
    await page.route(`${SUPABASE_URL}/auth/v1/factors**`, (route) => {
      if (route.request().method() !== "GET") return route.fallback();
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          totp: [{ id: "factor-1", status: "verified", factor_type: "totp" }],
          all: [{ id: "factor-1", status: "verified", factor_type: "totp" }],
        }),
      });
    });
    await page.getByPlaceholder("••••••").fill("123456");
    await page.getByRole("button", { name: "Verify" }).click();
    await expect(page.getByRole("heading", { name: "Two-Factor" })).toBeVisible();
    await expect(page.getByText("Lost your authenticator?")).toBeVisible();
  });

  test("routes an admin with no authenticator yet to the enrolment (QR) step", async ({ page }) => {
    await goToOtpStep(page);
    await mockVerifyOtp(page, { role: "admin", hasVerifiedFactor: false });
    await page.route(`${SUPABASE_URL}/auth/v1/factors**`, (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ totp: [], all: [] }),
        });
      }
      // POST — mfa.enroll()
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "new-factor-1",
          type: "totp",
          totp: {
            qr_code: "data:image/svg+xml;base64,PHN2Zy8+", // tiny inline placeholder
            secret: "AAAAAAAAAAAAAAAA",
            uri: "otpauth://totp/TreeKart:admin?secret=AAAAAAAAAAAAAAAA",
          },
        }),
      });
    });
    await page.getByPlaceholder("••••••").fill("123456");
    await page.getByRole("button", { name: "Verify" }).click();
    await expect(page.getByRole("heading", { name: "Set Up Authenticator" })).toBeVisible();
    await expect(page.getByAltText("Authenticator QR code")).toBeVisible();
  });
});

test.describe("Admin login — TOTP challenge and recovery", () => {
  async function goToMfaChallenge(page: Page) {
    await stubTurnstile(page);
    await mockSendOtp(page);
    await page.goto("/admin/login");
    await page.getByPlaceholder("9876543210").fill(VALID_PHONE);
    await page.getByRole("button", { name: "Send OTP" }).click();
    await mockVerifyOtp(page, { role: "admin", hasVerifiedFactor: true });
    await page.route(`${SUPABASE_URL}/auth/v1/factors**`, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          totp: [{ id: "factor-1", status: "verified", factor_type: "totp" }],
          all: [{ id: "factor-1", status: "verified", factor_type: "totp" }],
        }),
      })
    );
    await page.getByPlaceholder("••••••").fill("123456");
    await page.getByRole("button", { name: "Verify" }).click();
    await expect(page.getByRole("heading", { name: "Two-Factor" })).toBeVisible();
  }

  test("shows an error on an incorrect authenticator code and stays on the challenge", async ({ page }) => {
    await goToMfaChallenge(page);
    await page.route(`${SUPABASE_URL}/auth/v1/factors/*/challenge`, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "challenge-1" }) })
    );
    await page.route(`${SUPABASE_URL}/auth/v1/factors/*/verify`, (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error_code: "mfa_verification_failed", msg: "Invalid TOTP code entered" }),
      })
    );
    await page.getByPlaceholder("••••••").fill("000000");
    await page.getByRole("button", { name: "Verify & Enter" }).click();
    await expect(page.getByText(/Incorrect authenticator code|Invalid TOTP/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Two-Factor" })).toBeVisible();
  });

  test("a correct TOTP code is accepted client-side, but the real AAL2 gate still bounces back to /admin/login", async ({ page }) => {
    // This is the key "recovery codes / a passed client step do NOT themselves
    // grant a real AAL2 session" property from CLAUDE.md, demonstrated for
    // real rather than mocked: the mfa.verify() call below is stubbed to
    // succeed (proving the UI reacts correctly to a good code), but nothing
    // in this environment can forge the real server-side session proxy.ts
    // checks. So `router.push('/admin')` genuinely round-trips through the
    // real middleware and bounces back here.
    await goToMfaChallenge(page);
    await page.route(`${SUPABASE_URL}/auth/v1/factors/*/challenge`, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "challenge-1" }) })
    );
    await page.route(`${SUPABASE_URL}/auth/v1/factors/*/verify`, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ access_token: "x" }) })
    );
    await page.getByPlaceholder("••••••").fill("123456");
    await page.getByRole("button", { name: "Verify & Enter" }).click();
    await expect(page.getByText("Welcome back, Administrator.")).toBeVisible();
    await page.waitForURL("**/admin/login");
  });

  test("'Lost your authenticator?' opens the recovery-code step", async ({ page }) => {
    await goToMfaChallenge(page);
    await page.getByText("Lost your authenticator?").click();
    await expect(page.getByRole("heading", { name: "Recovery" })).toBeVisible();
    await expect(page.getByPlaceholder("XXXXX-XXXXX")).toBeVisible();
  });

  test("redeeming a recovery code without a real admin session is rejected and does not grant entry", async ({ page }) => {
    // redeemRecoveryCode (actions/admin-mfa.actions.ts) is a Server Action —
    // it is NOT mocked here (see the file banner). It runs for real and its
    // own `requireAdminSession()` guard fails because no genuine Supabase
    // session exists in this browser context, so it deterministically
    // returns `{ success: false }`. This is exactly the documented behaviour
    // that a recovery code alone (or here, no session at all) must never be
    // sufficient to reach the dashboard.
    await goToMfaChallenge(page);
    await page.getByText("Lost your authenticator?").click();
    await page.getByPlaceholder("XXXXX-XXXXX").fill("ABCDE-FGHJK");
    await page.getByRole("button", { name: "Use Recovery Code" }).click();
    await expect(page.getByText("That recovery code is not valid.")).toBeVisible();
    // Still parked on the recovery step — it did not advance to enrolment or /admin.
    await expect(page.getByRole("heading", { name: "Recovery" })).toBeVisible();
    expect(page.url()).toContain("/admin/login");
  });
});
