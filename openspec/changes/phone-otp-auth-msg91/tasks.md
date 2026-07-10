## 1. External setup & prerequisites

- [ ] 1.1 Create MSG91 account; obtain auth key, sender ID, OTP template ID
- [ ] 1.2 Complete DLT sender ID + OTP template registration (TRAI) — start early, has lead time
- [ ] 1.3 Create Cloudflare Turnstile site + secret keys
- [ ] 1.4 Add secrets to `.env.local` + deployment + Supabase: `MSG91_AUTH_KEY`, `MSG91_SENDER_ID`, `MSG91_TEMPLATE_ID`, `SEND_SMS_HOOK_SECRET`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
- [ ] 1.5 Confirm TOTP MFA is enabled on the Supabase project (free on all plans)

## 2. Send SMS Hook → MSG91 (Edge Function)

- [ ] 2.1 Create `supabase/functions/send-sms/index.ts` receiving Supabase's OTP payload (phone + code)
- [ ] 2.2 Verify the Supabase hook secret on every request; reject unsigned calls with an error and no SMS
- [ ] 2.3 Call the MSG91 send API using the DLT-registered template + sender
- [ ] 2.4 Map MSG91 failure responses to an error the auth flow can surface (no partial session)
- [ ] 2.5 Deploy the function and register it as the Send SMS Hook in Supabase

## 3. Supabase config

- [ ] 3.1 In `supabase/config.toml` set `[auth.sms] enable_signup = true`, `enable_confirmations = true`
- [ ] 3.2 Register the Send SMS Hook (`[auth.hook.send_sms]`); do NOT enable any native `[auth.sms.<provider>]` block
- [ ] 3.3 Disable `[auth.email] enable_signup`
- [ ] 3.4 Enable `[auth.captcha]` with `provider = "turnstile"` and `secret = "env(TURNSTILE_SECRET_KEY)"`
- [ ] 3.5 Enable `[auth.mfa.totp]` enroll + verify
- [ ] 3.6 Tighten `[auth.rate_limit]` `sms_sent` / `token_verifications`
- [ ] 3.7 Ensure the OTP `template` matches the DLT-registered MSG91 template exactly
- [ ] 3.8 Local dev path: configure `[auth.sms.test_otp]` (fixed number → code map) and disable CAPTCHA in the local config, so developers never call MSG91 or need a Turnstile token
- [ ] 3.9 Set an MSG91 account spend limit + low-balance alert as a backstop against runaway sends
- [ ] 3.10 Set SMS OTP expiry to ~300s. **Verify where**: the installed CLI's `[auth.sms]` may expose no expiry key — if not, set it in the Supabase dashboard (Auth → Providers → Phone) and note it in the runbook

## 4. Database migration

- [ ] 4.1 New migration: add a SQL phone-normalization helper (10-digit / `91…` / `0…` → `+91` E.164, NULL when invalid)
- [ ] 4.2 Create `phone_migration_report` table; record `invalid_or_null` and `duplicate` profiles
- [ ] 4.3 Normalize `profiles.phone` in place for valid, non-colliding rows
- [ ] 4.4 **NULL the phone on every row of a collision group** and on every un-normalizable value (both sides, not just extras) — otherwise identical raw values remain and the unique index cannot be built
- [ ] 4.5 Backfill `auth.users.phone` + `phone_confirmed_at` from the surviving normalized profiles only
- [ ] 4.6 Add partial `UNIQUE` index on `profiles.phone` (`WHERE phone IS NOT NULL`) — assert it builds cleanly
- [ ] 4.7 Replace `handle_new_user_with_email` with `handle_new_user` (phone + metadata, role default `user`, email/full_name left to onboarding); drop the old function
- [ ] 4.8 Make `handle_new_user` conflict-safe: `ON CONFLICT` on both `profiles.id` and the phone index so a collision can never roll back the `auth.users` insert
- [ ] 4.9 Create `admin_recovery_codes` (`user_id`, `code_hash`, `used_at`, `created_at`); enable RLS with **no client policies** — service role only
- [ ] 4.10 Verify RLS policies still pass (no changes expected — they key on `auth.uid()` / `profiles.role`)
- [ ] 4.11 Count duplicates on a production snapshot **before** running; plan the re-link of their orphaned `orders`/`rentals`

