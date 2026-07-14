import { test, expect } from '@playwright/test';

/**
 * app/blocked/page.tsx renders components/shared/blocked-content.tsx,
 * driven purely by the `?reason=` search param. In production this page is
 * reached when Arcjet (lib/arcjet.ts) denies a request upstream (rate limit
 * or bot detection) and the caller redirects here — we exercise it directly
 * with each reason value rather than trying to actually trip a live Arcjet
 * rule end-to-end.
 */

test.describe('Blocked page', () => {
  test('reason=RATE_LIMIT shows the rate-limit specific copy', async ({ page }) => {
    const response = await page.goto('/blocked?reason=RATE_LIMIT');
    expect(response?.status()).toBeLessThan(400);

    await expect(page.getByText('Rate Limit Active')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Too Many Requests' })).toBeVisible();
  });

  test('reason=BOT shows the bot-detection specific copy', async ({ page }) => {
    await page.goto('/blocked?reason=BOT');

    await expect(page.getByText('Security Event')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Access Restricted' })).toBeVisible();
  });

  test('no reason (or an unrecognized reason) falls back to the generic message', async ({ page }) => {
    await page.goto('/blocked');

    await expect(page.getByText('System Alert')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Connection Blocked' })).toBeVisible();
  });

  test('offers a way back home and a way to request a review', async ({ page }) => {
    await page.goto('/blocked?reason=RATE_LIMIT');

    await expect(page.getByRole('link', { name: /Return to Safety/i })).toHaveAttribute('href', '/');
    await expect(page.getByRole('link', { name: /Request Review/i })).toHaveAttribute('href', '/contact');
  });
});
