-- Add recommendation quality tracking fields to ab_test_metrics
ALTER TABLE ab_test_metrics
ADD COLUMN clicks_count integer DEFAULT 0,
ADD COLUMN conversions_count integer DEFAULT 0,
ADD COLUMN recommendations_shown integer DEFAULT 0,
ADD COLUMN click_through_rate numeric,
ADD COLUMN conversion_rate numeric;

-- Create table to track individual recommendation interactions
CREATE TABLE recommendation_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid NOT NULL,
  variant_id uuid,
  recommendation_title text NOT NULL,
  recommendation_cuisine text NOT NULL,
  interaction_type text NOT NULL, -- 'view', 'click', 'like', 'order'
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE recommendation_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own interactions"
  ON recommendation_interactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own interactions"
  ON recommendation_interactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_recommendation_interactions_session ON recommendation_interactions(session_id);
CREATE INDEX idx_recommendation_interactions_user ON recommendation_interactions(user_id);
CREATE INDEX idx_recommendation_interactions_variant ON recommendation_interactions(variant_id);