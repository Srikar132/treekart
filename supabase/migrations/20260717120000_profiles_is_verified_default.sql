-- profiles.is_verified is NOT NULL with no default (added directly on remote,
-- never captured in a migration). handle_new_user() doesn't set it, so every
-- new-user insert violated the NOT NULL constraint and aborted the trigger,
-- surfacing to the client as "Database error saving new user" -- for brand
-- new phone numbers only, since existing users already have a profiles row
-- and never hit the trigger again.
ALTER TABLE public.profiles
  ALTER COLUMN is_verified SET DEFAULT false;

-- Backfill just in case any earlier failed-insert retries left null rows
-- (shouldn't exist given the NOT NULL constraint, but cheap to be safe).
UPDATE public.profiles SET is_verified = false WHERE is_verified IS NULL;
