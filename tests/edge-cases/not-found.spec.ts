import { test, expect } from '@playwright/test';

/**
 * 404 handling. app/not-found.tsx exists and renders a custom "Lost in the
 * Orchard" page (verified by reading the file) with links back to /, /rent,
 * /blog, /about, /contact. Next.js App Router serves this component with a
 * real 404 HTTP status when no route matches.
 */

test('an unmatched route renders the custom not-found page, not a crash', async ({ page }) => {
  const res = await page.goto('/this-does-not-exist-xyz-123');

  expect(res?.status()).toBe(404);
  await expect(page.getByText(/Lost in the/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /Back to Home/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Explore Mangoes/i })).toBeVisible();

  // No dev-mode error overlay / unhandled exception text.
  await expect(page.getByText(/Unhandled Runtime Error/i)).not.toBeVisible();
  await expect(page.getByText(/Application error/i)).not.toBeVisible();
});

test('a deeply nested unmatched route also renders the custom not-found page', async ({ page }) => {
  const res = await page.goto('/store/this/does/not/exist/at/all');
  expect(res?.status()).toBe(404);
  await expect(page.getByText(/Lost in the/i)).toBeVisible();
});

test('the not-found page still lets a visitor navigate back into the app', async ({ page }) => {
  await page.goto('/this-does-not-exist-xyz-123');
  await page.getByRole('link', { name: /Back to Home/i }).click();
  await expect(page).toHaveURL('/');
});
