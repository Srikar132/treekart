-- Create custom enums
CREATE TYPE user_role AS ENUM ('user', 'farmer', 'admin');
CREATE TYPE farmer_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE plan_type AS ENUM ('basic', 'standard', 'max');
CREATE TYPE tree_status AS ENUM ('available', 'rented', 'inactive');
CREATE TYPE tree_source AS ENUM ('own_farm', 'partner');
CREATE TYPE rental_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'quoted', 'closed');

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create farmers table
CREATE TABLE farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  farm_name TEXT,
  location TEXT,
  farm_size_acres NUMERIC,
  is_organic BOOLEAN DEFAULT false,
  status farmer_status DEFAULT 'pending',
  rejection_reason TEXT,
  commission_pct NUMERIC,
  documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create trees table
CREATE TABLE trees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES farmers(id) ON DELETE SET NULL, -- null = our farm
  plan_type plan_type,
  variety TEXT,
  age_years INTEGER,
  yield_min_kg NUMERIC,
  yield_max_kg NUMERIC,
  price NUMERIC,
  gps_lat NUMERIC,
  gps_lng NUMERIC,
  photos JSONB DEFAULT '[]'::jsonb,
  status tree_status DEFAULT 'available',
  is_verified BOOLEAN DEFAULT false,
  source tree_source DEFAULT 'own_farm',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create rentals table
CREATE TABLE rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tree_id UUID REFERENCES trees(id) ON DELETE RESTRICT,
  season TEXT,
  status rental_status DEFAULT 'active',
  payment_id TEXT,
  amount_paid NUMERIC,
  delivery_address JSONB,
  visit_requested BOOLEAN DEFAULT false,
  rented_at TIMESTAMPTZ DEFAULT now()
);

-- Create tree_updates table
CREATE TABLE tree_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID REFERENCES trees(id) ON DELETE CASCADE,
  rental_id UUID REFERENCES rentals(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  video_url TEXT,
  mux_asset_id TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  posted_at TIMESTAMPTZ DEFAULT now()
);

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  items JSONB,
  total_amount NUMERIC,
  status order_status DEFAULT 'pending',
  payment_id TEXT,
  delivery_address JSONB,
  tracking_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create custom_plan_leads table
CREATE TABLE custom_plan_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  phone TEXT,
  tree_count INTEGER,
  message TEXT,
  status lead_status DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
