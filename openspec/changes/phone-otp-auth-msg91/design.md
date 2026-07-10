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

### D7 — `redirectTo` is validated as a same-origin relative path
Every navigation derived from `redirectTo` (post-verify, post-onboarding, proxy round-trips) passes through a single validator that accepts only root-relative paths (`/…`) and rejects absolute URLs, protocol-relative `//host`, and anything resolving off-origin. Invalid values fall back to the default destination.
- *Why*: without this, `/auth/signin?redirectTo=https://evil.com` turns the sign-in page into an open-redirect phishing primitive.

### D8 — Colliding and un-normalizable phones are nulled, then reported
The migration NULLs `phone` on every row in a collision group (not just the extras) and on every un-normalizable value, recording each in `phone_migration_report`. Only then is the partial `UNIQUE` index created.
- *Why null both sides of a collision*: we cannot know which of two accounts legitimately owns a number. Silently awarding it to the older row could hand one customer another's order history. Nulling both means the rightful owner re-authenticates by OTP; nobody inherits an account.
- *Why null rather than skip*: skipped duplicates keep identical raw values, which are non-NULL and equal — the partial unique index would fail to build. Nulling is what makes the index creatable at all.
- **Consequence, accepted**: a nulled user who signs in by OTP gets a *new* `auth.users` + `profiles` row. Their prior `orders` / `rentals` stay attached to the old `profiles.id` and must be re-linked manually. The report table is the worklist. Expected to be a small set; verify the count before running in production.

### D9 — Profile completion lives on `/auth/signin`
The dialog is rendered by the sign-in route rather than a dedicated page, so the proxy has a concrete redirect target. `/auth/signin` branches on session state: unauthenticated → phone entry; authenticated without `full_name` → dialog open. The proxy must let an incomplete-profile user through to `/auth/signin` (rather than bouncing them as an "already authenticated" visitor) or it loops.

### D11 — Progressive email capture: optional at sign-up, required to order
Email is asked for once at onboarding with a plain explanation ("we'll send order confirmations and delivery updates here") and is **skippable**. It becomes **mandatory at the point of purchase**: a user without an email is prompted before an order or rental is created, using the same responsive dialog.
- *Why not required at sign-up*: this is a phone-first product. Demanding an unused email on the first screen adds friction to a flow whose whole purpose is removing friction, and users type throwaway addresses to get past it. Asking at checkout — where the user already understands *why* they'd want a receipt — yields better addresses and higher completion.
- *Why required to order*: order confirmation, invoices, and delivery updates go by email. An order with no reachable contact channel is a support ticket waiting to happen.
- *Profile completeness is `full_name` only.* The proxy's onboarding gate must not test email, or every skipping user is trapped in the dialog.
- **Enforcement is server-side.** `createMangoOrder` and `createRentalOrder` re-read `profiles.email` and refuse to proceed when it is null. The dialog is UX; the action is the gate. A rejected rental must release any tree reservation it took.
- Email remains **unverified** and **non-unique** — it is a contact field, never a credential (see `user-identity-model`).

### D10 — Gate order: admin MFA before profile completion
For `role === 'admin'`, AAL2 is evaluated first. Otherwise an admin lacking `full_name` ping-pongs between `/admin/login` (which demands MFA) and `/auth/signin` (which demands a profile). Profile completion applies to admins only once AAL2 is reached.

### D12 — Admin recovery codes reset the factor; they do not grant AAL2
Supabase mints `aal2` only from `mfa.verify()` against a real TOTP factor — there is no "redeem backup code" API. A recovery code therefore cannot *be* the second factor. Instead it **authorizes a factor reset**: redeem → server unenrols the dead TOTP factor (service role) → admin enrols a new one → `mfa.verify()` → AAL2.
- **Redemption requires an `aal1` session** (phone OTP already passed) **and** `role = 'admin'`. A leaked code alone must never be sufficient — otherwise the recovery path is a backdoor around MFA.
- Codes are generated at enrolment, **displayed exactly once**, stored **hashed** (never plaintext, never logged), **single-use**, and **rate-limited** on redemption. Failures must not reveal whether a code exists.
- Stored in a dedicated table with RLS denying all client access; only the server (service role) reads it.
- *Why not "another admin unenrols"* alone: with a single admin there is no second admin, and the lockout is total. Codes are self-service. The service-role path remains available as break-glass.
- *Security note*: the service-role key must live server-side only, never in a client bundle or Edge Function reachable without auth.

### D13 — Email typos are suggested, never auto-corrected
Since email is unverified (it is a contact field, not a credential), a mistyped domain silently swallows every order confirmation. Every email input runs a common-domain typo check (`gmial`→`gmail`, `yahooo`→`yahoo`, `hotmial`→`hotmail`, …) and offers a one-click correction.
- *Advisory only*: never block submission, never rewrite the value silently. A user with a legitimately unusual domain must be able to submit it.
- *Why not a verification email*: it reintroduces an email round-trip into a flow deliberately made phone-only, and users routinely never click it — you'd gain latency and lose completions while still not knowing the address works.

### D14 — SMS OTP expiry tightened to ~5 minutes
The default (~1 hour) leaves a valid code sitting in the recipient's SMS list for an hour. Typical entry is under 30 seconds, so 5 minutes is generous while sharply narrowing the interception window.
- Confirm where this is configured: `[auth.sms]` in `config.toml` exposes `template` / `max_frequency` but **not** an expiry key in the current CLI schema — SMS OTP expiry is set in the Supabase dashboard (Auth → Providers → Phone). Verify against the installed CLI before assuming a config key exists.

