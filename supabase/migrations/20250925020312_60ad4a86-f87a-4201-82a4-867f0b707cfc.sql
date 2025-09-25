-- Add new columns to profiles table for enhanced user data
ALTER TABLE public.profiles 
ADD COLUMN address TEXT,
ADD COLUMN city TEXT,
ADD COLUMN state TEXT,
ADD COLUMN zip_code TEXT,
ADD COLUMN food_preferences TEXT[],
ADD COLUMN dietary_restrictions TEXT[],
ADD COLUMN favorite_cuisines TEXT[],
ADD COLUMN price_preference TEXT CHECK (price_preference IN ('$', '$$', '$$$')),
ADD COLUMN max_distance_preference INTEGER DEFAULT 10;

-- Add index for better performance on location-based queries
CREATE INDEX idx_profiles_location ON public.profiles(city, state);