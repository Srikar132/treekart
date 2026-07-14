import { test, expect } from '@playwright/test';
import { safeRedirect } from '@/lib/safe-redirect';

/**
 * Cross-cutting middleware / route-group behavior.
 *
 * Source of truth: proxy.ts (matcher config) + utils/supabase/proxy.ts (updateSession)
 * + lib/auth.ts (requireUser / requireAdmin / requireFarmer).
 *
 * All tests here run UNAUTHENTICATED (no Supabase session cookie). That is
 * deliberate: it keeps this suite deterministic and independent of the
 * phone+OTP flow (owned by the auth-flow test suite). Authenticated role-based
 * behavior (admin bounced from /account, farmer bounced from /admin, AAL2 gate,
 * onboarding gate) requires a real signed-in session and is intentionally left
 * to that suite.
 */

test.describe('proxy.ts matcher — excluded paths bypass middleware entirely', () => {
  // proxy.ts config.matcher explicitly excludes: _next/static, _next/image,
  // favicon.ico, sitemap.xml, robots.txt, manifest.json, manifest.webmanifest,
  // and common static file extensions (svg/png/jpg/jpeg/gif/webp/json/webmanifest).
  // If middleware DID intercept these, an unauthenticated request would be
  // redirected to /auth/signin (or /admin/login for /admin/*) by updateSession's
  // Phase 1 branch. So "not redirected" is the observable proof of exclusion.

  const excludedPaths = ['/favicon.ico', '/manifest.json', '/sitemap.xml', '/robots.txt'];

  for (const path of excludedPaths) {
    test(`GET ${path} is served directly, not redirected by the proxy`, async ({ page }) => {
      const res = await page.request.get(path);
      expect(res.status(), `${path} should respond 200`).toBe(200);
      expect(res.url(), `${path} should not be rewritten to an auth page`).not.toContain('/auth/signin');
      expect(res.url()).not.toContain('/admin/login');
    });
  }
});

test.describe('proxy.ts — public routes stay reachable while signed out', () => {
  // These are all listed in PUBLIC_PREFIXES (or "/") in utils/supabase/proxy.ts.
  // An unauthenticated visitor must never be bounced to /auth/signin here.
  const publicPaths = ['/', '/store', '/rent', '/blog', '/about', '/contact', '/faq', '/privacy', '/terms'];

  for (const path of publicPaths) {
    test(`${path} does not redirect an anonymous visitor to sign-in`, async ({ page }) => {
      await page.goto(path);
      expect(page.url()).not.toContain('/auth/signin');
    });
  }

  test('/trees/:id (dynamic, no index page) is not intercepted even for a missing id', async ({ page }) => {
    // app/(storefront)/trees/ has no index page.tsx, only trees/[id]/page.tsx.
    // A bogus id should 404 at the app layer, but the PROXY must still treat
    // it as public (prefix match on "/trees") and never redirect to sign-in.
    await page.goto('/trees/this-tree-does-not-exist');
    expect(page.url()).not.toContain('/auth/signin');
  });
});

test.describe('proxy.ts — customer-only and admin route groups redirect when signed out', () => {
  test('/account redirects to /auth/signin with a safe redirectTo', async ({ page }) => {
    await page.goto('/account');
    expect(page.url()).toContain('/auth/signin');
    const url = new URL(page.url());
    // redirectTo is passed through lib/safe-redirect.ts and always starts with "/"
    const redirectTo = url.searchParams.get('redirectTo');
    expect(redirectTo).toBeTruthy();
    expect(redirectTo!.startsWith('/')).toBe(true);
    expect(redirectTo).toContain('/account');
  });

  test('/checkout redirects to /auth/signin (CUSTOMER_ONLY_PREFIXES)', async ({ page }) => {
    await page.goto('/checkout');
    expect(page.url()).toContain('/auth/signin');
  });

  test('/admin redirects to /admin/login, NOT /auth/signin (isAdminRoute short-circuit)', async ({ page }) => {
    await page.goto('/admin');
    expect(page.url()).toContain('/admin/login');
    expect(page.url()).not.toContain('/auth/signin');
  });

  test('/admin/login itself is reachable while signed out (it is in AUTH_PAGES)', async ({ page }) => {
    await page.goto('/admin/login');
    expect(page.url()).toContain('/admin/login');
  });

  test('a nested admin path also bounces to /admin/login', async ({ page }) => {
    await page.goto('/admin/orders');
    expect(page.url()).toContain('/admin/login');
  });
});

test.describe('proxy.ts — redirectTo is computed via lib/safe-redirect.ts', () => {
  test('/account (unauthenticated) round-trips its own path as redirectTo', async ({ page }) => {
    await page.goto('/account/orders?tab=history');
    expect(page.url()).toContain('/auth/signin');
    const url = new URL(page.url());
    expect(url.searchParams.get('redirectTo')).toBe('/account/orders?tab=history');
  });

  // The open-redirect guard itself (safeRedirect) is a pure function with no
  // Next.js-server-only imports, so it is exercised directly here rather than
  // through a full sign-in round trip (which would require completing phone
  // OTP just to observe where the client redirects afterwards — that flow is
  // owned by the auth-flow test suite). This directly covers the exact attack
  // shapes called out in the function's own comments.
  test('safeRedirect() rejects absolute URLs, protocol-relative and backslash payloads', () => {
    expect(safeRedirect('https://evil.com')).toBe('/');
    expect(safeRedirect('//evil.com')).toBe('/');
    expect(safeRedirect('/\\evil.com')).toBe('/');
    expect(safeRedirect(undefined)).toBe('/');
    expect(safeRedirect(null)).toBe('/');
    expect(safeRedirect('')).toBe('/');
  });

  test('safeRedirect() allows legitimate same-origin relative paths through unchanged', () => {
    expect(safeRedirect('/account/orders')).toBe('/account/orders');
    expect(safeRedirect('/checkout/store?ref=cart')).toBe('/checkout/store?ref=cart');
  });

  test('safeRedirect() falls back for scheme-based payloads that do not start with "/"', () => {
    expect(safeRedirect('http://evil.com/x')).toBe('/');
    expect(safeRedirect('javascript:alert(1)')).toBe('/');
  });

  test('safeRedirect() honors a custom fallback when provided', () => {
    expect(safeRedirect('https://evil.com', '/store')).toBe('/store');
  });
});

test.describe('(farmer) route group', () => {
  // Confirmed via `Glob app/(farmer)/**` during test authoring: it returned NO
  // files. The (farmer) route group referenced in CLAUDE.md / lib/auth.ts
  // (requireFarmer -> redirect "/") and proxy.ts (FARMER_PREFIX = "/farmer",
  // isFarmerRoute) has no actual pages yet, so requireFarmer() and the
  // farmer-role UI redirects in updateSession's Phase 7 cannot be exercised
  // through real farmer pages. Per the task brief, we note this explicitly
  // rather than testing against nonexistent UI, and skip only the page-level
  // scenarios (signed-in-as-farmer redirects, requireFarmer() itself) — see
  // the single test below for the one farmer-adjacent behavior that IS
  // testable today without any (farmer) pages existing.

  test('unauthenticated /farmer still redirects to /auth/signin via the generic Phase-1 catch-all', async ({ page }) => {
    // This part of updateSession() does not require any (farmer) pages to
    // exist: for an unauthenticated request, /farmer is neither a public
    // prefix nor an admin route, so it falls through to redirectToSignin()
    // regardless of whether Next.js would otherwise 404 the route. This is
    // the one farmer-adjacent behavior we CAN test today without real pages.
    await page.goto('/farmer');
    expect(page.url()).toContain('/auth/signin');
  });
});
