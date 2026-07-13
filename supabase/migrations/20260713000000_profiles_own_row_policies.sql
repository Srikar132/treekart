-- profiles RLS had SELECT + UPDATE own-row + admin policies, but no INSERT
-- policy. completeProfile() upserts as the authenticated user (not service
-- role) — Postgres RLS-checks the INSERT path even when ON CONFLICT resolves
-- to an UPDATE, so onboarding failed with "new row violates row-level
-- security policy for table profiles".

CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);