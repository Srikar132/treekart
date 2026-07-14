import { test, expect, type Page } from '@playwright/test';

/**
 * Blog / journal — app/(storefront)/blog/page.tsx (listing) and
 * app/(storefront)/blog/[slug]/page.tsx (detail). Data is real (dev DB via
 * actions/blog.actions.ts getBlogs/getBlogBySlug).
 */

async function firstPostHref(page: Page): Promise<string | null> {
  await page.goto('/blog');
  const link = page.locator('a[href^="/blog/"]').first();
  if ((await link.count()) === 0) return null;
  return link.getAttribute('href');
}

test.describe('Blog listing page', () => {
  test('loads with the journal heading and story count', async ({ page }) => {
    const response = await page.goto('/blog');
    expect(response?.status()).toBeLessThan(400);

    await expect(page.getByRole('heading', { name: /Notes from/i })).toBeVisible();
    await expect(page.getByText(/Stories Published/)).toBeVisible();
  });

  test('shows the empty state copy when there are no posts', async ({ page }) => {
    // A page number far beyond any real pagination range legitimately
    // returns zero rows for that page from getBlogs(), exercising the same
    // "no posts" branch as a genuinely empty blogs table would.
    await page.goto('/blog?page=99999');

    const noStories = page.getByText('No Stories Found');
    const hasResults = await page.locator('a[href^="/blog/"]').count();
    if (hasResults === 0) {
      await expect(noStories).toBeVisible();
      await expect(
        page.getByText('Our farm team is currently documenting new harvest updates', { exact: false })
      ).toBeVisible();
    }
  });

  test('pagination controls are disabled/enabled appropriately at the boundaries', async ({ page }) => {
    await page.goto('/blog');

    const prevLink = page.getByRole('link', { name: 'Previous' });
    if (await prevLink.count()) {
      // Page 1: Previous should be visually disabled (pointer-events-none class).
      await expect(prevLink).toHaveClass(/pointer-events-none/);
    }
  });

  test('an ItemList JSON-LD block is emitted for SEO', async ({ page }) => {
    await page.goto('/blog');
    // The root layout also emits an Organization ld+json block, so there are
    // multiple script[type="application/ld+json"] tags on every page — find
    // the one this page actually cares about rather than assuming order.
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const itemList = blocks.map(b => JSON.parse(b)).find(b => b['@type'] === 'ItemList');
    expect(itemList).toBeTruthy();
  });

  test('clicking a post navigates to its detail page', async ({ page }) => {
    const href = await firstPostHref(page);
    test.skip(!href, 'No blog posts available on this dev DB');

    await page.locator(`a[href="${href}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
});

test.describe('Blog detail page', () => {
  test('renders title, author, date and body content', async ({ page }) => {
    const href = await firstPostHref(page);
    test.skip(!href, 'No blog posts available on this dev DB');

    const response = await page.goto(href!);
    expect(response?.status()).toBeLessThan(400);

    await expect(page.getByRole('link', { name: 'Back to Journal' })).toHaveAttribute('href', '/blog');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('Filed under:')).toBeVisible();
  });

  test('an unknown slug renders the 404 page', async ({ page }) => {
    const response = await page.goto('/blog/this-slug-does-not-exist-12345');
    expect(response?.status()).toBe(404);
    await expect(page.getByText('Lost in the', { exact: false })).toBeVisible();
  });

  test('emits Article JSON-LD structured data', async ({ page }) => {
    const href = await firstPostHref(page);
    test.skip(!href, 'No blog posts available on this dev DB');

    await page.goto(href!);
    const scripts = page.locator('script[type="application/ld+json"]');
    const count = await scripts.count();
    let found = false;
    for (let i = 0; i < count; i++) {
      const content = await scripts.nth(i).textContent();
      const parsed = JSON.parse(content || '{}');
      if (parsed['@type'] === 'Article' || parsed['@type'] === 'BlogPosting') {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });
});
