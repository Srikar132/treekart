-- Enable RLS on orders and rentals if not already enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

-- Policy for Admins to view all orders
CREATE POLICY "Admins can view all orders"
ON orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy for Admins to view all rentals
CREATE POLICY "Admins can view all rentals"
ON rentals
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy for users to view their own orders
CREATE POLICY "Users can view their own orders"
ON orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy for users to view their own rentals
CREATE POLICY "Users can view their own rentals"
ON rentals
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Enable RLS on trees
ALTER TABLE trees ENABLE ROW LEVEL SECURITY;

-- Policy for trees to be viewable by everyone
CREATE POLICY "Trees are viewable by everyone"
ON trees
FOR SELECT
USING (true);
