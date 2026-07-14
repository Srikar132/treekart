# Progress Tracker

## 2026-07-14 — Phone-identity migration: found and fixed remote drift

**Problem:** Supabase Auth dashboard showed legacy users with `phone` blank and `provider: email`. Investigation traced to `supabase/migrations/20260710000000_phone_otp_identity.sql` — `supabase migration list --linked` reported it applied on the remote project, but the actual schema disagreed. Confirmed missing on remote:
- `normalize_in_phone()` function
- `phone_migration_report` table
- `admin_recovery_codes` table
- `profiles_phone_unique` partial index
- `handle_new_user` trigger was still the **old email-era version** (referenced `is_verified`, defaulted `phone`/`email` to `''`), not the phone-otp version from the migration file.

**Fix:** Ran the migration's remaining SQL directly against the linked remote DB in staged, user-confirmed steps (via `supabase db query --linked -f <file>`):
1. Created `normalize_in_phone()` + `phone_migration_report` table.
2. Reported and nulled 14 broken `profiles.phone` rows — 9 empty-string junk (from the old trigger's `COALESCE(..., '')`), 5 rows across 2 duplicate phone numbers. Normalized the other 13 clean rows to E.164 (`+91XXXXXXXXXX`).
3. Backfilled `auth.users.phone` + `phone_confirmed_at` for those 13, then built `profiles_phone_unique` (partial, nulls allowed).
4. Replaced `handle_new_user()` with the phone-aware version and re-wired the `on_auth_user_created` trigger; created `admin_recovery_codes` (was silently missing — `actions/admin-mfa.actions.ts` already reads/writes it, so admin TOTP recovery-code generation/redemption would have errored before this).
5. Regenerated `types/database.types.ts` via `supabase gen types typescript --linked`.

**Regression caught in the same pass:** the `gen types` regeneration overwrote the hand-maintained convenience-type section at the bottom of `types/database.types.ts` (`MangoProduct`, `Order`, `Profile`, `Rental`, `Tree`, `TreePlan`, enum aliases, `DeliveryAddress`, etc. — the exports `CLAUDE.md` documents and the rest of the app imports). Recovered it from git history and re-appended after the regenerated `Database` type. `npx tsc --noEmit` clean afterward.

**Impact check:** Of the 14 nulled rows, only **1** had real business data — an active rental on an orphaned duplicate-phone profile. Everything else: 0 orders, 0 rentals. No merge tooling built for this single case — logged as a memory (see local Claude memory: `orphaned_rental_phone_migration.md`, not committed — contains the specific rental/profile IDs and the affected phone number) for a manual `UPDATE rentals SET user_id = ...` when that number re-verifies. Confirmed nobody has re-verified with it yet.

**Also reviewed (no changes needed):** Admin-login-via-consumer-flow concern — confirmed `utils/supabase/proxy.ts` PHASE 3 always re-gates any `/admin/*` request on `aal2` regardless of which page established the session, so an admin's phone verifying through the plain `/auth/signin` form gets an extra redirect hop (`/auth/signin` → `/admin` → `/admin/login`) but never reaches admin content without TOTP. No privilege-escalation path — `profiles.role` is never set by the login itself.

**Architecture note (no change made):** Confirmed `profiles.phone`/`profiles.email` are intentional, not redundant duplication of `auth.users` — the `auth` schema isn't exposed to PostgREST (`supabase/config.toml` only exposes `public`/`graphql_public`), and RLS policies can only attach to `public` tables. `profiles.phone` is the RLS-queryable mirror of the `auth.users.phone` identity; `profiles.email` is a separate, unverified, non-unique contact field (see `openspec/changes/phone-otp-auth-msg91/design.md` D11) — not a mirror of anything.

**Open:** Re-link process for future orphaned-duplicate accounts with real order/rental history is still manual (design doc's open question, unresolved — acceptable at this volume).
