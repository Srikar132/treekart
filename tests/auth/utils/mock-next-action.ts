import type { Page, Route } from "@playwright/test";

/**
 * Intercept the browser-side network call Next.js makes when a Client
 * Component invokes an imported `"use server"` action (e.g. `verifyOtp`,
 * `sendOtp`, `completeProfile`).
 *
 * Why this is needed:
 * Real OTP delivery goes through Supabase -> MSG91 SMS, and real Turnstile
 * verification needs a live secret — neither is available (or safe to trigger,
 * since SMS costs money and is rate-limited) in this environment. But the
 * *invocation* of a Server Action is still a plain HTTP POST dispatched by the
 * browser to the current page URL, carrying a `Next-Action` header. That
 * request IS visible to Playwright's `page.route`, so we can short-circuit it
 * before it ever reaches the Next.js server (and therefore before it would
 * ever reach Supabase/Arcjet/Turnstile) and hand the client the response we
 * want it to see.
 *
 * Fragility warning:
 * Next.js transports the action's return value using the React Server
 * Components "Flight" wire protocol, even when the action returns a plain
 * JSON-serializable object (no JSX). For a simple data-only return, that
 * protocol currently serializes as a single `<rowId>:<json>\n` line. That
 * framing is a Next.js implementation detail, not a public API — if a future
 * Next.js release changes it, `flightRow` below is the one place to fix.
 * This project pins Next.js 16.2.4 (see CLAUDE.md); re-verify this helper
 * after any Next upgrade.
 *
 * Usage: call `mockNextAction(page, value)` immediately before triggering the
 * one Server Action call you want to fake (e.g. right before clicking
 * "Verify & Continue"). It intercepts the *next* matching POST only, then
 * stops intercepting so later, unrelated action calls in the same test are
 * unaffected.
 *
 * KNOWN BROKEN as of Next 16.2.4 / Playwright (see tests/auth/signin-otp.spec.ts
 * "resending starts the cooldown" and "renders the server's error message"):
 * even a `route.fulfill` body captured byte-for-byte from a real, unmocked
 * response (verified via direct comparison) leaves the client's action
 * promise permanently pending — no console error, no failed request, it
 * simply never resolves. Root cause not isolated; likely something about how
 * Chrome DevTools Protocol's Fetch-domain interception interacts with the
 * Flight client's stream consumption that a byte-identical body doesn't
 * capture (framing/timing, not content). Don't sink more time into this
 * without a stronger lead — the affected tests are marked `test.fixme`.
 */
export async function mockNextAction(page: Page, value: unknown): Promise<void> {
    let handled = false;

    const handler = async (route: Route) => {
        const request = route.request();
        const isActionCall =
            request.method() === "POST" && !!request.headers()["next-action"];

        if (!isActionCall || handled) {
            await route.continue();
            return;
        }

        handled = true;
        await route.fulfill({
            status: 200,
            contentType: "text/x-component",
            body: flightRow(1, value),
        });
        await page.unroute(currentPathPattern(page), handler);
    };

    await page.route(currentPathPattern(page), handler);
}

function currentPathPattern(page: Page): string {
    // Match same-origin requests to the current page path regardless of query string.
    const url = new URL(page.url());
    return `${url.origin}${url.pathname}*`;
}

/**
 * Reproduces the exact 3-line sequence Next 16.2.4 dev mode sends for a
 * resolved `"use server"` action returning a plain JSON-serializable value:
 *
 *   0:{"a":"$@1","f":"","q":"","i":true,"b":"development"}
 *   1:D"$2"
 *   1:{...the actual return value...}
 *
 * Row 0 announces the action's return as a pending promise at row 1; row 1
 * is then sent twice — first a dev-mode-only pending/debug marker, then
 * overwritten with the resolved value. Captured by letting a real sendOtp
 * call go through unmocked and inspecting the raw response body; this is a
 * private Next.js wire format, not a public API — re-verify after any Next
 * upgrade (see the fragility note above).
 */
function flightRow(rowId: number, value: unknown): string {
    return (
        `0:{"a":"$@${rowId}","f":"","q":"","i":true,"b":"development"}\n` +
        `${rowId}:D"$2"\n` +
        `${rowId}:${JSON.stringify(value)}\n`
    );
}

/**
 * Stub `window.turnstile` so components/storefront/auth/turnstile.tsx's render
 * effect invokes its `callback` with a fake token synchronously, instead of
 * loading the real challenges.cloudflare.com script.
 *
 * Why this is needed: even with Cloudflare's official "always passes" test
 * site key, the real widget fingerprints the automation stack it's running in
 * and does not reliably auto-verify under Playwright's headless Chromium —
 * the callback that supplies the captcha token to the app just never fires,
 * so any flow gated on a truthy token (sendOtp/resend) stays stuck forever.
 * Must be called via addInitScript (before the page's own scripts run), since
 * the component only appends the real script tag when `window.turnstile` is
 * still undefined at mount time.
 */
export async function stubTurnstile(page: Page): Promise<void> {
    await page.addInitScript(() => {
        (window as unknown as { turnstile: unknown }).turnstile = {
            render: (_el: HTMLElement, opts: { callback?: (token: string) => void }) => {
                opts.callback?.("test-turnstile-token");
                return "stub-widget-id";
            },
            reset: () => {},
            remove: () => {},
        };
    });
}
