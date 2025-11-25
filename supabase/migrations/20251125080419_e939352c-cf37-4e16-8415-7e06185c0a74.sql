-- Add consent management fields to profiles table

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS location_tracking_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS analytics_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notifications_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS consent_given_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS consent_updated_at TIMESTAMP WITH TIME ZONE;