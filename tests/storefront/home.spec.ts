import { test, expect } from '@playwright/test';

/**
 * Public home page — app/(storefront)/page.tsx
 *
 * Covers: hero, primary nav, featured categories, testimonials (has a
 * built-in fallback so it always renders even with an empty DB), and the
 * conditional available/rented tree rails.
 */

test.describe('Home page', () => {
  test('loads and shows the hero section with a working primary CTA', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);

    // Hero renders an <h1> for the slide title (falls back to
    // "Own a Mango Tree." when no hero_slides rows exist).
    await expect(page.locator('h1').first()).toBeVisible();

    // Hero section (first <section> on the page) is visible with its CTA.
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();
    await expect(heroSection.getByRole('link')).toBeVisible();
  });

  test('primary navigation links point to the right routes', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav').first();

    await expect(nav.getByRole('link', { name: 'Rent Trees' })).toHaveAttribute('href', '/rent');
    await expect(nav.getByRole('link', { name: 'Mango Store' })).toHaveAttribute('href', '/store');
    await expect(nav.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog');
    await expect(nav.getByRole('link', { name: 'About Us' })).toHaveAttribute('href', '/about');
    await expect(nav.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact');
  });

  test('navigating via the navbar reaches the destination page', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav').first().getByRole('link', { name: 'Mango Store' }).click();
    await expect(page).toHaveURL(/\/store$/);
    await expect(page.getByRole('heading', { name: 'Mango Store' })).toBeVisible();
  });

  test('featured categories section links to store and plans', async ({ page }) => {
    await page.goto('/');
    // Two "Shop Now" CTAs render at different breakpoints (mobile/desktop
    // variants both present in the DOM) — both point to the same place, so
    // just confirm at least one resolves correctly.
    await expect(page.getByRole('link', { name: /Shop Now/i }).first()).toHaveAttribute('href', '/store');
    await expect(page.getByRole('link', { name: /View Plans/i }).first()).toHaveAttribute('href', '#plans');
  });

  test('testimonials section always renders (has a built-in fallback)', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('section', { hasText: 'Loved by Enthusiasts' });
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole('heading', { name: 'Loved by Enthusiasts' })).toBeVisible();
    // Fallback content ships 3 testimonial cards when the DB table is empty;
    // real data may render a different count, so just assert at least one renders.
    await expect(section.locator('h4').first()).toBeVisible();
  });

  test('available and rented tree rails, if present, link into /rent', async ({ page }) => {
    await page.goto('/');

    const availableHeading = page.getByRole('heading', { name: 'Available for Lease' });
    if (await availableHeading.count()) {
      await availableHeading.scrollIntoViewIfNeeded();
      await expect(availableHeading).toBeVisible();
      await expect(page.getByRole('link', { name: 'View Full Orchard' })).toHaveAttribute('href', '/rent');
    }

    const rentedHeading = page.getByRole('heading', { name: 'Thriving Communities' });
    if (await rentedHeading.count()) {
      await rentedHeading.scrollIntoViewIfNeeded();
      await expect(rentedHeading).toBeVisible();
      await expect(page.getByRole('link', { name: 'Explore Full Inventory' })).toHaveAttribute('href', '/rent');
    }
  });

  test('cart icon is present and shows no badge for a fresh session', async ({ page }) => {
    await page.goto('/');
    // The cart trigger contains an sr-only "Cart" label next to the bag icon.
    const cartArea = page.locator('span.sr-only', { hasText: 'Cart' }).locator('..');
    await expect(cartArea).toBeVisible();
    // A fresh browser context has no persisted cart, so no numeric badge should render.
    await expect(cartArea.locator('span.rounded-full')).toHaveCount(0);
  });
});
