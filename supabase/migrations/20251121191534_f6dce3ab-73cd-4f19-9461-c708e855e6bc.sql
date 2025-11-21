-- Create swipe_events table for comprehensive analytics
CREATE TABLE public.swipe_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  restaurant_id TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  swipe_direction TEXT NOT NULL CHECK (swipe_direction IN ('left', 'right')),
  cuisine TEXT,
  price TEXT,
  rating NUMERIC,
  distance NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.swipe_events ENABLE ROW LEVEL SECURITY;

-- Create policies for swipe_events
CREATE POLICY "Users can insert their own swipe events"
ON public.swipe_events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own swipe events"
ON public.swipe_events
FOR SELECT
USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_swipe_events_user_id ON public.swipe_events(user_id);
CREATE INDEX idx_swipe_events_created_at ON public.swipe_events(created_at);
CREATE INDEX idx_swipe_events_direction ON public.swipe_events(swipe_direction);