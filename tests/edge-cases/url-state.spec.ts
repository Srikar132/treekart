import { test, expect } from '@playwright/test';

/**
 * URL-state persistence on /store — filters, sort, and browser history.
 *
 * Finding worth noting: /store's filter/sort widgets (components/storefront/
 * shop/product-filters.tsx, product-sort.tsx) do NOT use the `nuqs` library
 * directly — they build a `URLSearchParams` by hand and call
 * `router.push(pathname + "?" + params)`. `nuqs` (a real dependency here) is
 * actually used on the ADMIN data-table pages (app/(admin)/.../search-params.ts),
 * which are covered by the admin-dashboard test suite. Also, /store has no
 * URL-driven "page" control to test — pagination there is client-side
 * infinite-scroll via React Query (components/storefront/shop/product-grid.tsx);
 * the `page` param is only read once, server-side, on first load, and is
 * explicitly deleted from the URL on every filter/sort change. So this file
 * tests the actual reload/back/forward contract for filters + sort, which is
 * the closest real analogue to the "paginated/filterable list" ask that
 * exists on /store today.
 *
 * These tests don't depend on any particular product existing in the catalog:
 * they only assert on URL/query-param state and checkbox/select UI state,
 * which are correct regardless of how many (or how few) results come back.
 */

test.describe('/store filters reflected in the URL', () => {
  test('toggling a badge filter updates the URL and survives a reload', async ({ page }) => {
    await page.goto('/store');

    await page.getByRole('button', { name: /Filter/i }).click();
    // Base UI's Checkbox renders a visually-hidden native <input> alongside
    // the styled span it labels — clicking the raw #badge-Sale input directly
    // times out ("outside the viewport"), so target the ARIA role instead.
    await page.getByRole('dialog').getByRole('checkbox', { name: 'Sale' }).click();

    await expect.poll(() => new URL(page.url()).searchParams.get('badge')).toBe('Sale');

    await page.reload();
    await page.getByRole('button', { name: /Filter/i }).click();
    await expect(page.getByRole('dialog').getByRole('checkbox', { name: 'Sale' })).toBeChecked();
  });

  test('back/forward navigation restores prior filter combinations', async ({ page }) => {
    await page.goto('/store');

    await page.getByRole('button', { name: /Filter/i }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('checkbox', { name: 'Sale' }).click();
    await expect.poll(() => new URL(page.url()).searchParams.get('badge')).toBe('Sale');

    // Add a second badge — router.push creates a new history entry each time.
    await dialog.getByRole('checkbox', { name: 'New' }).click();
    await expect.poll(() => {
      const badges = new URL(page.url()).searchParams.get('badge')?.split(',') ?? [];
      return badges.sort().join(',');
    }).toBe('New,Sale');

    await page.goBack();
    await expect.poll(() => new URL(page.url()).searchParams.get('badge')).toBe('Sale');

    await page.goForward();
    await expect.poll(() => {
      const badges = new URL(page.url()).searchParams.get('badge')?.split(',') ?? [];
      return badges.sort().join(',');
    }).toBe('New,Sale');
  });

  test('clearing all filters removes query params entirely', async ({ page }) => {
    await page.goto('/store?badge=Sale');
    // The "Clear All" pill sits outside the filter Sheet (desktop viewport,
    // `hidden sm:flex`), rendered whenever hasActiveFilters is true — no need
    // to open the Sheet to reach it, which also avoids ambiguity with the
    // Sheet's own internal "Clear all" button.
    await page.getByRole('button', { name: 'Clear All', exact: true }).click();
    await expect.poll(() => new URL(page.url()).search).toBe('');
  });
});

test.describe('/store sort order reflected in the URL', () => {
  test('changing sort order updates the URL and survives a reload', async ({ page }) => {
    await page.goto('/store');

    await page.locator('[data-slot="select-trigger"]').click();
    await page.locator('[data-slot="select-item"]', { hasText: 'Price: Low to High' }).click();
    await expect.poll(() => new URL(page.url()).searchParams.get('sort')).toBe('price_asc');

    await page.reload();
    await expect(page.locator('[data-slot="select-trigger"]')).toContainText('Price: Low to High');
    expect(new URL(page.url()).searchParams.get('sort')).toBe('price_asc');
  });

  test('back/forward restores the prior sort selection', async ({ page }) => {
    await page.goto('/store');

    await page.locator('[data-slot="select-trigger"]').click();
    await page.locator('[data-slot="select-item"]', { hasText: 'Price: Low to High' }).click();
    await expect.poll(() => new URL(page.url()).searchParams.get('sort')).toBe('price_asc');

    await page.locator('[data-slot="select-trigger"]').click();
    await page.locator('[data-slot="select-item"]', { hasText: 'Price: High to Low' }).click();
    await expect.poll(() => new URL(page.url()).searchParams.get('sort')).toBe('price_desc');

    await page.goBack();
    await expect.poll(() => new URL(page.url()).searchParams.get('sort')).toBe('price_asc');

    await page.goForward();
    await expect.poll(() => new URL(page.url()).searchParams.get('sort')).toBe('price_desc');
  });
});
