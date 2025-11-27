-- =============================================
-- Migration: Remove iemis_code from users table
-- =============================================

-- Drop the unique constraint on iemis_code
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_iemis_code_key;

-- Remove the iemis_code column from users table
ALTER TABLE users DROP COLUMN IF EXISTS iemis_code;

-- Update the JWT payload type to remove iemis_code reference
-- This is handled in the application code, not in the database migration