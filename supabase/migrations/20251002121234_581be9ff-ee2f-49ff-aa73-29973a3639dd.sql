-- Create friendships table to track friend connections
CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON public.friendships(friend_id);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their friendships"
ON public.friendships FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships"
ON public.friendships FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friendships"
ON public.friendships FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE TRIGGER update_friendships_updated_at
BEFORE UPDATE ON public.friendships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create liked_restaurants table
CREATE TABLE public.liked_restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  price TEXT NOT NULL,
  rating NUMERIC NOT NULL,
  distance NUMERIC NOT NULL,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  dietary TEXT[] NOT NULL DEFAULT '{}',
  estimated_time INTEGER NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  deals TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);

CREATE INDEX idx_liked_restaurants_user_id ON public.liked_restaurants(user_id);

ALTER TABLE public.liked_restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own likes"
ON public.liked_restaurants FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  auth.uid() IN (
    SELECT friend_id FROM public.friendships 
    WHERE user_id = liked_restaurants.user_id AND status = 'accepted'
  )
  OR
  auth.uid() IN (
    SELECT user_id FROM public.friendships 
    WHERE friend_id = liked_restaurants.user_id AND status = 'accepted'
  )
);

CREATE POLICY "Users can create likes"
ON public.liked_restaurants FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete likes"
ON public.liked_restaurants FOR DELETE
USING (auth.uid() = user_id);

-- Create shared_restaurants table
CREATE TABLE public.shared_restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  price TEXT NOT NULL,
  rating NUMERIC NOT NULL,
  distance NUMERIC NOT NULL,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  dietary TEXT[] NOT NULL DEFAULT '{}',
  estimated_time INTEGER NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  deals TEXT,
  message TEXT,
  viewed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_shared_restaurants_recipient_id ON public.shared_restaurants(recipient_id);
CREATE INDEX idx_shared_restaurants_sender_id ON public.shared_restaurants(sender_id);

ALTER TABLE public.shared_restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their shares"
ON public.shared_restaurants FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create shares"
ON public.shared_restaurants FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update shares"
ON public.shared_restaurants FOR UPDATE
USING (auth.uid() = recipient_id);