### D15 — Existing sessions are not force-invalidated at cutover
Email/password-era JWTs remain valid after deploy. Those users already have `full_name`, so they see no dialog, keep browsing, and simply use phone + OTP at their next sign-in.
- *Why not a global sign-out*: on a live site it bounces every active user — mid-cart, on launch day — to fix a problem nobody has. The sessions carry no password material; they are just bearer tokens for an already-authenticated user.
- *Consequence, accepted*: for the lifetime of those refresh tokens, sessions created under password auth outlive password auth. Bounded by `jwt_expiry` + refresh rotation.

### Schema / RLS impact
- New migration: normalization helper, backfill `auth.users.phone` + `phone_confirmed_at`, collision/null report table, partial `UNIQUE` index on `profiles.phone`, replace `handle_new_user_with_email` with `handle_new_user`.
- New table `admin_recovery_codes` (`user_id`, `code_hash`, `used_at`) with RLS denying all client access — server/service-role reads only.
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
- **Open redirect via `redirectTo`** → single same-origin validator, applied at every navigation (D7).
- **Turnstile tokens are single-use** → widget is reset before every send, including resends; a consumed token is never resubmitted.
- **Orphaned history from nulled duplicates** → prior `orders`/`rentals` stay on the old `profiles.id`; `phone_migration_report` is the manual re-link worklist. Count the duplicates before running in production.
- **Recycled phone numbers** → Indian telcos reissue dormant numbers; a new owner could inherit an account by OTP alone. Accepted for consumer accounts; admins are protected by TOTP. Consider re-verification before high-value actions.
- **No local dev / test path** → CAPTCHA is enabled and every OTP costs an SMS. Use Supabase's `[auth.sms.test_otp]` fixed number→code map locally and disable CAPTCHA in the local config, so developers never hit MSG91.
- **Existing sessions survive cutover** → email/password-era JWTs remain valid after deploy. Decide explicitly whether to force a global sign-out; leaving them is acceptable (their profiles already have `full_name`), but it means password-era sessions outlive password auth.
- **Non-`+91` users cannot sign in** → NRI customers ordering for family in India are locked out. Explicit non-goal, but a real business exclusion; revisit if that segment matters.
- **Legacy users with a null email hit the checkout prompt** → users migrated from the email/password era mostly have an email, but nulled-duplicate and phone-only accounts will not. They are prompted once at their next order; ensure the prompt does not lose cart or address state.
- **Onboarding gate must not test email** → if profile-completeness ever checks `email`, every user who skipped it is permanently trapped in the onboarding dialog. Completeness is `full_name` only (D11).
- **Unverified email means typos reach nobody** → a mistyped address silently swallows every order confirmation. Accepted for now (no verification loop); consider a confirmation send or a typo-domain check at capture.

## Migration Plan

1. Provision MSG91; complete DLT sender + template registration. Create Turnstile keys.
2. Deploy the Edge Function (`send-sms`) and register it as the Send SMS Hook; set secrets.
3. Run the migration against a backup, in stages: normalize → backfill `auth.users.phone` + `phone_confirmed_at` → generate the collision/missing-phone report → resolve duplicates → add the partial `UNIQUE` index → swap the trigger.
4. Configure `supabase/config.toml`: enable `[auth.sms]`, disable email signup, enable Turnstile CAPTCHA and TOTP MFA.
5. Ship the new OTP UI + rewritten `auth.actions.ts`; delete password/callback code.
6. Seed the first admin (`profiles.role='admin'` with a valid phone), then enrol their TOTP.
7. **Rollback**: revert the app deploy and restore the database from the pre-migration backup. The email/password path remains in git history and `auth.users` email rows are retained by Supabase, so it can be redeployed.

## Open Questions

- Who re-links the orphaned `orders`/`rentals` of nulled duplicate profiles, and by what process? (Depends on the duplicate count found in the Phase-2 rehearsal — may be zero.)
- Should recovery codes be regenerable from account settings, or only reissued on a fresh enrolment?

### Resolved
- ~~Profile completion: dialog vs route~~ → dialog hosted on `/auth/signin` (D9).
- ~~Duplicate phones at migration~~ → null every colliding row, report it, then build the index (D8).
- ~~Is Turnstile necessary?~~ → **Kept.** The only control that stops *distributed* SMS pumping; Arcjet's per-IP limit and Supabase's volume caps merely bound the loss. Free and near-invisible against a paid SMS gateway.
- ~~Email required at sign-up?~~ → **No.** Optional and explained at onboarding; required at the point of ordering, enforced server-side (D11).
- ~~Admin MFA recovery~~ → **Recovery codes at enrolment**, which authorize a *factor reset*, not a session upgrade (D12).
- ~~Email verification~~ → **No verification loop**; common-domain typo suggestion only, advisory (D13).
- ~~OTP expiry~~ → **~5 minutes** (D14).
- ~~Force sign-out at cutover?~~ → **No.** Existing sessions live out naturally (D15).
- ~~`profiles.email` UNIQUE?~~ → **No.** It is a contact field, not an identity; a unique constraint could block a legitimate phone signup.
