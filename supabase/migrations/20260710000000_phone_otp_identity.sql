-- ============================================================================
-- Phone + OTP identity migration
--
-- Moves authentication identity from email/password to phone + OTP.
-- Supabase remains BOTH the auth provider and the database, so profiles.id
-- stays a UUID referencing auth.users(id) and every RLS policy keying on
-- auth.uid() continues to work untouched.
--
-- Step order is load-bearing:
--   normalize -> NULL collisions -> backfill auth.users -> build UNIQUE index
-- Building the index before nulling collisions aborts the migration, because
-- skipped duplicates keep identical non-null raw values.
--
-- profiles.email is deliberately KEPT: it is an optional, receipts-only contact
-- field captured during onboarding or at checkout. It is never an auth identity.
-- ============================================================================

-- ── 1. Normalization helper: any accepted form -> E.164 (+91XXXXXXXXXX) ──────
-- Returns NULL when the input cannot be normalized to a valid Indian mobile.
CREATE OR REPLACE FUNCTION public.normalize_in_phone(raw TEXT)
RETURNS TEXT AS $$
DECLARE
  digits TEXT;
BEGIN
  IF raw IS NULL THEN
    RETURN NULL;
  END IF;

  digits := regexp_replace(raw, '\D', '', 'g');

  -- drop a leading country code / trunk prefix if present
  IF length(digits) = 12 AND left(digits, 2) = '91' THEN
    digits := right(digits, 10);
  ELSIF length(digits) = 11 AND left(digits, 1) = '0' THEN
    digits := right(digits, 10);
  END IF;

  IF digits ~ '^[6-9][0-9]{9}$' THEN
    RETURN '+91' || digits;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ── 2. Migration report — the manual worklist ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.phone_migration_report (
  id           BIGSERIAL PRIMARY KEY,
  profile_id   UUID,
  raw_phone    TEXT,
  normalized   TEXT,
  reason       TEXT,          -- 'invalid_or_null' | 'duplicate'
  reported_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.phone_migration_report ENABLE ROW LEVEL SECURITY;
-- No policies: service role only. Clients must never read this.

-- Un-normalizable phones (includes NULLs).
INSERT INTO public.phone_migration_report (profile_id, raw_phone, normalized, reason)
SELECT p.id, p.phone, NULL, 'invalid_or_null'
FROM public.profiles p
WHERE public.normalize_in_phone(p.phone) IS NULL;

-- Every member of a collision group — not just the extras. We cannot know which
-- account legitimately owns a shared number; awarding it to the older row could
-- hand one customer another's order history.
INSERT INTO public.phone_migration_report (profile_id, raw_phone, normalized, reason)
SELECT p.id, p.phone, public.normalize_in_phone(p.phone), 'duplicate'
FROM public.profiles p
WHERE public.normalize_in_phone(p.phone) IS NOT NULL
  AND public.normalize_in_phone(p.phone) IN (
    SELECT public.normalize_in_phone(p2.phone)
    FROM public.profiles p2
    WHERE public.normalize_in_phone(p2.phone) IS NOT NULL
    GROUP BY public.normalize_in_phone(p2.phone)
    HAVING count(*) > 1
  );

-- ── 3. Normalize the clean, unique rows in place ─────────────────────────────
UPDATE public.profiles p
SET phone = public.normalize_in_phone(p.phone)
WHERE public.normalize_in_phone(p.phone) IS NOT NULL
  AND p.id NOT IN (SELECT profile_id FROM public.phone_migration_report WHERE profile_id IS NOT NULL);

-- ── 4. NULL every reported row so the unique index can be built ──────────────
-- Reported rows are either un-normalizable (raw junk) or duplicates (identical
-- raw values). Both are non-null and would violate the partial unique index.
UPDATE public.profiles p
SET phone = NULL
WHERE p.id IN (SELECT profile_id FROM public.phone_migration_report WHERE profile_id IS NOT NULL);

-- ── 5. Backfill auth.users.phone so existing users can sign in by OTP ────────
UPDATE auth.users u
SET phone = p.phone,
    phone_confirmed_at = COALESCE(u.phone_confirmed_at, now())
FROM public.profiles p
WHERE p.id = u.id
  AND p.phone ~ '^\+91[6-9][0-9]{9}$'
  AND (u.phone IS NULL OR u.phone = '')
  AND NOT EXISTS (
    SELECT 1 FROM auth.users u2 WHERE u2.phone = p.phone AND u2.id <> u.id
  );

-- ── 6. Enforce one account per number (multiple NULLs allowed) ───────────────
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique
  ON public.profiles (phone)
  WHERE phone IS NOT NULL;

-- ── 7. New-user trigger: populate from phone, never abort signup ─────────────
-- full_name and email are left to onboarding. ON CONFLICT DO NOTHING on both the
-- primary key and the phone index guarantees a collision can never roll back the
-- auth.users insert and break sign-up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, phone, role, email)
    VALUES (
      new.id,
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'avatar_url',
      COALESCE(new.phone, new.raw_user_meta_data->>'phone'),
      COALESCE((new.raw_user_meta_data->>'role')::user_role, 'user'),
      NULL
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION
    WHEN unique_violation THEN
      -- An orphaned profiles row already holds this phone. Create the profile
      -- without a phone rather than failing the whole signup transaction.
      INSERT INTO public.profiles (id, full_name, avatar_url, phone, role, email)
      VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url',
        NULL,
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'user'),
        NULL
      )
      ON CONFLICT (id) DO NOTHING;
  END;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP FUNCTION IF EXISTS public.handle_new_user_with_email();

-- ── 8. Admin MFA recovery codes ──────────────────────────────────────────────
-- Redeeming a code does NOT grant AAL2 (Supabase only mints aal2 from
-- mfa.verify). It authorizes unenrolling a lost TOTP factor, after which the
-- admin must enrol a new one. Only hashes are stored; plaintext is shown once.
CREATE TABLE IF NOT EXISTS public.admin_recovery_codes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash  TEXT NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_recovery_codes_user_idx
  ON public.admin_recovery_codes (user_id);

ALTER TABLE public.admin_recovery_codes ENABLE ROW LEVEL SECURITY;
-- Deliberately no policies: the anon/authenticated roles get zero access.
-- Only the server (service role) reads or writes this table.
