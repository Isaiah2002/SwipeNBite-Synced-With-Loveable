-- Create achievements table
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  badge_icon text NOT NULL,
  badge_color text NOT NULL,
  criteria_type text NOT NULL, -- 'swipe_count', 'share_count', 'friend_count', 'order_count', 'review_count'
  criteria_threshold integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create user_achievements table to track unlocked achievements
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements (public read)
CREATE POLICY "Everyone can view achievements"
  ON public.achievements
  FOR SELECT
  USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON public.user_achievements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO public.achievements (name, description, badge_icon, badge_color, criteria_type, criteria_threshold) VALUES
  ('First Bite', 'Swiped on your first restaurant', 'Utensils', 'hsl(142, 76%, 36%)', 'swipe_count', 1),
  ('Explorer', 'Swiped on 25 restaurants', 'Compass', 'hsl(217, 91%, 60%)', 'swipe_count', 25),
  ('Top Explorer', 'Swiped on 100 restaurants', 'Map', 'hsl(262, 83%, 58%)', 'swipe_count', 100),
  ('Social Butterfly', 'Shared 5 restaurants with friends', 'Share2', 'hsl(24, 95%, 53%)', 'share_count', 5),
  ('Taste Maker', 'Shared 20 restaurants and helped friends discover food', 'Award', 'hsl(45, 93%, 47%)', 'share_count', 20),
  ('Foodie Squad', 'Added 3 friends to the app', 'Users', 'hsl(339, 82%, 52%)', 'friend_count', 3),
  ('Community Builder', 'Invited 10 friends to join', 'UserPlus', 'hsl(173, 80%, 40%)', 'friend_count', 10),
  ('Regular', 'Placed 5 orders', 'ShoppingBag', 'hsl(221, 83%, 53%)', 'order_count', 5),
  ('VIP Diner', 'Placed 25 orders', 'Crown', 'hsl(280, 100%, 70%)', 'order_count', 25),
  ('Culinary Critic', 'Liked 10 restaurants', 'Heart', 'hsl(0, 84%, 60%)', 'like_count', 10),
  ('Connoisseur', 'Liked 50 restaurants to build your collection', 'Star', 'hsl(48, 96%, 53%)', 'like_count', 50);

-- Create indexes for performance
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
CREATE INDEX idx_achievements_criteria ON public.achievements(criteria_type, criteria_threshold);