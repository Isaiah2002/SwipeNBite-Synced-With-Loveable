-- Add personalization preference to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS personalization_enabled BOOLEAN DEFAULT true;

COMMENT ON COLUMN profiles.personalization_enabled IS 'Controls whether AI-based personalization uses behavioral data';
