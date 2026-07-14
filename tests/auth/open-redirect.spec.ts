import { test, expect } from "@playwright/test";
import { safeRedirect } from "@/lib/safe-redirect";

// Security-relevant edge case: `redirectTo` on /auth/signin (and the proxy's
// own redirectToSignin helper) is attacker-controlled query-string input.
// lib/safe-redirect.ts is the single guard standing between that input and an
// open redirect / phishing handoff (`/auth/signin?redirectTo=https://evil.com`
// must never bounce a freshly-authenticated user off our origin).
//
// Two layers are covered here:
//   1. Direct, dependency-free unit tests of safeRedirect() itself, covering
//      the full range of bypass attempts (absolute URLs, protocol-relative
//      `//evil.com`, backslash variants, embedded credentials, etc). This
//      needs no browser and no auth, so it's exhaustive and fully
//      deterministic.
//   2. A browser-level sanity check that loading /auth/signin with a
//      malicious redirectTo never itself causes navigation away from our
//      origin.
//
// NOT covered end-to-end here: the *authenticated* branch of
// app/(storefront)/auth/signin/page.tsx (`if (user?.full_name) redirect(redirectTo)`)
// and the post-verifyOtp client-side `router.push(redirectTo)` in
// PhoneOtpForm both consume the already-sanitized value — but reaching them
// requires a real signed-in session (or Supabase-verified JWT in a cookie),
// which this environment cannot forge. The unit tests below fully exercise
// the sanitization logic those call sites depend on; only the "is the
// sanitized value passed through unchanged" wiring is left unverified.

test.describe("safeRedirect() — unit", () => {
    const attacks: Array<[string, string]> = [
        ["absolute http URL", "http://evil.com"],
        ["absolute https URL", "https://evil.com"],
        ["absolute https URL with path", "https://evil.com/auth/signin"],
        ["protocol-relative URL", "//evil.com"],
        ["protocol-relative URL with path", "//evil.com/steal"],
        ["backslash variant of protocol-relative", "/\\evil.com"],
        ["double backslash", "\\\\evil.com"],
        ["userinfo smuggling", "https://user:pass@evil.com"],
        ["javascript protocol", "javascript:alert(1)"],
        ["data protocol", "data:text/html,<script>alert(1)</script>"],
        ["no leading slash", "evil.com"],
        ["no leading slash, path-like", "evil.com/account"],
        ["tab-smuggled protocol-relative (WHATWG URL strips control chars)", "/\t/evil.com"],
    ];

    for (const [label, payload] of attacks) {
        test(`rejects ${label} and falls back to default`, () => {
            expect(safeRedirect(payload)).toBe("/");
        });

        test(`rejects ${label} and falls back to a custom fallback`, () => {
            expect(safeRedirect(payload, "/account")).toBe("/account");
        });
    }

    test("falls back to default for null", () => {
        expect(safeRedirect(null)).toBe("/");
    });

    test("falls back to default for undefined", () => {
        expect(safeRedirect(undefined)).toBe("/");
    });

    test("falls back to default for empty string", () => {
        expect(safeRedirect("")).toBe("/");
    });

    test("accepts a plain root-relative path", () => {
        expect(safeRedirect("/account")).toBe("/account");
    });

    test("accepts a root-relative path with query and hash", () => {
        expect(safeRedirect("/checkout?step=address#top")).toBe(
            "/checkout?step=address#top"
        );
    });

    test("accepts a nested root-relative path", () => {
        expect(safeRedirect("/account/orders/123")).toBe("/account/orders/123");
    });

    test("single leading slash followed by non-slash is never treated as protocol-relative", () => {
        expect(safeRedirect("/evil.com")).toBe("/evil.com");
    });
});

test.describe("open redirect — /auth/signin query param", () => {
    test("loading /auth/signin with an absolute-URL redirectTo never navigates off-origin", async ({
        page,
    }) => {
        const origin = new URL(test.info().project.use.baseURL ?? "http://localhost:3000")
            .origin;

        await page.goto(
            `/auth/signin?redirectTo=${encodeURIComponent("https://evil.com/phish")}`
        );

        // Regardless of auth state, the page load itself must never hand the
        // browser off to the attacker's origin.
        expect(new URL(page.url()).origin).toBe(origin);
        await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
    });

    test("loading /auth/signin with a protocol-relative redirectTo never navigates off-origin", async ({
        page,
    }) => {
        const origin = new URL(test.info().project.use.baseURL ?? "http://localhost:3000")
            .origin;

        await page.goto(
            `/auth/signin?redirectTo=${encodeURIComponent("//evil.com/phish")}`
        );

        expect(new URL(page.url()).origin).toBe(origin);
        await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
    });

    test("a benign relative redirectTo does not break the sign-in page", async ({ page }) => {
        await page.goto(`/auth/signin?redirectTo=${encodeURIComponent("/account")}`);
        await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
    });
});
