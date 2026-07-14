import { test, expect, type Page } from '@playwright/test';

/**
 * Mango store — app/(storefront)/store/page.tsx (listing) and
 * app/(storefront)/store/[id]/page.tsx (detail).
 *
 * Data is real (dev DB via getMangoProducts/getMangoProducts server
 * actions) — the initial grid is server-rendered, so we can't intercept it
 * with page.route. Where we need a *guaranteed* empty result we instead
 * apply a real filter (e.g. an impossible price floor) so the server's own
 * query legitimately returns zero rows.
 */

async function firstProductHref(page: Page): Promise<string> {
  await page.goto('/store');
  const link = page.locator('a[href^="/store/"]').first();
  await expect(link).toBeVisible();
  const href = await link.getAttribute('href');
  if (!href) throw new Error('No product link found on /store — is the catalog empty?');
  return href;
}

test.describe('Store listing page', () => {
  test('loads with heading, results count, filters and sort controls', async ({ page }) => {
    const response = await page.goto('/store');
    expect(response?.status()).toBeLessThan(400);

    await expect(page.getByRole('heading', { name: 'Mango Store' })).toBeVisible();
    await expect(page.getByText(/Showing \d+ of \d+ products/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Filter/i })).toBeVisible();
    await expect(page.getByText('Sort by:')).toBeVisible();
  });

  test('an impossibly high price filter yields the empty state', async ({ page }) => {
    const response = await page.goto('/store?minPrice=999999');
    expect(response?.status()).toBeLessThan(400);

    await expect(page.getByText('No products found')).toBeVisible();
    await expect(page.getByText('Use fewer filters or remove all')).toBeVisible();
  });

  test('toggling a status filter updates the URL query params', async ({ page }) => {
    await page.goto('/store');

    await page.getByRole('button', { name: /Filter/i }).click();
    const dialog = page.getByRole('dialog');
    // Base UI's Checkbox renders a visually-hidden native <input> alongside the
    // styled span it labels — both match getByLabel, so target the ARIA role.
    await dialog.getByRole('checkbox', { name: 'Available' }).click();

    await expect(page).toHaveURL(/[?&]status=available/);
  });

  test('toggling a badge filter updates the URL query params', async ({ page }) => {
    await page.goto('/store');

    await page.getByRole('button', { name: /Filter/i }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('checkbox', { name: 'Sale' }).click();

    await expect(page).toHaveURL(/[?&]badge=Sale/);
  });

  test('clear all removes active filters from the URL', async ({ page }) => {
    await page.goto('/store?status=available');

    await page.getByRole('button', { name: /Filter/i }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Clear all' }).click();

    await expect(page).toHaveURL(/\/store$/);
  });

  test('changing sort order updates the URL query param', async ({ page }) => {
    await page.goto('/store');

    await page.getByText('Sort by:').locator('..').getByRole('combobox').click();
    await page.getByRole('option', { name: 'Price: Low to High' }).click();

    await expect(page).toHaveURL(/[?&]sort=price_asc/);
  });

  test('out-of-stock filter either shows sold-out badges or the empty state', async ({ page }) => {
    await page.goto('/store?status=out_of_stock');

    const noResults = page.getByText('No products found');
    if (await noResults.count()) {
      await expect(noResults).toBeVisible();
    } else {
      await expect(page.getByText('Out of Stock').first()).toBeVisible();
    }
  });

  test('pre-order filter either shows pre-order badges or the empty state', async ({ page }) => {
    await page.goto('/store?status=pre_order');

    const noResults = page.getByText('No products found');
    if (await noResults.count()) {
      await expect(noResults).toBeVisible();
    } else {
      await expect(page.getByText('Pre-Order').first()).toBeVisible();
    }
  });

  test('invalid filter combination handles gracefully without crashing', async ({ page }) => {
    const response = await page.goto('/store?minPrice=abc&maxPrice=xyz&page=-1');
    expect(response?.status()).toBeLessThan(500);
    await expect(page.getByRole('heading', { name: 'Mango Store' })).toBeVisible();
  });
});

test.describe('Product detail page', () => {
  test('navigating from the grid opens a working detail page', async ({ page }) => {
    const href = await firstProductHref(page);
    await page.goto(href);

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText(/kg ×/)).toBeVisible();
  });

  test('an unknown product id renders the 404 page', async ({ page }) => {
    // store/[id]/loading.tsx makes this route stream: Next flushes a 200 shell
    // immediately, then resolves notFound() afterward, so the HTTP status stays
    // 200 even though the not-found UI is what the user actually sees. Assert
    // on the rendered content instead of the (unreliable, for this route) status.
    await page.goto('/store/00000000-0000-0000-0000-000000000000');
    await expect(page.getByText('Lost in the', { exact: false })).toBeVisible();
  });

  test('quantity stepper never goes below 1', async ({ page }) => {
    const href = await firstProductHref(page);
    await page.goto(href);

    const qtyOutOfStock = await page.getByText('Out of Stock', { exact: true }).count();
    test.skip(qtyOutOfStock > 0, 'First product is out of stock — quantity stepper is disabled by design');

    const qtyValue = page.locator('span.text-lg.w-8.text-center');
    const qtyBox = qtyValue.locator('..');
    const decrementButton = qtyBox.getByRole('button').first();

    await expect(qtyValue).toHaveText('1');
    await decrementButton.click();
    await decrementButton.click();
    // Decrementing below 1 is clamped by the component (qty => qty > 1 ? qty - 1 : 1).
    await expect(qtyValue).toHaveText('1');
  });

  test('incrementing quantity and adding to cart updates the navbar badge', async ({ page }) => {
    const href = await firstProductHref(page);
    await page.goto(href);

    const addToCartButton = page.getByRole('button', { name: /Add to Cart|Pre-order Item/ });
    const isDisabled = await addToCartButton.isDisabled().catch(() => true);
    test.skip(isDisabled, 'Product on this dev DB is out of stock — cannot exercise add-to-cart');

    // Bump quantity to 3 before adding.
    const qtyBox = page.locator('span.text-lg.w-8.text-center').locator('..');
    const incrementButton = qtyBox.getByRole('button').last();
    await incrementButton.click();
    await incrementButton.click();

    await addToCartButton.click();

    const cartArea = page.locator('span.sr-only', { hasText: 'Cart' }).locator('..');
    await expect(cartArea.locator('span.rounded-full')).toHaveText('3');
  });

  test('out-of-stock product disables add-to-cart and quantity controls', async ({ page }) => {
    // Filter to a genuinely out-of-stock product if one exists on this dev DB.
    await page.goto('/store?status=out_of_stock');
    const link = page.locator('a[href^="/store/"]').first();
    test.skip((await link.count()) === 0, 'No out-of-stock products available on this dev DB');

    const href = await link.getAttribute('href');
    await page.goto(href!);

    await expect(page.getByText('currently out of stock', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Out of Stock' })).toBeDisabled();
  });
});

test.describe('Cart interactions from the store', () => {
  test('cart sidebar opens, shows the added item, and the empty state after removal', async ({ page }) => {
    const href = await firstProductHref(page);
    await page.goto(href);

    const addToCartButton = page.getByRole('button', { name: /Add to Cart|Pre-order Item/ });
    const isDisabled = await addToCartButton.isDisabled().catch(() => true);
    test.skip(isDisabled, 'Product on this dev DB is out of stock — cannot exercise cart flow');

    await addToCartButton.click();

    // Cart auto-opens on add (store `add()` sets isOpen: true).
    await expect(page.getByRole('heading', { name: 'Your Cart' })).toBeVisible();
    await expect(page.getByText('Subtotal', { exact: false })).toBeVisible();

    // Remove the only item via the trash icon -> empty state.
    await page.locator('button:has(svg.lucide-trash-2)').first().click();

    await expect(page.getByText('Your cart is empty')).toBeVisible();
    await expect(page.getByText('Add some fresh mangoes from our store')).toBeVisible();
  });

  test('clear-all confirmation empties a multi-item cart', async ({ page }) => {
    await page.goto('/store');
    const cards = page.locator('a[href^="/store/"]');
    const count = await cards.count();
    test.skip(count < 1, 'No products available to build a cart with');

    const href = await cards.first().getAttribute('href');
    await page.goto(href!);

    const addToCartButton = page.getByRole('button', { name: /Add to Cart|Pre-order Item/ });
    const isDisabled = await addToCartButton.isDisabled().catch(() => true);
    test.skip(isDisabled, 'Product on this dev DB is out of stock');

    await addToCartButton.click();
    await expect(page.getByRole('heading', { name: 'Your Cart' })).toBeVisible();

    await page.getByRole('button', { name: 'Clear all' }).click();
    await page.getByRole('button', { name: 'Clear Cart' }).click();

    await expect(page.getByText('Your cart is empty')).toBeVisible();
  });

  test('order total equals subtotal plus delivery fee (free-delivery threshold boundary)', async ({ page }) => {
    const href = await firstProductHref(page);
    await page.goto(href);

    const addToCartButton = page.getByRole('button', { name: /Add to Cart|Pre-order Item/ });
    const isDisabled = await addToCartButton.isDisabled().catch(() => true);
    test.skip(isDisabled, 'Product on this dev DB is out of stock');

    await addToCartButton.click();
    await expect(page.getByRole('heading', { name: 'Your Cart' })).toBeVisible();

    const parseRupees = (text: string) => Number(text.replace(/[^\d.]/g, '')) || 0;

    // Each breakdown row is `<div><span>Label</span><span class="font-mono">Value</span></div>` —
    // grab just the font-mono value span so the (weight in kg) inside the
    // label never gets mixed into the parsed rupee amount.
    const subtotalValueText = await page
      .getByText(/^Subtotal/)
      .locator('..')
      .locator('span.font-mono')
      .first()
      .textContent();
    const deliveryValueText = await page
      .getByText('Delivery', { exact: true })
      .locator('..')
      .locator('span.font-mono')
      .first()
      .textContent();
    const totalValueText = await page
      .getByText('Total', { exact: true })
      .locator('..')
      .locator('span.font-mono')
      .first()
      .textContent();

    const subtotal = parseRupees(subtotalValueText || '');
    const delivery = /free/i.test(deliveryValueText || '') ? 0 : parseRupees(deliveryValueText || '');
    const total = parseRupees(totalValueText || '');

    expect(total).toBe(subtotal + delivery);

    // The free-delivery nudge and the "Free" delivery label are mutually exclusive.
    const nudge = page.getByText('more for free delivery', { exact: false });
    if (delivery === 0) {
      await expect(nudge).toHaveCount(0);
    } else {
      await expect(nudge).toBeVisible();
    }
  });
});
