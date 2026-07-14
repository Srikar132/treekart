import { test, expect } from "@playwright/test";
import { mockNextAction, stubTurnstile } from "./utils/mock-next-action";

// /auth/signin hosts the ONE phone+OTP flow (sign-in and sign-up are the same
// flow — see app/(storefront)/auth/signup/page.tsx, which just redirects here).
// Real OTP delivery (MSG91 SMS via Supabase) and real Cloudflare Turnstile are
// not exercised: sending a real code costs money, is rate-limited by
// lib/arcjet.ts (otpSendAj: 5 per 10 minutes per phone), and needs a live
// secret we don't have here. Instead:
//   - Pure client-side behavior (input filtering, terms gate) needs no network
//     at all and is tested directly.
//   - The OTP-entry step is reached by seeding the `treekart-pending-phone`
//     sessionStorage key that PhoneOtpForm itself reads on mount to resume an
//     in-flight verification after a reload — this is the same mechanism the
//     app relies on, so it's a realistic way to land on that step without a
//     real sendOtp round trip.
//   - Where a real server-action round trip is unavoidable (verify failure
//     message, resend triggering a fresh send), we intercept the action call
//     via tests/auth/utils/mock-next-action.ts. See that file for why this is
//     possible and where it's fragile.

const PENDING_PHONE_KEY = "treekart-pending-phone";
const VALID_PHONE = "9876543210"; // matches /^[6-9]\d{9}$/ in lib/phone.ts

test.describe("Phone + OTP sign-in — phone step", () => {
    test("renders the sign-in heading and mobile number field", async ({ page }) => {
        await page.goto("/auth/signin");
        await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
        await expect(page.getByLabel("Mobile Number")).toBeVisible();
        // "+91" also appears in the footer's support phone link — scope to the
        // input's own country-code prefix rather than matching either.
        await expect(page.getByText("+91", { exact: true })).toBeVisible();
    });

    test("phone input strips non-digit characters as they're typed", async ({ page }) => {
        await page.goto("/auth/signin");
        const phoneInput = page.getByLabel("Mobile Number");
        await phoneInput.pressSequentially("98a76b543c210");
        // Letters are stripped in the onChange handler; digits beyond the
        // maxLength=10 attribute are truncated by the browser.
        await expect(phoneInput).toHaveValue("9876543210");
    });

    test("caps input at 10 digits even when more are typed", async ({ page }) => {
        await page.goto("/auth/signin");
        const phoneInput = page.getByLabel("Mobile Number");
        await phoneInput.pressSequentially("987654321099999");
        await expect(phoneInput).toHaveValue("9876543210");
    });

    test("blocks submission and shows an inline error when terms are not accepted", async ({
        page,
    }) => {
        await page.goto("/auth/signin");
        await page.getByLabel("Mobile Number").fill(VALID_PHONE);

        // Deliberately do NOT check the terms checkbox.
        await page.getByRole("button", { name: /send otp/i }).click();

        await expect(
            page.getByText(/accept the terms.*privacy policy to continue/i)
        ).toBeVisible();
        // Still on the phone step — no request should have been sent.
        await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
    });

    test("does not submit a network request when terms are unaccepted", async ({ page }) => {
        await page.goto("/auth/signin");
        await page.getByLabel("Mobile Number").fill(VALID_PHONE);

        let actionRequestFired = false;
        page.on("request", (req) => {
            if (req.method() === "POST" && req.headers()["next-action"]) {
                actionRequestFired = true;
            }
        });

        await page.getByRole("button", { name: /send otp/i }).click();
        await page.waitForTimeout(300);
        expect(actionRequestFired).toBe(false);
    });
});

