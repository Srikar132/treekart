-- Allow anyone to see active rental records (needed for tree details page)
CREATE POLICY "Public rentals are viewable by everyone"
ON rentals
FOR SELECT
USING (status = 'active');

-- Allow anyone to see basic profile information (Full Name & Avatar)
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles
FOR SELECT
USING (true);
