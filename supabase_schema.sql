-- SQL Schema for J'ARRIVE Logistics
-- Paste this into your Supabase SQL Editor

-- 1. Create a table for user profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'particular', -- 'particular', 'pro', 'driver', 'admin'
  company_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT role_check CHECK (role IN ('particular', 'pro', 'driver', 'admin'))
);

-- 2. Create a table for vehicles (only for drivers)
CREATE TABLE vehicles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'moto', 'van', 'bicycle'
  model TEXT,
  plate_number TEXT,
  color TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create a table for missions (deliveries)
CREATE TABLE missions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'assigned', 'picked_up', 'delivered', 'cancelled'
  type TEXT NOT NULL, -- 'package', 'food', 'gas', 'moving'
  
  origin_address TEXT NOT NULL,
  origin_lat DOUBLE PRECISION,
  origin_lng DOUBLE PRECISION,
  
  dest_address TEXT NOT NULL,
  dest_lat DOUBLE PRECISION,
  dest_lng DOUBLE PRECISION,
  
  price_fcfa INTEGER NOT NULL,
  distance_km DOUBLE PRECISION,
  estimated_time_min INTEGER,
  
  payment_status TEXT DEFAULT 'unpaid', -- 'unpaid', 'paid', 'refunded'
  payment_method TEXT DEFAULT 'momo',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT status_check CHECK (status IN ('pending', 'accepted', 'assigned', 'picked_up', 'delivered', 'cancelled'))
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

-- 5. Policies (Example)
-- Profiles: Users can read their own profile, Admins can read everything
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Missions: Clients can view their own missions, Drivers can view assigned missions/available pending, Admins all.
CREATE POLICY "Clients view own missions" ON missions FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "Drivers view available" ON missions FOR SELECT USING (status = 'pending' OR driver_id = auth.uid());

-- Trigger for auto-profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone', COALESCE(new.raw_user_meta_data->>'role', 'particular'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
