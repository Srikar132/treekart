-- Migration: Add reserved_until to trees table
-- Purpose: Track when a rental period ends so admins cannot
--          prematurely set a rented tree back to "available".

ALTER TABLE public.trees
  ADD COLUMN IF NOT EXISTS reserved_until TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN public.trees.reserved_until IS
  'The UTC datetime until which this tree is exclusively reserved for the current renter.
   While NOW() < reserved_until the tree must stay in "rented" status.
   Admins are blocked from setting status = ''available'' before this date via application-level guards.
   Automatically set to rental_date + 1 year when verifyAndFulfilRental succeeds.';
