-- Create location_history table to track user movement patterns
CREATE TABLE IF NOT EXISTS public.location_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  day_of_week INTEGER NOT NULL, -- 0-6 (Sunday-Saturday)
  hour_of_day INTEGER NOT NULL, -- 0-23
  is_commute_time BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.location_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own location history"
  ON public.location_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own location history"
  ON public.location_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_location_history_user_time ON public.location_history(user_id, recorded_at DESC);
CREATE INDEX idx_location_history_commute ON public.location_history(user_id, day_of_week, hour_of_day) WHERE is_commute_time = true;