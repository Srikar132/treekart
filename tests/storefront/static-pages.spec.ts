import { test, expect } from '@playwright/test';

/**
 * Static / informational storefront pages that need no auth and no live data:
 * /about, /faq, /privacy, /terms, plus the global 404 (not-found) page.
 */

test.describe('About page', () => {
  test('renders the hero and philosophy copy', async ({ page }) => {
    const response = await page.goto('/about');
    expect(response?.status()).toBeLessThan(400);

    await expect(page.getByRole('heading', { name: 'Our Story' })).toBeVisible();
    await expect(
      page.getByText('Rooted in tradition,', { exact: false })
    ).toBeVisible();
    await expect(page.getByText('Cultivating Quality')).toBeVisible();
  });
});

test.describe('FAQ page', () => {
  test('renders all FAQ categories and questions', async ({ page }) => {
    const response = await page.goto('/faq');
    expect(response?.status()).toBeLessThan(400);

    // "Questions & Answers" (h1) and "Still have questions?" (h3, bottom CTA)
    // both match /Questions/i, so anchor to the exact page title.
    await expect(page.getByRole('heading', { name: 'Questions & Answers' })).toBeVisible();
    await expect(page.getByText('The Rental Process')).toBeVisible();
    await expect(page.getByText('Harvest & Delivery')).toBeVisible();
    await expect(page.getByText('Organic Practices')).toBeVisible();
  });

  test('accordion items expand to reveal the answer and collapse again', async ({ page }) => {
    await page.goto('/faq');

    const question = page.getByRole('button', { name: 'How does the tree rental work?' });
    const answer = page.getByText('leasing the yield of a specific, heritage Alphonso tree', { exact: false });

    // Collapsed by default.
    await expect(answer).toBeHidden();

    await question.click();
    await expect(answer).toBeVisible();

    // Collapses again on second click.
    await question.click();
    await expect(answer).toBeHidden();
  });

  test('each question in a section can be opened independently', async ({ page }) => {
    await page.goto('/faq');

    const q1 = page.getByRole('button', { name: 'Can I visit my tree at the orchard?' });
    const q2 = page.getByRole('button', { name: 'What happens if my tree produces less than expected?' });

    await q1.click();
    await expect(page.getByText('We encourage orchard visits', { exact: false })).toBeVisible();

    await q2.click();
    await expect(page.getByText("Yield Guarantee", { exact: false })).toBeVisible();
  });

  test('bottom CTA links to email and WhatsApp', async ({ page }) => {
    await page.goto('/faq');

    await expect(page.getByRole('link', { name: 'Email Us' })).toHaveAttribute(
      'href',
      /^mailto:/
    );
    await expect(page.getByRole('link', { name: 'WhatsApp Support' })).toHaveAttribute(
      'href',
      /^https:\/\/wa\.me\//
    );
  });

  test('emits FAQPage JSON-LD structured data', async ({ page }) => {
    await page.goto('/faq');
    // Root layout also emits an Organization ld+json block, so pick the
    // FAQPage one by type rather than assuming it's first in the DOM.
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faqPage = blocks.map(b => JSON.parse(b)).find(b => b['@type'] === 'FAQPage');
    expect(faqPage).toBeTruthy();
    expect(Array.isArray(faqPage.mainEntity)).toBe(true);
    expect(faqPage.mainEntity.length).toBeGreaterThan(0);
  });
});

test.describe('Privacy policy page', () => {
  test('renders all documented sections', async ({ page }) => {
    const response = await page.goto('/privacy');
    expect(response?.status()).toBeLessThan(400);

    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
    await expect(page.getByText('Information We Collect')).toBeVisible();
    await expect(page.getByText('Payment Security')).toBeVisible();
    await expect(page.getByText("Children's Privacy")).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get in Touch' })).toHaveAttribute('href', '/contact');
  });

  test('contact section shows the configured email/phone/address', async ({ page }) => {
    await page.goto('/privacy');
    // The same mailto link appears once in the page body and once in the
    // global footer — either is fine, just check the href is correct.
    await expect(page.getByRole('link', { name: 'info@treekart.in' }).first()).toHaveAttribute(
      'href',
      'mailto:info@treekart.in'
    );
  });
});

test.describe('Terms & Conditions page', () => {
  test('renders all documented sections', async ({ page }) => {
    const response = await page.goto('/terms');
    expect(response?.status()).toBeLessThan(400);

    await expect(page.getByRole('heading', { name: 'Terms & Conditions' })).toBeVisible();
    await expect(page.getByText('Acceptance of Terms')).toBeVisible();
    // A list item elsewhere on the page ("Mango tree leasing services") also
    // matches this substring case-insensitively — anchor to the section heading.
    await expect(page.getByRole('heading', { name: 'Mango Tree Leasing' })).toBeVisible();
    await expect(page.getByText('Governing Law')).toBeVisible();
  });

  test('tree leasing sub-sections (3.1 - 3.3) are all present', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByText('3.1 Tree Ownership')).toBeVisible();
    await expect(page.getByText('3.2 Natural Farming Conditions')).toBeVisible();
    await expect(page.getByText('3.3 Guaranteed Quantity')).toBeVisible();
  });
});

test.describe('404 handling', () => {
  test('an unknown top-level route renders the custom not-found page', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist-xyz');
    expect(response?.status()).toBe(404);

    await expect(page.getByText('Lost in the', { exact: false })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to Home' })).toHaveAttribute('href', '/');
    await expect(page.getByRole('link', { name: 'Explore Mangoes' })).toHaveAttribute('href', '/store');
  });

  test('not-found page offers quick links to key sections', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-xyz');
    await expect(page.getByRole('link', { name: 'Rent a Tree' })).toHaveAttribute('href', '/rent');
    await expect(page.getByRole('link', { name: "Farmer's Blog" })).toHaveAttribute('href', '/blog');
  });
});
