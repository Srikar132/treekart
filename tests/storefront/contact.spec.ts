import { test, expect } from '@playwright/test';

/**
 * Contact page — app/(storefront)/contact/page.tsx
 * Form component — components/storefront/contact/contact-form.tsx
 * Server action — actions/contact.actions.ts, validated by
 * `contactSchema` in lib/validations.ts:
 *   name    min 2
 *   email   valid email
 *   phone   min 10 chars
 *   subject min 5
 *   message min 10
 *
 * The action is also gated by `contactAj` (Arcjet slidingWindow, 5/hour,
 * see lib/arcjet.ts). We deliberately do NOT hammer the real action enough
 * times to trip that limiter here — doing so would burn through the real
 * rate-window against the dev server and could trigger a real transactional
 * email via Resend on the first successful submission. Instead:
 *   - Client-side HTML5 validation (required/type=email) is exercised
 *     without ever reaching the server action.
 *   - Server-side zod validation is exercised with a payload that is
 *     intentionally invalid (subject/message too short) so `contactSchema`
 *     rejects it before `sendContactEmail` is ever called — no email sent.
 *   - The Arcjet-denied *rendering* path (`/blocked?reason=RATE_LIMIT`) is
 *     covered separately in blocked.spec.ts, since that's the actual
 *     visible surface for a rate-limit event elsewhere in the app.
 */

test.describe('Contact page', () => {
  test.beforeEach(async ({ page }) => {
    // GuestPromoDialog (components/shared/guest-promo-dialog.tsx) opens
    // automatically 10s after load for any guest visitor. Filling this form
    // field-by-field can cross that threshold under load, and the dialog
    // then steals the "Submit Message" click. Suppress it the same way the
    // component itself does after a first showing — via its sessionStorage flag.
    await page.addInitScript(() => {
      window.sessionStorage.setItem('treekart-guest-promo-shown', '1');
    });
  });

  test('renders contact info, form fields and the embedded map', async ({ page }) => {
    const response = await page.goto('/contact');
    expect(response?.status()).toBeLessThan(400);

    // Page has both an <h2> "Get in Touch" title and an <h4> "Get In Touch"
    // sidebar label — disambiguate by heading level.
    await expect(page.getByRole('heading', { name: 'Get in Touch', level: 2 })).toBeVisible();
    // "info@treekart.in" also appears in the page's own concierge-email
    // panel — either match is fine, just confirm one renders.
    await expect(page.getByText('info@treekart.in').first()).toBeVisible();

    await expect(page.getByPlaceholder('Enter your name')).toBeVisible();
    await expect(page.getByPlaceholder('Enter Email Address')).toBeVisible();
    await expect(page.getByPlaceholder('Enter Phone Number')).toBeVisible();
    await expect(page.getByPlaceholder('What is this about?')).toBeVisible();
    await expect(page.getByPlaceholder('How can we help you today?')).toBeVisible();

    await expect(page.locator('iframe[src*="google.com/maps"]')).toBeVisible();
  });

  test('blocks submission client-side when required fields are empty', async ({ page }) => {
    await page.goto('/contact');

    const submit = page.getByRole('button', { name: 'Submit Message' });
    await submit.click();

    // Native HTML5 "required" validation keeps us on the page — no success
    // panel, no toast, no navigation.
    await expect(page.getByPlaceholder('Enter your name')).toBeFocused();
    await expect(page.getByText('Message Received')).toHaveCount(0);
  });

  test('blocks submission client-side for a malformed email address', async ({ page }) => {
    await page.goto('/contact');

    await page.getByPlaceholder('Enter your name').fill('Test User');
    const emailInput = page.getByPlaceholder('Enter Email Address');
    await emailInput.fill('not-an-email');
    await page.getByPlaceholder('Enter Phone Number').fill('9876543210');
    await page.getByPlaceholder('What is this about?').fill('A valid subject line');
    await page.getByPlaceholder('How can we help you today?').fill('A message that is long enough.');

    await page.getByRole('button', { name: 'Submit Message' }).click();

    // type="email" + required stops submission via the browser's built-in
    // constraint validation; checkValidity() should report false.
    const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
    expect(isValid).toBe(false);
    await expect(page.getByText('Message Received')).toHaveCount(0);
  });

  test('surfaces server-side field errors for a too-short subject and message', async ({ page }) => {
    await page.goto('/contact');

    // Every field is non-empty and passes HTML5 constraints, so the form
    // reaches the server action — but subject/message are shorter than the
    // zod minimums, so contactSchema.safeParse fails before any email is
    // ever sent.
    await page.getByPlaceholder('Enter your name').fill('QA Tester');
    await page.getByPlaceholder('Enter Email Address').fill('qa.tester@example.com');
    await page.getByPlaceholder('Enter Phone Number').fill('9876543210');
    await page.getByPlaceholder('What is this about?').fill('Hi');
    await page.getByPlaceholder('How can we help you today?').fill('Short');

    await page.getByRole('button', { name: 'Submit Message' }).click();

    await expect(page.getByText('Subject must be at least 5 characters')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Message must be at least 10 characters')).toBeVisible();
    await expect(page.getByText('Message Received')).toHaveCount(0);
  });

  test('name shorter than 2 characters is rejected server-side', async ({ page }) => {
    await page.goto('/contact');

    await page.getByPlaceholder('Enter your name').fill('A');
    await page.getByPlaceholder('Enter Email Address').fill('qa.tester@example.com');
    await page.getByPlaceholder('Enter Phone Number').fill('9876543210');
    await page.getByPlaceholder('What is this about?').fill('Hi');
    await page.getByPlaceholder('How can we help you today?').fill('Short');

    await page.getByRole('button', { name: 'Submit Message' }).click();

    await expect(page.getByText('Name must be at least 2 characters')).toBeVisible({ timeout: 15000 });
  });
});