## 5. Validation & server actions

- [ ] 5.1 Create `lib/phone.ts`: `extractDigits`, `isValidIndianMobile`, `toE164`, `isE164`
- [ ] 5.1b Create a `safeRedirect(value)` validator — accepts only root-relative `/…` paths; rejects absolute URLs and protocol-relative `//host`; falls back to the default destination. Use it at **every** `redirectTo` navigation
- [ ] 5.1c Create `lib/email-typo.ts` — common misspelled-domain map (`gmial`→`gmail`, `yahooo`→`yahoo`, `hotmial`→`hotmail`, `outlok`→`outlook`, …) returning an advisory suggestion only
- [ ] 5.2 In `lib/validations.ts` add `phoneSchema`, `otpSchema`, `profileCompletionSchema` (name required; email **optional** but valid when non-empty), and `orderEmailSchema` (email required + valid); remove `signInSchema`, `signUpSchema`, `forgotPasswordSchema`, `resetPasswordSchema`
- [ ] 5.3 Add `otpAj` sliding-window rule to `lib/arcjet.ts`
- [ ] 5.4 Rewrite `actions/auth.actions.ts`: `sendOtp` (Arcjet + Turnstile `captchaToken` + `signInWithOtp({ shouldCreateUser: true })`), `verifyOtp` (→ session, returns `needsProfile` + `role`), `logout`
- [ ] 5.5 Remove `loginUser`, `registerUser`, `requestPasswordReset`, `updatePassword`, `resendVerificationEmail`
- [ ] 5.6 Ensure `sendOtp` returns an identical response whether or not the number is registered (no enumeration)
- [ ] 5.7 Add `completeProfile({ fullName, email? })` to `actions/user.actions.ts` — writes `email` only when provided, leaves it null when skipped
- [ ] 5.8 Add `saveContactEmail({ email })` to `actions/user.actions.ts` for the checkout prompt (writes the same `profiles.email`)

## 6. Auth helpers & routing

- [ ] 6.1 Update `lib/auth.ts`: `getUser` selects phone + email from `profiles`, phone-primary; `AuthUser` no longer exposes an auth email
- [ ] 6.2 Update `utils/supabase/proxy.ts`: trim `AUTH_PAGES` (drop forgot/reset), remove the `/auth/callback` and `/auth/reset-password` bypasses
- [ ] 6.3 Add profile-completion gate: authenticated users without `full_name` are redirected to `/auth/signin?redirectTo=…`; allow that route through so it does not loop. **Gate on `full_name` only — never on `email`**, or users who skipped email are trapped
- [ ] 6.4 Add AAL2 enforcement for `/admin/*`; explicitly allow the admin login at AAL1 so MFA can be completed (no redirect loop)
- [ ] 6.5 Order the gates: for `role === 'admin'`, evaluate AAL2 **before** the profile-completion gate (prevents `/admin/login` ↔ `/auth/signin` ping-pong)
- [ ] 6.6 Validate `redirectTo` with `safeRedirect` wherever the proxy sets or consumes it
- [ ] 6.7 Delete `app/(api)/auth/callback/route.ts` (and the now-empty `(api)/auth` dir)

## 7. Storefront UI

