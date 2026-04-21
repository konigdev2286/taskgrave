-- SCHEMA UPDATE V3: Add missing recipient info to missions
-- Run this in your Supabase SQL Editor

ALTER TABLE missions ADD COLUMN IF NOT EXISTS receiver_name TEXT;
ALTER TABLE missions ADD COLUMN IF NOT EXISTS receiver_phone TEXT;

-- Verify columns
COMMENT ON COLUMN missions.receiver_name IS 'Nom du destinataire de la livraison';
COMMENT ON COLUMN missions.receiver_phone IS 'Numéro de téléphone du destinataire';
