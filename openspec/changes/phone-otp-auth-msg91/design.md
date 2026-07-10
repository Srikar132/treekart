## Context

TreeKart authenticates via Supabase email/password. `actions/auth.actions.ts` calls `signInWithPassword`, `signUp` (with email confirmation), `resetPasswordForEmail` and `updateUser`; `resendVerificationEmail` patches the unverified-account dead-end. `app/(api)/auth/callback/route.ts` exchanges email-link codes, and `utils/supabase/proxy.ts` (Next.js 16 proxy, the replacement for `middleware.ts`, wired from the root `proxy.ts`) special-cases `/auth/callback` and `/auth/reset-password`.

Crucially, **authorization does not depend on email**: `proxy.ts` and every RLS policy key off `auth.uid()` and `profiles.role`. `profiles.id` is a UUID referencing `auth.users(id)`, and `rentals.user_id` / `orders.user_id` / `farmers.profile_id` chain off it. `profiles.phone` currently stores a bare 10-digit string with no unique constraint; `auth.users.phone` (E.164) is unused. The `handle_new_user_with_email` trigger copies email + metadata into `profiles` on signup.

Because Supabase stays both the auth provider **and** the database, the identity model and all RLS policies survive untouched. This is the decisive advantage over introducing a third-party identity provider.

Route groups touched: **(storefront)** `/auth/*`, **(admin)** `/admin` + admin login, **(api)** the callback route. Server Actions touched: `auth.actions.ts` (rewrite) and `user.actions.ts` (profile completion).

## Goals / Non-Goals

**Goals:**
- Phone + OTP as the only auth method; no passwords, no email identity.
- One passwordless flow: single phone field → OTP screen → verify.
- Returning users land back where they came from; new users complete a responsive profile dialog (name + email).
- Admin protected by OTP + TOTP MFA (AAL2) without a password.
- Production-grade SMS for India (MSG91 + DLT) with abuse controls.
- Migrate existing users without dropping accounts.
- Responsive, minimal, consistent UI reusing the existing design system.

**Non-Goals:**
- Firebase or any third-party identity provider.
- OAuth/social login, magic links, WhatsApp OTP, passkeys.
- Multi-country phone support — India (`+91`) only.
- Any change to RLS or the `profiles.id` UUID model.

## Decisions

### D1 — Supabase Phone Auth for OTP logic; MSG91 for delivery via a custom Send SMS Hook
Supabase generates, verifies, and issues the session. MSG91 is **not** a Supabase-native provider (native list: `twilio`, `twilio_verify`, `messagebird`, `textlocal`, `vonage`), so delivery goes through the Auth **Send SMS Hook** — a Supabase Edge Function that receives Supabase's OTP payload and calls the MSG91 API with the DLT-registered template.
- *Why the hook over a native provider*: MSG91 is India-native, cheap (~₹0.15–0.25/SMS), and DLT-friendly. The hook is the officially supported extension point; it keeps Supabase as the OTP authority.
- *Why not a custom OTP table*: reimplementing generation, expiry, rate limits and verification is error-prone; Supabase already owns session issuance and cookie handling via `@supabase/ssr`.
- *Hook security*: the function verifies the Supabase hook secret on every call, so it cannot be invoked directly to burn SMS credit.

### D2 — Single flow via `signInWithOtp({ phone, shouldCreateUser: true })`
Sign-in and sign-up collapse into one flow; the first successful verification for an unknown number creates the account. Onboarding data (`full_name`, `email`) is collected **after** verification instead of before.
- *Why*: no separate registration form, no email-confirmation gap, fewer screens.
- *Rejected*: `shouldCreateUser: false` on sign-in with a separate signup — reintroduces two flows and an "account not found" enumeration surface.
- *Admin uses `shouldCreateUser: false`* — admins must pre-exist.

### D3 — E.164 canonical, `profiles.phone UNIQUE`
The UI accepts 10-digit Indian numbers; a helper in `lib/phone.ts` normalizes to `+91XXXXXXXXXX` before any Supabase call. A partial unique index (`WHERE phone IS NOT NULL`) enforces one account per number while tolerating legacy NULLs.
- *Why*: `auth.users.phone` is E.164; storing anything else guarantees drift.

### D4 — Profile completion as a responsive dialog, not a page
A single dialog component renders as a **top sheet on mobile** and a **centered modal on desktop**, driven by a viewport breakpoint rather than two separate components. It collects name + email and writes to `profiles`.
- *Why a dialog over a page*: keeps the user in context after verification and preserves `redirectTo` without an extra navigation.
- *Enforcement is server-side*: `proxy.ts` gates protected routes on `full_name` being present, so a dismissed/bypassed dialog cannot grant access. The dialog is UX; the proxy is the gate.
- Built on the project's shadcn/Base UI primitives (`render` prop, **not** `asChild`), OKLCH tokens, and `AnimatedButton`.

