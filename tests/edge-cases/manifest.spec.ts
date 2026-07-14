import { test, expect } from '@playwright/test';

/**
 * Manifest / PWA. Commit bb3392f ("Clean up account pages, fix phone display,
 * fix manifest.json 404") regressed-then-fixed a 404 on /manifest.json — this
 * guards against a repeat. The file itself lives at public/manifest.json and
 * is referenced from app/layout.tsx metadata.manifest = "/manifest.json".
 */

test('GET /manifest.json returns 200 with valid, well-formed PWA manifest JSON', async ({ page }) => {
  const res = await page.request.get('/manifest.json');
  expect(res.status()).toBe(200);

  const contentType = res.headers()['content-type'] ?? '';
  expect(contentType).toMatch(/json/i);

  const body = await res.json(); // throws if not valid JSON

  expect(body.name).toBe('TreeKart — Rent a Mango Tree');
  expect(body.short_name).toBe('TreeKart');
  expect(body.start_url).toBe('/');
  expect(body.display).toBe('standalone');
  expect(Array.isArray(body.icons)).toBe(true);
  expect(body.icons.length).toBeGreaterThan(0);
  for (const icon of body.icons) {
    expect(icon.src).toBeTruthy();
    expect(icon.sizes).toBeTruthy();
    expect(icon.type).toBeTruthy();
  }
});

test('every icon referenced by the manifest is actually served', async ({ page }) => {
  const manifestRes = await page.request.get('/manifest.json');
  const body = await manifestRes.json();

  for (const icon of body.icons as Array<{ src: string }>) {
    const iconRes = await page.request.get(icon.src);
    expect(iconRes.status(), `icon ${icon.src} should be served`).toBe(200);
  }
});

test('the home page links to the manifest via <link rel="manifest">', async ({ page }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBe('/manifest.json');

  // And that link target itself resolves (not a 404).
  const res = await page.request.get(href!);
  expect(res.status()).toBe(200);
});
