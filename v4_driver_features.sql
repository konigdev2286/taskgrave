-- v4_driver_features.sql
-- Run this in Supabase SQL Editor to enable advanced driver features

-- 1. Add missing columns to profiles for driver status and tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_location_lat DOUBLE PRECISION;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_location_lng DOUBLE PRECISION;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS balance INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vehicle_type TEXT; -- 'moto', 'car', 'van', 'bicycle'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vehicle_plate TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating DOUBLE PRECISION DEFAULT 4.5;

-- 2. Ensure real-time is enabled for profiles to track online status live
-- (Run this individually if publication exists)
-- ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- 3. Policy to allow drivers to update their own online status and location
-- (Already covered by "Users can update own profile" policy, but good to verify)
