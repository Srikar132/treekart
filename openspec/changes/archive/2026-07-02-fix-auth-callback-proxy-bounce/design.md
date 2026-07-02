## Context

`proxy.ts` (Next.js 16 proxy, the replacement for `middleware.ts`) delegates to `updateSession` in `utils/supabase/proxy.ts`. Its matcher runs on nearly every request, excluding only `_next/static`, `_next/image`, `favicon.ico`, and static image extensions. `/auth/callback` therefore hits the proxy.

`updateSession` calls `supabase.auth.getUser()` and, in PHASE 1 (`!user`), allows only `isPublicRoute` or `isAuthPage` paths through; everything else is redirected to `/auth/signin?redirectTo=<path+search>`.

- `PUBLIC_PREFIXES` contains `/api` — but the callback URL is `/auth/callback` (the `(api)` route group does not appear in the URL), so it does not match.
- `AUTH_PAGES` lists `/auth/signin`, `/auth/signup`, `/auth/forgot-password`, `/auth/reset-password`, `/admin/login` — `/auth/callback` is absent.

Result: the callback is neither public nor an auth page, so PHASE 1 redirects it to sign-in **before** `app/(api)/auth/callback/route.ts` can call `exchangeCodeForSession`. The session is never created and the reset/confirmation flow dies at sign-in. The callback route handler and the Supabase config are both correct — they simply never execute.

## Goals / Non-Goals

**Goals:**
- Let `/auth/callback` reach its route handler while unauthenticated.
- Fix password reset and signup email confirmation with one routing change.
- Keep the allow-list tight so no protected route is exposed.

**Non-Goals:**
- OTP-based recovery (separate change).
- Any change to the callback handler, server actions, Supabase templates, or redirect URLs.
- UI changes.

## Decisions

**Decision: Add the callback to the unauthenticated allow-list in `updateSession`.**
Treat `/auth/callback` (and `/auth/confirm` if/when added) as an auth-flow route that must pass through PHASE 1. Preferred implementation: an explicit early return at the top of `updateSession`, before the `getUser()` gating, e.g. a guard that returns `supabaseResponse` when `pathname === '/auth/callback'`. This is clearer than overloading `PUBLIC_PREFIXES` (which is semantically "public content pages") or `AUTH_PAGES` (which drive the PHASE 3 authenticated bounce logic).

Rationale for early return over adding to `AUTH_PAGES`: `isAuthPage` is also consulted in PHASE 3 for authenticated users, where it bounces them to their role home. An already-authenticated user hitting the callback (e.g. re-clicking a link) should still be allowed to complete/settle the exchange, so the callback should not participate in the PHASE 3 bounce.

**Decision: Match the callback path exactly.**
Use exact path equality (`pathname === '/auth/callback'`), not `startsWith`, to avoid widening the bypass. If a confirm endpoint is added later, add it as another exact match.

## Risks / Trade-offs

- **Over-broad allow-list** → exposing protected routes. Mitigated by exact-path matching and a scenario asserting `/account` and `/checkout` stay gated.
- **Cookie/PKCE dependency**: `exchangeCodeForSession` relies on the `code_verifier` cookie set when `resetPasswordForEmail`/`signUp` ran. Same-browser flow keeps this cookie; cross-device link clicks will still fail at exchange. This is inherent to the PKCE magic-link model and is precisely what the follow-up OTP change removes — noted here, not solved here.
- **Low blast radius**: change is confined to routing logic in one file; the callback handler already returns `/auth/signin?error=confirmation_failed` on exchange failure, so error handling is unchanged.
