-- =======================================================
-- SEED DATA FOR TREEKART
-- Execute this script in your Supabase SQL Editor
-- =======================================================



-- 2. Insert dummy Trees for the Rent-A-Tree feature
INSERT INTO public.trees ( variety, age_years, yield_min_kg, yield_max_kg, price, plan_type, source, status, is_verified, gps_lat, gps_lng, photos)
VALUES
(
  'Alphonso', 
  5, 
  40, 
  50, 
  4999, 
  'standard', 
  'own_farm', 
  'available', 
  true, 
  16.9902, 
  73.3120, 
  '["https://images.unsplash.com/photo-1595856417531-b6a1e505cc3e?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1601646875957-e9faea9a0a30?auto=format&fit=crop&q=80&w=800"]'::json
),
(
  'Alphonso', 
  8, 
  60, 
  75, 
  7499, 
  'max', 
  'own_farm', 
  'available', 
  true, 
  16.9905, 
  73.3125, 
  '["https://images.unsplash.com/photo-1628156174825-728bceba9a7e?auto=format&fit=crop&q=80&w=800"]'::json
),
(
  'Banganapalli', 
  4, 
  25, 
  35, 
  2999, 
  'basic', 
  'partner', 
  'available', 
  true, 
  16.9910, 
  73.3110, 
  '["https://images.unsplash.com/photo-1601646875957-e9faea9a0a30?auto=format&fit=crop&q=80&w=800"]'::json
);

-- 3. Insert dummy Mango Products for the Storefront
INSERT INTO public.mango_products (name, description, price, original_price, badge, status, variety, weight_kg, image_url)
VALUES
(
  'Premium Alphonso Mangoes (1 Dozen)', 
  'Hand-picked, naturally ripened Ratnagiri Alphonso mangoes. Grade A export quality.', 
  1499, 
  1799, 
  'Sale', 
  'available', 
  'Alphonso', 
  3.00, 
  'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800'
),
(
  'Banganapalli Mangoes (5 Kg Box)', 
  'Sweet and juicy Banganapalli mangoes direct from our partner farms in Andhra Pradesh.', 
  899, 
  999, 
  'None', 
  'available', 
  'Banganapalli', 
  5.00, 
  'https://images.unsplash.com/photo-1605027628030-9bb6f83535e6?auto=format&fit=crop&q=80&w=800'
),
(
  'Kesar Mangoes (Pre-Order)', 
  'Queen of mangoes, known for its distinct sweet flavor and bright saffron color. Book now for next harvest.', 
  1199, 
  NULL, 
  'Pre-Order', 
  'pre_order', 
  'Kesar', 
  2.50, 
  'https://images.unsplash.com/photo-1587310543666-8334863bc42c?auto=format&fit=crop&q=80&w=800'
),
(
  'Organic Mango Pulp (1L)', 
  '100% natural, no added sugar Alphonso mango pulp. Perfect for desserts and juices.', 
  599, 
  699, 
  'New', 
  'available', 
  'Alphonso', 
  1.00, 
  'https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=800'
);
