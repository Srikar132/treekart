import { test, expect, type Page } from '@playwright/test';

/**
 * Tree rental browsing — app/(storefront)/rent/page.tsx (listing) and
 * app/(storefront)/trees/[id]/page.tsx (detail).
 *
 * Listing data is real (dev DB). Empty-state tests apply a genuinely
 * impossible filter rather than mocking, since the initial grid is
 * server-rendered and not interceptable via page.route.
 */

async function firstTreeHref(page: Page, query = ''): Promise<string | null> {
  await page.goto(`/rent${query}`);
  const link = page.locator('a[href^="/trees/"]').first();
  if ((await link.count()) === 0) return null;
  return link.getAttribute('href');
}

test.describe('Rent listing page', () => {
  test('loads with heading, results count, filters and sort controls', async ({ page }) => {
    const response = await page.goto('/rent');
    expect(response?.status()).toBeLessThan(400);

    await expect(page.getByRole('heading', { name: 'Rent a Mango Tree' })).toBeVisible();
    await expect(page.getByText(/Showing \d+ of \d+ trees/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Filter/i })).toBeVisible();
    await expect(page.getByText('Sort by:')).toBeVisible();
  });

  test('an impossibly high price filter yields the empty state', async ({ page }) => {
    const response = await page.goto('/rent?minPrice=99999999');
    expect(response?.status()).toBeLessThan(400);

    await expect(page.getByText('No trees available')).toBeVisible();
    await expect(
      page.getByText('Available trees will appear here once they are listed', { exact: false })
    ).toBeVisible();
  });

  test('an impossible tree-age filter also yields the empty state', async ({ page }) => {
    await page.goto('/rent?minAge=999');
    await expect(page.getByText('No trees available')).toBeVisible();
  });

  test('toggling the "Rented" status filter updates the URL', async ({ page }) => {
    await page.goto('/rent');

    await page.getByRole('button', { name: /Filter/i }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('checkbox', { name: 'Rented' }).click();

    await expect(page).toHaveURL(/[?&]status=[^&]*rented/);
  });

  test('default listing implicitly filters to available trees only', async ({ page }) => {
    await page.goto('/rent');
    // The default activeStatus is ["available"], and it's not counted as an
    // "active filter" pill since it's the implicit default (see hasActiveFilters).
    await page.getByRole('button', { name: /Filter/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('checkbox', { name: 'Available' })).toBeChecked();
  });

  test('changing sort order updates the URL query param', async ({ page }) => {
    await page.goto('/rent');

    await page.getByText('Sort by:').locator('..').getByRole('combobox').click();
    const option = page.getByRole('option').first();
    await option.click();

    // Whatever option was chosen, the URL should reflect a sort param.
    await expect(page).toHaveURL(/[?&]sort=/);
  });

  test('clear all removes active filters from the URL', async ({ page }) => {
    await page.goto('/rent?minPrice=1000&maxPrice=5000');

    await page.getByRole('button', { name: /Filter/i }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Clear all' }).click();

    await expect(page).toHaveURL(/\/rent$/);
  });

  test('invalid filter combination handles gracefully without crashing', async ({ page }) => {
    const response = await page.goto('/rent?minAge=abc&maxAge=xyz&page=-1');
    expect(response?.status()).toBeLessThan(500);
    await expect(page.getByRole('heading', { name: 'Rent a Mango Tree' })).toBeVisible();
  });
});

test.describe('Tree detail page', () => {
  test('an unknown tree id renders the 404 page', async ({ page }) => {
    // trees/[id]/loading.tsx makes this route stream: Next flushes a 200 shell
    // immediately, then resolves notFound() afterward, so the HTTP status stays
    // 200 even though the not-found UI is what the user actually sees (same
    // quirk as store/[id] — see that spec file). Assert on rendered content.
    await page.goto('/trees/00000000-0000-0000-0000-000000000000');
    await expect(page.getByText('Lost in the', { exact: false })).toBeVisible();
  });

  test('navigating from the grid opens a working detail page', async ({ page }) => {
    const href = await firstTreeHref(page);
    test.skip(!href, 'No trees available on this dev DB to open a detail page for');

    await page.goto(href!);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('/ Per Season')).toBeVisible();
    await expect(page.getByText('Farm Information')).toBeVisible();
  });

  test('an available tree shows the Rent Now CTA, which requires login', async ({ page }) => {
    const href = await firstTreeHref(page, '?status=available');
    test.skip(!href, 'No available trees on this dev DB');

    await page.goto(href!);
    const rentButton = page.getByRole('button', { name: 'Rent This Tree Now' });
    test.skip((await rentButton.count()) === 0, 'This tree is not in the expected available state');

    await rentButton.click();

    // Not authenticated -> the global login-prompt dialog opens instead of navigating to checkout.
    await expect(page.getByRole('dialog').getByText('Sign in to continue')).toBeVisible();
    await expect(page).not.toHaveURL(/\/checkout/);
  });

  test('a rented tree shows the secured/unavailable state instead of a Rent Now button', async ({ page }) => {
    const href = await firstTreeHref(page, '?status=rented');
    test.skip(!href, 'No rented trees on this dev DB');

    await page.goto(href!);
    await expect(
      page.getByText('secured for the current season by another member', { exact: false })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Rent This Tree Now' })).toHaveCount(0);
  });

  test('login prompt dialog offers both sign-in and sign-up, and can be dismissed', async ({ page }) => {
    const href = await firstTreeHref(page, '?status=available');
    test.skip(!href, 'No available trees on this dev DB');

    await page.goto(href!);
    const rentButton = page.getByRole('button', { name: 'Rent This Tree Now' });
    test.skip((await rentButton.count()) === 0, 'This tree is not in the expected available state');
    await rentButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Create Account' })).toBeVisible();

    // Dismiss via Escape and confirm the dialog closes without navigating away.
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});
