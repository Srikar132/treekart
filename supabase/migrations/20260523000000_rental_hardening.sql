-- ─────────────────────────────────────────────────────────────────────────────
-- Rental Hardening Migration
-- 1. Add 'pending' status to rental_status enum
-- 2. UNIQUE constraints on payment_id columns
-- 3. Partial unique index: one active rental per tree
-- 4. fulfil_rental — atomic RPC (activate rental + mark tree rented)
-- 5. fulfil_rental_by_order_id — webhook-safe wrapper (SECURITY DEFINER lookup)
-- 6. Missing RLS policies for rentals
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add 'pending' to rental_status enum
ALTER TYPE rental_status ADD VALUE IF NOT EXISTS 'pending' BEFORE 'active';

-- 2. UNIQUE on payment_id columns (NULLs are exempt in Postgres UNIQUE)
ALTER TABLE rentals ADD CONSTRAINT rentals_payment_id_unique UNIQUE (payment_id);
ALTER TABLE orders  ADD CONSTRAINT orders_payment_id_unique  UNIQUE (payment_id);

-- 3. One active rental per tree at DB level
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_rental_per_tree
  ON rentals(tree_id) WHERE status = 'active';

-- 4. Atomic rental fulfilment RPC
--    Activates a pending rental and marks the tree as rented in one transaction.
--    Returns TRUE if fulfilled now, FALSE if already active (idempotent), raises on bad state.
CREATE OR REPLACE FUNCTION fulfil_rental(
  p_rental_id      UUID,
  p_rzp_payment_id TEXT,
  p_tree_id        UUID,
  p_reserved_until TIMESTAMPTZ
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated INT;
BEGIN
  UPDATE rentals
     SET status     = 'active',
         payment_id = p_rzp_payment_id,
         rented_at  = NOW()
   WHERE id = p_rental_id
     AND status = 'pending';

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  IF v_updated = 0 THEN
    -- Idempotency: already fulfilled by the other path (webhook or client)
    IF EXISTS (SELECT 1 FROM rentals WHERE id = p_rental_id AND status = 'active') THEN
      RETURN FALSE;
    END IF;
    RAISE EXCEPTION 'Rental % not in pending state', p_rental_id;
  END IF;

  UPDATE trees
     SET status        = 'rented',
         reserved_until = p_reserved_until
   WHERE id = p_tree_id
     AND status = 'inactive';

  RETURN TRUE;
END;
$$;

-- 5. Webhook-safe wrapper: finds pending rental by rzp order id and fulfils atomically.
--    SECURITY DEFINER lets the anon-key webhook bypass RLS for the internal SELECT.
CREATE OR REPLACE FUNCTION fulfil_rental_by_order_id(
  p_rzp_order_id   TEXT,
  p_rzp_payment_id TEXT
) RETURNS TABLE(
  rental_id   UUID,
  tree_id     UUID,
  amount_paid NUMERIC,
  season      TEXT,
  user_email  TEXT,
  user_name   TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rental         RECORD;
  v_reserved_until TIMESTAMPTZ;
BEGIN
  SELECT r.id, r.tree_id, r.amount_paid, r.season, r.user_id
    INTO v_rental
    FROM rentals r
   WHERE r.payment_id = p_rzp_order_id
     AND r.status = 'pending'
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN; -- Not a rental payment — caller should check if result is empty
  END IF;

  -- End of May next year (standard mango season expiry)
  v_reserved_until :=
    DATE_TRUNC('year', NOW() + INTERVAL '1 year') +
    INTERVAL '4 months 30 days 23 hours 59 minutes 59 seconds';

  PERFORM fulfil_rental(
    v_rental.id,
    p_rzp_payment_id,
    v_rental.tree_id,
    v_reserved_until
  );

  RETURN QUERY
    SELECT
      v_rental.id,
      v_rental.tree_id,
      v_rental.amount_paid,
      v_rental.season,
      p.email,
      p.full_name
    FROM profiles p
   WHERE p.id = v_rental.user_id;
END;
$$;

-- 6. Missing RLS policies for rentals
--    (orders + trees are already fully covered by existing dashboard policies)

-- Admins can view all rentals (admin dashboard)
CREATE POLICY "Admins can view all rentals"
ON rentals FOR SELECT TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Admins can update any rental (mark completed / cancelled from admin dashboard)
CREATE POLICY "Admins can update any rental"
ON rentals FOR UPDATE TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Users can delete their own pending rentals (payment cancellation flow)
CREATE POLICY "Users can delete their own pending rentals"
ON rentals FOR DELETE TO authenticated
USING (auth.uid() = user_id AND status = 'pending');
