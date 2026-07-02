## 1. Fix the proxy routing

- [x] 1.1 In `utils/supabase/proxy.ts`, add an early return at the top of `updateSession` (before the `getUser()` gating) that returns `supabaseResponse` when `pathname === '/auth/callback'`. Match the path exactly, not by prefix.
- [x] 1.2 If a dedicated confirmation endpoint exists or is planned (`/auth/confirm`), add it as an additional exact-match bypass; otherwise leave a comment noting where to add it. (No confirm endpoint exists; comment left noting where to add it.)
- [x] 1.3 Confirm `AUTH_PAGES` and `PUBLIC_PREFIXES` are left unchanged so the PHASE 3 authenticated-bounce logic and public content routing are unaffected.

## 2. Verify the flows

- [x] 2.1 Password reset: run "Forgot password", open the email link, confirm the browser lands on `/auth/reset-password` (not `/auth/signin`) and that `updatePassword` succeeds with a valid session.
- [x] 2.2 Signup confirmation: register a new account, click the confirmation link, confirm the callback exchanges the code and redirects to the intended `next` destination.
- [x] 2.3 Regression: while logged out, visit `/account` and `/checkout` and confirm both still redirect to `/auth/signin` (allow-list did not widen).
- [x] 2.4 Regression: while logged in as admin/farmer/customer, confirm role-based bounces on auth pages and cross-role routes still behave as before.
