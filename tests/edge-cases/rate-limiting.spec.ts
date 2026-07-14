import { test, expect } from '@playwright/test';

/**
 * Rate limiting (lib/arcjet.ts).
 *
 * lib/arcjet.ts guards several server actions:
 *   - contactAj   → actions/contact.actions.ts (submitContactForm) — 5 / hour, keyed on IP
 *   - otpSendAj   → actions/auth.actions.ts (sendOtp) — 5 / 10min, keyed on PHONE NUMBER
 *   - otpVerifyAj → actions/auth.actions.ts (verifyOtp) — 6 / 10min, keyed on PHONE NUMBER
 *   - signupAj, recoveryAj, paymentAj — admin/checkout-adjacent, owned by other suites
 *
 * The OTP-send/verify limiters are keyed on phone number and gated behind
 * Cloudflare Turnstile (single-use tokens, per CLAUDE.md) — exercising them
 * for real from here would need a live phone number + a real Turnstile
 * solve, which belongs to the auth-flow test suite, not this cross-cutting
 * one. The contact form has no CAPTCHA in front of it and is a plain
 * server-action form, making it the right target for a cross-cutting
 * rate-limit check.
 *
 * APPROACH: this test is opt-in (skipped by default) rather than always-on,
 * because firing the REAL contactAj limiter through the REAL /contact form
 * has two side effects we don't want in a routine CI run:
 *   1. It needs a real ARCJET_KEY configured against the dev server (Arcjet's
 *      sliding-window counters are tracked by Arcjet's service, not locally —
 *      there is no in-process state to fake without monkey-patching server
 *      code, which Playwright cannot do from outside the process).
 *   2. Each of the first 5 (allowed) submissions triggers a REAL email send
 *      via Resend (lib/email.ts -> sendContactEmail), which is an
 *      unwanted side effect to repeat on every test run.
 * We deliberately do NOT attempt to fake this by intercepting the Next.js
 * Server Action network call via page.route: the request/response wire
 * format for React Server Action submissions is an internal RSC "Flight"
 * stream, not plain JSON, and hand-crafting a byte-correct fake of it is
 * fragile and likely to silently break across Next.js versions — worse than
 * either running the real thing or skipping.
 *
 * To actually run this against a real dev server with a real ARCJET_KEY and
 * a real RESEND_API_KEY:
 *   RUN_LIVE_RATE_LIMIT_TESTS=1 npx playwright test rate-limiting.spec.ts
 */

const LIVE = process.env.RUN_LIVE_RATE_LIMIT_TESTS === '1';

test.describe('contact form rate limiting (contactAj — 5 requests / hour, keyed on IP)', () => {
  test.skip(!LIVE, 'Opt-in only — hits real Arcjet + sends real emails via Resend. Set RUN_LIVE_RATE_LIMIT_TESTS=1 to run.');

  test('the 6th rapid submission in the same hour is denied', async ({ page }) => {
    await page.goto('/contact');

    for (let i = 0; i < 6; i++) {
      // A fresh page load each iteration resets the useActionState UI back to
      // the empty form (the component swaps to a "Message Received" success
      // view on the 1st-5th successful submits).
      if (i > 0) await page.goto('/contact');

      await page.getByPlaceholder('Enter your name').fill(`Rate Limit Test ${i}`);
      await page.getByPlaceholder('Enter Email Address').fill('ratelimit-test@example.com');
      await page.getByPlaceholder('Enter Phone Number').fill('9876543210');
      await page.getByPlaceholder('What is this about?').fill(`Automated rate-limit probe #${i}`);
      await page.getByPlaceholder('How can we help you today?').fill(
        `This is an automated Playwright rate-limit test message, attempt ${i}.`
      );

      await page.getByRole('button', { name: /Submit Message/i }).click();

      if (i < 5) {
        // First 5 requests within the hour should be allowed through.
        await expect(page.getByText('Message Received')).toBeVisible({ timeout: 15_000 });
      } else {
        // The 6th should be denied by contactAj's slidingWindow(max: 5) rule
        // and surfaced via the exact string in actions/contact.actions.ts.
        await expect(page.getByText(/sending too many messages/i)).toBeVisible({ timeout: 15_000 });
      }
    }
  });
});

test.describe('lib/arcjet.ts — configured limits (static contract check)', () => {
  // A lightweight, always-on companion to the opt-in live test above: reads
  // the actual configured rule parameters out of the source so a silent
  // change to the limits (e.g. loosening contactAj to max: 50) is caught even
  // when the live test is skipped in normal CI runs.
  test('contactAj is configured for 5 requests per hour', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const source = fs.readFileSync(path.resolve(__dirname, '../../lib/arcjet.ts'), 'utf-8');

    const contactRuleMatch = source.match(
      /export const contactAj[\s\S]*?slidingWindow\(\{[^}]*\}\)/
    );
    expect(contactRuleMatch).not.toBeNull();
    const rule = contactRuleMatch![0];
    expect(rule).toContain('interval: "1h"');
    expect(rule).toContain('max: 5');
  });
});
