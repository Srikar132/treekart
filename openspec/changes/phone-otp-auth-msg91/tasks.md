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

## 4. Database migration

- [ ] 4.1 New migration: add a SQL phone-normalization helper (10-digit / `91…` / `0…` → `+91` E.164, NULL when invalid)
- [ ] 4.2 Create `phone_migration_report` table; record `invalid_or_null` and `duplicate` profiles
- [ ] 4.3 Normalize `profiles.phone` in place for valid, non-colliding rows
- [ ] 4.4 Backfill `auth.users.phone` + `phone_confirmed_at` from normalized profiles (skip collisions)
- [ ] 4.5 Add partial `UNIQUE` index on `profiles.phone` (`WHERE phone IS NOT NULL`)
- [ ] 4.6 Replace `handle_new_user_with_email` with `handle_new_user` (phone + metadata, role default `user`, email/full_name left to onboarding); drop the old function
- [ ] 4.7 Verify RLS policies still pass (no changes expected — they key on `auth.uid()` / `profiles.role`)

## 5. Validation & server actions

- [ ] 5.1 Create `lib/phone.ts`: `extractDigits`, `isValidIndianMobile`, `toE164`, `isE164`
- [ ] 5.2 In `lib/validations.ts` add `phoneSchema`, `otpSchema`, `profileCompletionSchema` (name required, email required + valid); remove `signInSchema`, `signUpSchema`, `forgotPasswordSchema`, `resetPasswordSchema`
- [ ] 5.3 Add `otpAj` sliding-window rule to `lib/arcjet.ts`
- [ ] 5.4 Rewrite `actions/auth.actions.ts`: `sendOtp` (Arcjet + Turnstile `captchaToken` + `signInWithOtp({ shouldCreateUser: true })`), `verifyOtp` (→ session, returns `needsProfile` + `role`), `logout`
- [ ] 5.5 Remove `loginUser`, `registerUser`, `requestPasswordReset`, `updatePassword`, `resendVerificationEmail`
- [ ] 5.6 Ensure `sendOtp` returns an identical response whether or not the number is registered (no enumeration)
- [ ] 5.7 Add `completeProfile({ fullName, email })` to `actions/user.actions.ts`

## 6. Auth helpers & routing

- [ ] 6.1 Update `lib/auth.ts`: `getUser` selects phone + email from `profiles`, phone-primary; `AuthUser` no longer exposes an auth email
- [ ] 6.2 Update `utils/supabase/proxy.ts`: trim `AUTH_PAGES` (drop forgot/reset), remove the `/auth/callback` and `/auth/reset-password` bypasses
- [ ] 6.3 Add profile-completion gate: authenticated users without `full_name` cannot reach protected routes
- [ ] 6.4 Add AAL2 enforcement for `/admin/*`; explicitly allow the admin login at AAL1 so MFA can be completed (no redirect loop)
- [ ] 6.5 Delete `app/(api)/auth/callback/route.ts` (and the now-empty `(api)/auth` dir)

## 7. Storefront UI

- [ ] 7.1 Add `components/storefront/auth/turnstile.tsx` — self-contained Turnstile widget (no new npm dependency)
- [ ] 7.2 Build `components/storefront/auth/phone-otp-form.tsx` — single phone field → OTP screen; resend cooldown; "change number"; `AnimatedButton`; OKLCH tokens
- [ ] 7.3 Build the responsive profile dialog: top sheet on mobile, centered modal on desktop; fields name + email; Base UI `render` prop (not `asChild`)
- [ ] 7.4 Wire the dialog to open after `verifyOtp` when `needsProfile`, then redirect to `redirectTo`
- [ ] 7.5 Point `app/(storefront)/auth/signin/page.tsx` at the new form; make `/auth/signup` forward to it (single flow)
- [ ] 7.6 Delete `app/(storefront)/auth/forgot-password` + `reset-password` pages and `forgot-password-form.tsx`, `reset-password-form.tsx`, `signin-form.tsx`, `signup-form.tsx`
- [ ] 7.7 Verify responsiveness at mobile / tablet / desktop breakpoints

## 8. Admin auth & MFA

- [ ] 8.1 Rewrite `app/(admin)/admin/(admin-auth)/login/page.tsx` as a step machine: `phone → otp → mfa-enroll | mfa-challenge`
- [ ] 8.2 Post-OTP: confirm `profiles.role === 'admin'`, else `signOut()` + access denied
- [ ] 8.3 Branch on `mfa.getAuthenticatorAssuranceLevel()` — `nextLevel === 'aal2'` → challenge existing factor; otherwise enrol
- [ ] 8.4 Enrol: `mfa.enroll({ factorType: 'totp' })`, render the returned QR; clean up any stale unverified factor first
- [ ] 8.5 Verify: `mfa.challenge` + `mfa.verify` → AAL2 → redirect `/admin`
- [ ] 8.6 Admin OTP send uses `shouldCreateUser: false` + Turnstile

## 9. Cleanup & consistency

- [ ] 9.1 Grep for and remove leftover `signInWithPassword`, `exchangeCodeForSession`, `resetPasswordForEmail`, `/auth/forgot-password` references
- [ ] 9.2 Audit `account-client.tsx`, `app-sidebar.tsx`, `cart-sidebar.tsx`, `profile-settings.tsx` for email/password assumptions
- [ ] 9.3 Ensure Razorpay prefill uses phone (`contact`) and email only when present
- [ ] 9.4 Update `.claude/CLAUDE.md` auth section to describe phone + OTP
- [ ] 9.5 Re-add `@fission-ai/openspec` to `devDependencies` (lost in the revert)

## 10. Verification

- [ ] 10.1 New user: phone → OTP → profile dialog (name + email) → lands on original destination
- [ ] 10.2 Returning user: phone → OTP → straight to `redirectTo`, no dialog
- [ ] 10.3 Deep link preserved: hit `/checkout` unauthenticated → sign in → land on `/checkout`
- [ ] 10.4 Admin first login: phone → OTP → QR enrol → TOTP → `/admin`
- [ ] 10.5 Admin returning: phone → OTP → TOTP challenge → `/admin`; blocked at AAL1; no redirect loop
- [ ] 10.6 Non-admin completing OTP at `/admin/login` is signed out and denied
- [ ] 10.7 Abuse: OTP send without Turnstile token fails; repeated sends throttle
- [ ] 10.8 Migration: a backfilled existing user signs in by phone; duplicates/nulls appear in `phone_migration_report`
- [ ] 10.9 RLS regression: a user sees only their own orders/rentals; an admin sees all
- [ ] 10.10 `npm run build` + `npm run lint` pass
