## Why

Password reset is broken in production. Users click "Forgot password", receive the email, and click the link — but instead of the reset-password screen they land back on the sign-in page. The reset link points at `/auth/callback?code=...`, but `proxy.ts` intercepts that request first. Because the session does not exist yet (the whole purpose of the callback is to *create* it by exchanging the code), the proxy's unauthenticated branch bounces the request to `/auth/signin?redirectTo=/auth/callback?code=...`. The callback route handler never runs, so the code is never exchanged. The same latent defect affects signup email confirmation, which uses the identical callback path.

## What Changes

- Allow `/auth/callback` to pass through `proxy.ts` unauthenticated, so `app/(api)/auth/callback/route.ts` can run `exchangeCodeForSession` and establish the session before any auth gating.
- Treat the callback (and any confirmation endpoint) as an auth-flow route, not a protected route — an unauthenticated hit is expected and correct.
- No change to the Supabase project configuration, the email templates, or the callback route handler itself; they are already correct.

## Capabilities

### New Capabilities
- `auth-callback-routing`: Defines how the auth callback endpoint is treated by the proxy/edge routing layer — it must be reachable without an existing session so the OAuth/recovery/confirmation code can be exchanged for a session.

### Modified Capabilities
<!-- No existing specs in openspec/specs/ yet; nothing to modify. -->

## Impact

- **Code**: `utils/supabase/proxy.ts` (route allow-list / early return for the callback). No change to `app/(api)/auth/callback/route.ts` or `actions/auth.actions.ts`.
- **Flows fixed**: password reset (`requestPasswordReset` → `/auth/callback?next=/auth/reset-password`) and signup email confirmation (`registerUser` → `/auth/callback`).
- **Supabase config**: none. Redirect URLs and templates already point at `/auth/callback`.
- **Risk**: low, scoped to routing. Must ensure the allow-list matches only the exact callback path(s), not a broad prefix that would expose protected routes.

## Non-goals

- Migrating password reset to email OTP (tracked as a separate follow-up change).
- Redesigning the sign-in / reset-password UI.
- Changing role-based gating for admin/farmer/customer routes.
