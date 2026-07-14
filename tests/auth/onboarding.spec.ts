import { test, expect } from "@playwright/test";
import { profileCompletionSchema } from "@/lib/validations";
import { mockNextAction } from "./utils/mock-next-action";

// Onboarding contract (see CLAUDE.md + actions/auth.actions.ts verifyOtp,
// lib/validations.ts profileCompletionSchema, components/storefront/auth/profile-dialog.tsx):
//   - Profile completeness is `full_name` ONLY.
//   - `email` is optional at onboarding — asked again, and required, at
//     checkout (lib/order-email-guard.ts), so a user who skips it here must
//     never be trapped in the dialog.
//
// The dialog's `open` prop is driven either by the server (SigninPage sets
// `startWithProfileDialog={!!user && !user.full_name}`, which needs a real,
// already-authenticated-but-incomplete session — not forgeable here) or by
// the client after a successful verifyOtp returns `needsProfile: true`. We
// exercise the latter: reach the OTP step via the sessionStorage-resume
// mechanism (same as tests/auth/signin-otp.spec.ts), then mock the verifyOtp
// action call itself. See tests/auth/utils/mock-next-action.ts for how and
// why that interception works, and its fragility (Next's internal Flight
// wire format for plain-value Server Action returns).

test.describe("profileCompletionSchema — unit", () => {
    test("accepts a full name with no email", () => {
        const result = profileCompletionSchema.safeParse({
            fullName: "Ravi Kumar",
            email: "",
        });
        expect(result.success).toBe(true);
    });

    test("accepts a full name with email omitted entirely", () => {
        const result = profileCompletionSchema.safeParse({ fullName: "Ravi Kumar" });
        expect(result.success).toBe(true);
    });

    test("rejects a missing full name even when email is present", () => {
        const result = profileCompletionSchema.safeParse({
            fullName: "",
            email: "ravi@example.com",
        });
        expect(result.success).toBe(false);
    });

    test("rejects a full name that is only whitespace", () => {
        const result = profileCompletionSchema.safeParse({
            fullName: "   ",
            email: "",
        });
        expect(result.success).toBe(false);
    });

    test("rejects a malformed email when one is provided", () => {
        const result = profileCompletionSchema.safeParse({
            fullName: "Ravi Kumar",
            email: "not-an-email",
        });
        expect(result.success).toBe(false);
    });
});

test.describe("onboarding dialog — client flow", () => {
    // All four tests below drive verifyOtp/completeProfile via mockNextAction,
    // which is confirmed broken against this Next 16.2.4 setup: a route.fulfill
    // body byte-identical to a real captured Server Action response still
    // leaves the client's action promise permanently pending (no error, it
    // just never resolves) — see the "KNOWN BROKEN" note in
    // tests/auth/utils/mock-next-action.ts. Kept as test.fixme rather than
    // deleted since the assertions themselves are correct and should be
    // re-enabled once that interception is fixed or replaced.
    async function resumeAtOtpStep(page: import("@playwright/test").Page) {
        await page.addInitScript(() => {
            window.sessionStorage.setItem("treekart-pending-phone", "+919876543210");
        });
        await page.goto("/auth/signin");
        await page.getByLabel("6-Digit Code").fill("123456");
    }

    test.fixme("appears immediately after verifyOtp reports needsProfile, without an email error", async ({
        page,
    }) => {
        await resumeAtOtpStep(page);

        await mockNextAction(page, { success: true, needsProfile: true, role: "user" });
        await page.getByRole("button", { name: /verify/i }).click();

        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();
        await expect(dialog.getByText("Almost There")).toBeVisible();
        await expect(dialog.getByLabel(/full name/i)).toBeVisible();

        // Email is present but explicitly marked optional, and no validation
        // error should be showing for it merely because it's empty.
        await expect(dialog.getByText(/email/i).first()).toBeVisible();
        await expect(dialog.getByText("(optional)")).toBeVisible();
        await expect(dialog.getByText(/enter a valid email address/i)).toHaveCount(0);
    });

    test.fixme("is not dismissible by pressing Escape (onboarding is mandatory)", async ({ page }) => {
        await resumeAtOtpStep(page);

        await mockNextAction(page, { success: true, needsProfile: true, role: "user" });
        await page.getByRole("button", { name: /verify/i }).click();

        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();

        await page.keyboard.press("Escape");
        await expect(dialog).toBeVisible();
    });

    test.fixme("submitting with only a full name (email left blank) proceeds without an email error", async ({
        page,
    }) => {
        await resumeAtOtpStep(page);

        await mockNextAction(page, { success: true, needsProfile: true, role: "user" });
        await page.getByRole("button", { name: /verify/i }).click();

        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();
        await dialog.getByLabel(/full name/i).fill("Ravi Kumar");
        // Email intentionally left empty.

        await mockNextAction(page, { success: true });
        await dialog.getByRole("button", { name: /continue/i }).click();

        // No client- or server-reported email error should ever appear —
        // completeness is full_name only.
        await expect(page.getByText(/enter a valid email address/i)).toHaveCount(0);
        await expect(page.getByText(/email is required/i)).toHaveCount(0);
    });

    test.fixme("shows the server's error against the full name field, not email", async ({ page }) => {
        await resumeAtOtpStep(page);

        await mockNextAction(page, { success: true, needsProfile: true, role: "user" });
        await page.getByRole("button", { name: /verify/i }).click();

        const dialog = page.getByRole("dialog");
        await dialog.getByLabel(/full name/i).fill("Ravi Kumar");

        // completeProfile's own validation error shape is `{success:false, error}`
        // (actions/user.actions.ts); simulate the "Full name is required" message
        // it would surface if e.g. it trims to empty server-side.
        await mockNextAction(page, { success: false, error: "Full name is required" });
        await dialog.getByRole("button", { name: /continue/i }).click();

        await expect(dialog.getByText("Full name is required")).toBeVisible();
    });
});