### D5 — Admin = OTP + TOTP MFA, AAL2 enforced in the proxy
Admins enter the same OTP flow, then a TOTP challenge (Supabase MFA, free on all plans). `proxy.ts` reads the assurance level and requires `aal2` for `/admin/*`, excluding the login page.
- *Why not OTP alone*: SIM-swap hands an attacker the OTP; a TOTP factor they don't control blocks it. *Why not password + TOTP*: the goal removes passwords entirely; OTP + TOTP keeps two independent factors.
- *Loop hazard*: the admin login is an auth page, so an authenticated admin would normally be bounced away — but an admin at `aal1` must stay there to finish MFA. The proxy therefore allows the admin login through when `role === 'admin' && !isAAL2`.
- First-time admins enrol via `mfa.enroll({ factorType: 'totp' })`, which returns a QR (`otpauth://` URI as an SVG data-URI); `mfa.challenge` + `mfa.verify` confirm it and elevate to AAL2.

### D6 — Abuse controls on OTP send (Turnstile + Arcjet)
The send-OTP action requires a Cloudflare Turnstile token (passed to Supabase as `captchaToken`) and sits behind an Arcjet rate limit, alongside a UI resend cooldown. Send responses are uniform regardless of account existence.
- *Why*: every MSG91 SMS costs money; SMS pumping / toll fraud is the primary cost risk of phone auth. This is the cost guard.

### Schema / RLS impact
- New migration: normalization helper, backfill `auth.users.phone` + `phone_confirmed_at`, collision/null report table, partial `UNIQUE` index on `profiles.phone`, replace `handle_new_user_with_email` with `handle_new_user`.
- `profiles.email` **kept** (nullable) — now populated by onboarding, used for receipts only.
- **RLS unchanged.** Policies use `auth.uid()` / `profiles.role`; neither touches email. No policy edits required.
- `types/database.types.ts` regeneration is optional — `phone` and `email` columns already exist in the generated types.

## Risks / Trade-offs

- **SMS pumping / toll fraud** → Turnstile on send + Arcjet rate limit + tight `sms_sent` cap in `config.toml` + resend cooldown.
- **Duplicate / null phones break the UNIQUE add** → staged migration: backfill → report → resolve → constrain. Report table retained for manual follow-up.
- **Existing users locked out until phone is confirmed** → backfill sets `phone_confirmed_at`; run before cutover; keep a restore point.
- **Admin redirect loop** at AAL1 → explicitly allowed on the admin login path (D5).
- **Lost authenticator locks an admin out** → needs a recovery path (another admin unenrols the factor via service role, or recovery codes at enrol). *Open.*
- **First admin bootstrap** → `profiles.role` must already be `admin` with a valid phone before first login, else the post-OTP role check denies them.
- **DLT registration lead time** → sender ID + templates must be approved before go-live; start immediately.
- **Hook adds a failure surface** vs a native provider → mitigated by explicit failure handling and retry UX.

## Migration Plan

1. Provision MSG91; complete DLT sender + template registration. Create Turnstile keys.
2. Deploy the Edge Function (`send-sms`) and register it as the Send SMS Hook; set secrets.
3. Run the migration against a backup, in stages: normalize → backfill `auth.users.phone` + `phone_confirmed_at` → generate the collision/missing-phone report → resolve duplicates → add the partial `UNIQUE` index → swap the trigger.
4. Configure `supabase/config.toml`: enable `[auth.sms]`, disable email signup, enable Turnstile CAPTCHA and TOTP MFA.
5. Ship the new OTP UI + rewritten `auth.actions.ts`; delete password/callback code.
6. Seed the first admin (`profiles.role='admin'` with a valid phone), then enrol their TOTP.
7. **Rollback**: revert the app deploy and restore the database from the pre-migration backup. The email/password path remains in git history and `auth.users` email rows are retained by Supabase, so it can be redeployed.

## Open Questions

- Admin MFA recovery — recovery codes at enrolment, or an out-of-band unenrol by another admin via the service role?
- Should the OTP expiry be shortened from the Supabase default (~1 hr) to ~5 min to narrow the interception window?
- Should `profiles.email` be enforced `UNIQUE` now that onboarding always collects it, or left non-unique since it is not an identity?