- [ ] 7.1 Add `components/storefront/auth/turnstile.tsx` — self-contained Turnstile widget (no new npm dependency); expose a `reset()` so a fresh token can be minted per send
- [ ] 7.2 Build `components/storefront/auth/phone-otp-form.tsx` — single phone field → OTP screen; resend cooldown; "change number"; `AnimatedButton`; OKLCH tokens
- [ ] 7.2b Reset the Turnstile widget before every send **including resend** (tokens are single-use); never resubmit a consumed token
- [ ] 7.2c Persist the pending phone across a reload of the OTP step; if unrecoverable, fall back to the phone-entry step
- [ ] 7.3 Build the responsive profile dialog: top sheet on mobile, centered modal on desktop; Base UI `render` prop (not `asChild`). Name required; email optional with helper text — "We'll send order confirmations and delivery updates here" — and a visible optional marker + skip path
- [ ] 7.3b Extract the dialog shell so the checkout email prompt reuses the same responsive component (one component, two contents)
- [ ] 7.4 Wire the dialog to open after `verifyOtp` when `needsProfile`, then redirect to `safeRedirect(redirectTo)`
- [ ] 7.5 `app/(storefront)/auth/signin/page.tsx` branches on session: unauthenticated → phone form; authenticated without `full_name` → dialog open. Make `/auth/signup` forward to it (single flow)
- [ ] 7.6 Delete `app/(storefront)/auth/forgot-password` + `reset-password` pages and `forgot-password-form.tsx`, `reset-password-form.tsx`, `signin-form.tsx`, `signup-form.tsx`
- [ ] 7.7 Verify responsiveness at mobile / tablet / desktop breakpoints

## 8. Admin auth & MFA

