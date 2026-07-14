import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * next/image remote-host allowlist (next.config.ts `images.remotePatterns`).
 *
 * Rather than hunting the app for an actual <img> tag pointing at a
 * non-whitelisted host (there isn't one — that's the point of the
 * allowlist), this exercises the real Next.js image optimizer endpoint
 * directly: `/_next/image?url=<...>&w=...&q=...`. Next.js itself enforces
 * remotePatterns at that endpoint and returns 400 for any host not listed,
 * regardless of whether any component in the app currently references it.
 * This is a genuine E2E check of the running server's configuration, not a
 * mock.
 */

test('next.config.ts allows exactly the three documented remote hostnames', () => {
  const configSource = fs.readFileSync(path.resolve(__dirname, '../../next.config.ts'), 'utf-8');

  for (const host of ['images.unsplash.com', 'res.cloudinary.com', 'img.youtube.com']) {
    expect(configSource).toContain(host);
  }

  // Loosely count remotePatterns entries to catch an accidental new host
  // being added without updating this test/CLAUDE.md.
  const matches = configSource.match(/hostname:\s*"([^"]+)"/g) ?? [];
  expect(matches).toHaveLength(3);
});

test('the image optimizer rejects a non-whitelisted remote host with 400', async ({ page }) => {
  const url = encodeURIComponent('https://evil-cdn.example.com/photo.jpg');
  const res = await page.request.get(`/_next/image?url=${url}&w=256&q=75`);
  expect(res.status()).toBe(400);
});

test('the image optimizer rejects a near-miss host that merely contains an allowed one', async ({ page }) => {
  // Guards against a naive substring-based allowlist check rather than exact
  // hostname matching — "res.cloudinary.com.evil.com" must NOT pass.
  const url = encodeURIComponent('https://res.cloudinary.com.evil.com/photo.jpg');
  const res = await page.request.get(`/_next/image?url=${url}&w=256&q=75`);
  expect(res.status()).toBe(400);
});

test('the image optimizer accepts a same-origin local asset', async ({ page }) => {
  const url = encodeURIComponent('/logo.webp');
  const res = await page.request.get(`/_next/image?url=${url}&w=256&q=75`);
  expect(res.status()).toBe(200);
});
