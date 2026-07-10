## Why

TreeKart serves an India-first, mobile-first audience where the phone number is the real identity and email is often unused. The current email/password flow adds friction at every step — password creation, email confirmation before first purchase, forgotten-password support load, and an "unverified account" dead-end. Phone + OTP removes passwords entirely, matches how Indian e-commerce users expect to sign in, and shortens the path from landing to checkout.

Doing it now, before the user base grows, keeps the data migration small. Supabase remains the single system for **both authentication and database** — no third-party identity provider, no split identity model, no RLS rewrite.

## What Changes

- **BREAKING**: Remove email/password authentication completely — no `signInWithPassword`, no `signUp` with email, no password anywhere.
- **BREAKING**: Remove `/auth/forgot-password`, `/auth/reset-password`, email confirmation, `resendVerificationEmail`, and the `/auth/callback` code-exchange route.
- Phone + OTP becomes the sole auth method via **Supabase Phone Auth**. Supabase generates and verifies the OTP and issues the session.
- **SMS delivery via MSG91** through a custom **Supabase Send SMS Hook** (an Edge Function). MSG91 is not a Supabase-native provider, so the hook is the integration point. Supabase stays the OTP authority; MSG91 is transport only.
- Identity becomes `profiles.phone` in **E.164** (`+91XXXXXXXXXX`), `UNIQUE`.
- **New sign-in UI**: a single phone-number input → OTP screen → verify. One flow serves both sign-in and sign-up (`signInWithOtp` with `shouldCreateUser: true`).
  - **Returning user** → redirected back to wherever they came from (`redirectTo`).
  - **New user** → a **responsive profile dialog** opens to collect their **name** (required) and **email** (optional): slides down from the top on mobile, centered modal on desktop. The dialog explains *why* email is asked for — order confirmations and delivery updates — and lets the user skip it. Values are persisted to `profiles`.
- **Progressive email capture**: email is never forced at sign-up. It becomes **required at the point of ordering** — before a mango order or tree rental is placed, a user without an email is asked for one, and the server action refuses to create the order without it.
- **Admin** uses the same phone + OTP entry, plus a **TOTP MFA** second factor (authenticator app). `proxy.ts` enforces assurance level **AAL2** on `/admin`. First-time admins enrol via a QR code.
- OTP send is guarded by **Cloudflare Turnstile** + **Arcjet** rate limiting to prevent SMS pumping / toll fraud (every MSG91 SMS costs money).
- Existing users are migrated: normalize stored 10-digit phones to E.164, backfill `auth.users.phone` + `phone_confirmed_at`, report collisions/nulls, then enforce uniqueness.
- All new UI is responsive, minimal, and consistent with the existing design system (OKLCH tokens, `AnimatedButton`, shadcn/Base UI `render` prop).

## Capabilities

### New Capabilities
- `phone-otp-auth`: Phone + OTP as the sole authentication method — the two-step flow, session issuance, returning-user redirect, OTP anti-abuse controls, and phone-enumeration resistance.
- `sms-otp-delivery`: OTP SMS delivery through MSG91 via a custom Supabase Send SMS Hook (Edge Function), DLT-registered templates, delivery-failure handling, and secret handling.
- `user-onboarding`: The new-user profile dialog (responsive: top sheet on mobile, centered modal on desktop) capturing a required name and an optional, explained email, and the gate that prevents an incomplete profile from reaching protected routes.
- `order-email-capture`: Email is required to place an order. The checkout flow prompts users who have none, and the order server actions reject order creation when the profile has no email.
- `admin-mfa-auth`: Admin authentication — phone OTP plus TOTP second factor, QR enrolment for first-time admins, AAL2 enforcement on `/admin`, and the admin role check.
- `user-identity-model`: Phone (E.164, `UNIQUE`) as canonical identity; the `handle_new_user` trigger; removal of password/email-confirmation identity; existing-user backfill and cutover.

### Modified Capabilities
- `auth-callback-routing`: The email code-exchange flows (password-reset link, signup-confirmation link) no longer exist. The `/auth/callback` reachability and reset/confirm requirements are removed; the proxy's only remaining auth-page concern is gating the phone-OTP screens.

## Impact

- **Server actions**: `actions/auth.actions.ts` rewritten (`sendOtp`, `verifyOtp`, `logout`); `actions/user.actions.ts` gains a profile-completion action.
- **Validation**: `lib/validations.ts` — phone (E.164) + OTP + profile schemas replace the email/password schemas. New `lib/phone.ts` normalization helper.
- **Auth helpers**: `lib/auth.ts` — `getUser` becomes phone-primary.
- **UI**: `components/storefront/auth/` — single phone→OTP form, Turnstile widget, responsive profile dialog; `signin-form`, `signup-form`, `forgot-password-form`, `reset-password-form` deleted along with their pages. Admin login reworked to OTP + TOTP.
- **Routing**: `utils/supabase/proxy.ts` — trimmed `AUTH_PAGES`, profile-completion gate, AAL2 admin gate; `app/(api)/auth/callback/route.ts` removed.
- **Database**: new migration — normalize + backfill phone, `profiles.phone UNIQUE`, replace `handle_new_user_with_email` with `handle_new_user`. RLS is **unchanged** (policies key on `auth.uid()` / `profiles.role`, never email).
- **Config**: `supabase/config.toml` — enable `[auth.sms]`, register the Send SMS Hook, disable email signup, enable Turnstile CAPTCHA and TOTP MFA.
- **New**: `supabase/functions/send-sms/` Edge Function (MSG91 delivery).
- **Third-party**: MSG91 account + DLT sender/template registration; Cloudflare Turnstile keys.

## Non-goals

- No Firebase or any third-party identity provider — Supabase remains both auth and database.
- No OAuth/social login, magic links, WhatsApp OTP, or passkeys.
- No multi-country phone support — India (`+91`) only.
- No change to RLS policies or the `profiles.id` UUID identity model.
- No rebuild of order/Razorpay flows beyond removing any email assumption.
