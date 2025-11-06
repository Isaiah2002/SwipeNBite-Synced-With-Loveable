-- Create restaurants table to store synced restaurant data
CREATE TABLE public.restaurants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  price TEXT NOT NULL CHECK (price IN ('$', '$$', '$$$')),
  rating NUMERIC NOT NULL,
  distance NUMERIC NOT NULL,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  dietary TEXT[] NOT NULL DEFAULT '{}',
  deals TEXT,
  estimated_time INTEGER NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  
  -- Google Maps data
  place_id TEXT,
  maps_url TEXT,
  google_rating NUMERIC,
  photos TEXT[],
  
  -- Yelp data
  yelp_id TEXT,
  yelp_url TEXT,
  yelp_rating NUMERIC,
  review_count INTEGER,
  
  -- OpenTable data
  reservation_url TEXT,
  opentable_available BOOLEAN,
  
  -- Sync metadata
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_restaurants_cuisine ON public.restaurants(cuisine);
CREATE INDEX idx_restaurants_rating ON public.restaurants(rating);
CREATE INDEX idx_restaurants_price ON public.restaurants(price);
CREATE INDEX idx_restaurants_last_synced ON public.restaurants(last_synced_at);

-- Enable RLS
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read restaurants (public data)
CREATE POLICY "Everyone can view restaurants" 
ON public.restaurants 
FOR SELECT 
USING (true);

-- Create menu_items table
CREATE TABLE public.menu_items (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  category TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for menu items
CREATE INDEX idx_menu_items_restaurant ON public.menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category ON public.menu_items(category);

-- Enable RLS for menu items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read menu items (public data)
CREATE POLICY "Everyone can view menu items" 
ON public.menu_items 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_restaurants_updated_at
BEFORE UPDATE ON public.restaurants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();