- [ ] 8.1 Rewrite `app/(admin)/admin/(admin-auth)/login/page.tsx` as a step machine: `phone → otp → mfa-enroll | mfa-challenge`
- [ ] 8.2 Post-OTP: confirm `profiles.role === 'admin'`, else `signOut()` + access denied
- [ ] 8.3 Branch on `mfa.getAuthenticatorAssuranceLevel()` — `nextLevel === 'aal2'` → challenge existing factor; otherwise enrol
- [ ] 8.4 Enrol: `mfa.enroll({ factorType: 'totp' })`, render the returned QR; clean up any stale unverified factor first
- [ ] 8.5 Verify: `mfa.challenge` + `mfa.verify` → AAL2 → redirect `/admin`
- [ ] 8.6 Admin OTP send uses `shouldCreateUser: false` + Turnstile
- [ ] 8.7 Normalize the admin send response so an unregistered number is indistinguishable from a registered one (do not surface Supabase's "signups not allowed" error)
- [ ] 8.8 On enrolment, generate N single-use recovery codes; **display once**; persist only hashes to `admin_recovery_codes`; never log plaintext
- [ ] 8.9 Add a "Lost your authenticator?" path on the MFA challenge step
- [ ] 8.10 `redeemRecoveryCode` server action: require an `aal1` session **and** `role='admin'`; verify hash; mark `used_at`; then unenrol the dead TOTP factor via the **service role** (server-side key only)
- [ ] 8.11 After redemption, route the admin into enrolment (new QR) — redemption MUST NOT grant AAL2 by itself
- [ ] 8.12 Rate-limit redemption attempts (Arcjet); return a uniform failure that never reveals whether a code exists

## 9. Order email capture (progressive profiling)

- [ ] 9.1 Server gate: `createMangoOrder` and `createRentalOrder` re-read `profiles.email` and reject when null — never trust the client
- [ ] 9.2 On rejected rental creation, release any tree reservation taken for that attempt (no dangling reservation)
- [ ] 9.3 Checkout clients detect a missing email and open the shared responsive dialog before payment, explaining the address receives order confirmations and delivery updates
- [ ] 9.4 On save, call `saveContactEmail` and resume checkout from where it paused (cart + address state preserved)
- [ ] 9.5 On dismiss, block only the order — leave the user on checkout with cart and address intact
- [ ] 9.6 Make `profiles.email` editable from account settings (`profile-settings.tsx`)
- [ ] 9.7 Ensure a saved email is not re-prompted on subsequent orders

## 10. Cleanup & consistency

- [ ] 10.1 Grep for and remove leftover `signInWithPassword`, `exchangeCodeForSession`, `resetPasswordForEmail`, `/auth/forgot-password` references
- [ ] 10.2 Audit `account-client.tsx`, `app-sidebar.tsx`, `cart-sidebar.tsx`, `profile-settings.tsx` for email/password assumptions
- [ ] 10.3 Ensure Razorpay prefill uses phone (`contact`) and email only when present
- [ ] 10.4 Confirm `sendOrderConfirmedEmail` still guards on a present email (it already does)
- [ ] 10.5 Update `.claude/CLAUDE.md` auth section to describe phone + OTP and progressive email capture
- [ ] 10.6 Re-add `@fission-ai/openspec` to `devDependencies` (lost in the revert)

## 11. Verification

- [ ] 11.1 New user: phone → OTP → profile dialog → lands on original destination
- [ ] 11.2 New user **skips email**: onboarding completes, `profiles.email` null, browsing unrestricted
- [ ] 11.3 Returning user: phone → OTP → straight to `redirectTo`, no dialog
- [ ] 11.4 Deep link preserved: hit `/checkout` unauthenticated → sign in → land on `/checkout`
- [ ] 11.5 Admin first login: phone → OTP → QR enrol → TOTP → `/admin`
- [ ] 11.6 Admin returning: phone → OTP → TOTP challenge → `/admin`; blocked at AAL1; no redirect loop
- [ ] 11.7 Non-admin completing OTP at `/admin/login` is signed out and denied
- [ ] 11.8 Abuse: OTP send without Turnstile token fails; repeated sends throttle
- [ ] 11.9 Migration: a backfilled existing user signs in by phone; duplicates/nulls appear in `phone_migration_report`
- [ ] 11.10 RLS regression: a user sees only their own orders/rentals; an admin sees all
- [ ] 11.11 Open redirect: `?redirectTo=https://evil.com` and `?redirectTo=//evil.com` both land on the default destination, not offsite
- [ ] 11.12 Resend works twice in a row (fresh Turnstile token each time, no silent failure)
- [ ] 11.13 Refresh on the OTP step keeps the pending number, or cleanly returns to phone entry
- [ ] 11.14 Admin with no `full_name` reaches `/admin/login` and completes MFA without ping-ponging to `/auth/signin`
- [ ] 11.15 Migration dry-run on a snapshot with seeded duplicates: all colliding rows nulled, report populated, `UNIQUE` index builds
- [ ] 11.16 Signup succeeds even when an orphaned `profiles` row already holds the same phone (trigger conflict-safe)
- [ ] 11.17 Unregistered number at `/admin/login` returns the same response as a registered one
- [ ] 11.18 Email-less user at checkout: dialog prompts, saving resumes checkout with cart + address intact
- [ ] 11.19 Dismissing the checkout email prompt creates no order and loses no cart state
- [ ] 11.20 **Direct call** to `createMangoOrder` / `createRentalOrder` without a profile email is rejected; no rental reservation left dangling
- [ ] 11.21 Second order by the same user does not re-prompt for email
- [ ] 11.22 Recovery: admin redeems a code → old factor gone → forced to re-enrol → AAL2 only after new TOTP verify
- [ ] 11.23 Recovery abuse: a used code is rejected; redemption without an `aal1` session is rejected; a non-admin session is rejected; repeated attempts throttle
- [ ] 11.24 Recovery codes never appear in plaintext in the database or server logs
- [ ] 11.25 Typo suggestion: `name@gmial.com` offers `name@gmail.com`; ignoring it still saves the typed value
- [ ] 11.26 OTP expires at ~5 minutes (a code entered after the window is rejected)
- [ ] 11.27 A pre-cutover session keeps working after deploy and is not forced to re-authenticate
- [ ] 11.28 `npm run build` + `npm run lint` pass
