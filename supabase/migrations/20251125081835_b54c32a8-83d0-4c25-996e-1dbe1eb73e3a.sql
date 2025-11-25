-- Create recommendation_feedback table to track user feedback on AI recommendations
CREATE TABLE public.recommendation_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recommendation_title TEXT NOT NULL,
  recommendation_cuisine TEXT NOT NULL,
  recommendation_reason TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('positive', 'negative')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id TEXT NOT NULL,
  model_used TEXT DEFAULT 'google/gemini-2.5-flash',
  total_swipes_at_generation INTEGER,
  like_ratio_at_generation NUMERIC
);

-- Enable Row Level Security
ALTER TABLE public.recommendation_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for recommendation_feedback
CREATE POLICY "Users can insert their own feedback"
  ON public.recommendation_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback"
  ON public.recommendation_feedback
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_recommendation_feedback_user_id ON public.recommendation_feedback(user_id);
CREATE INDEX idx_recommendation_feedback_created_at ON public.recommendation_feedback(created_at DESC);
CREATE INDEX idx_recommendation_feedback_feedback_type ON public.recommendation_feedback(feedback_type);