-- Create table to track which restaurants accept meal plans from which universities
CREATE TABLE public.university_meal_plan_restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  university TEXT NOT NULL,
  restaurant_id TEXT NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  restaurant_name TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(university, restaurant_id)
);

-- Enable RLS
ALTER TABLE public.university_meal_plan_restaurants ENABLE ROW LEVEL SECURITY;

-- Everyone can view meal plan restaurants
CREATE POLICY "Everyone can view meal plan restaurants"
  ON public.university_meal_plan_restaurants
  FOR SELECT
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_meal_plan_university ON public.university_meal_plan_restaurants(university);
CREATE INDEX idx_meal_plan_restaurant ON public.university_meal_plan_restaurants(restaurant_id);

-- Add trigger for updated_at
CREATE TRIGGER update_university_meal_plan_restaurants_updated_at
  BEFORE UPDATE ON public.university_meal_plan_restaurants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();