test.describe("Phone + OTP sign-in — OTP step (reached via resumed session)", () => {
    // PhoneOtpForm restores `step: "otp"` from sessionStorage on mount so a
    // page reload mid-verification doesn't strand the user. Seeding that key
    // before navigation lets us exercise the OTP-entry UI deterministically,
    // without ever calling the real sendOtp action.
    async function gotoOtpStep(page: import("@playwright/test").Page, phone = "+919876543210") {
        // Resend/verify both gate on a real Turnstile token — stub the widget
        // so that gate isn't a source of flakiness for tests not about it.
        await stubTurnstile(page);
        await page.addInitScript(
            ({ key, value }: { key: string; value: string }) => {
                window.sessionStorage.setItem(key, value);
            },
            { key: PENDING_PHONE_KEY, value: phone }
        );
        await page.goto("/auth/signin");
    }

    test("shows the verify heading and the masked phone number", async ({ page }) => {
        await gotoOtpStep(page);
        await expect(page.getByRole("heading", { name: "Verify" })).toBeVisible();
        await expect(page.getByText("+91 98765 43210")).toBeVisible();
    });

    test("OTP input accepts only digits, up to 6", async ({ page }) => {
        await gotoOtpStep(page);
        const otpInput = page.getByLabel("6-Digit Code");
        await otpInput.pressSequentially("12a3b4c56789");
        await expect(otpInput).toHaveValue("123456");
    });

    test("Verify button stays disabled until a full 6-digit code is entered", async ({
        page,
    }) => {
        await gotoOtpStep(page);
        const verifyButton = page.getByRole("button", { name: /verify/i });
        const otpInput = page.getByLabel("6-Digit Code");

        await expect(verifyButton).toBeDisabled();
        await otpInput.fill("123");
        await expect(verifyButton).toBeDisabled();
        await otpInput.fill("123456");
        await expect(verifyButton).toBeEnabled();
    });

    test("resend button is immediately usable when no cooldown is in effect", async ({
        page,
    }) => {
        // Cooldown is component state (not persisted), so resuming via
        // sessionStorage lands with cooldown === 0 — a legitimate state (e.g.
        // the 30s window from an earlier send already elapsed before reload).
        await gotoOtpStep(page);
        const resendButton = page.getByRole("button", { name: /resend code/i });
        await expect(resendButton).toBeEnabled();
    });

    test("'Change number' clears the pending phone and returns to the phone step", async ({
        page,
    }) => {
        await gotoOtpStep(page);
        await page.getByRole("button", { name: /change number/i }).click();

        await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
        const stored = await page.evaluate(
            (key) => window.sessionStorage.getItem(key),
            PENDING_PHONE_KEY
        );
        expect(stored).toBeNull();
    });

    test.fixme(
        "resending starts the cooldown and disables the resend button",
        async ({ page }) => {
            // mockNextAction's route.fulfill leaves the client's action promise
            // permanently pending here (verified: byte-identical to a real
            // captured response, still never resolves) — see the "KNOWN BROKEN"
            // note in tests/auth/utils/mock-next-action.ts. Unblocking this needs
            // either a working interception strategy or a real Supabase-backed
            // send, not a test-side fix.
            await gotoOtpStep(page);

            await mockNextAction(page, { success: true, phone: "+919876543210" });
            await page.getByRole("button", { name: /resend code/i }).click();

            const resendButton = page.getByRole("button", { name: /resend in \d+s/i });
            await expect(resendButton).toBeVisible();
            await expect(resendButton).toBeDisabled();
        }
    );

    test.fixme(
        "renders the server's error message when verification fails",
        async ({ page }) => {
            // Same mockNextAction limitation as the resend test above.
            await gotoOtpStep(page);
            await page.getByLabel("6-Digit Code").fill("000000");

            await mockNextAction(page, {
                error: "That code is incorrect or has expired. Please try again.",
            });
            await page.getByRole("button", { name: /verify/i }).click();

            await expect(
                page.getByText("That code is incorrect or has expired. Please try again.")
            ).toBeVisible();
            // Still on the OTP step — a failed verify must not navigate away.
            await expect(page.getByRole("heading", { name: "Verify" })).toBeVisible();
        }
    );
});
