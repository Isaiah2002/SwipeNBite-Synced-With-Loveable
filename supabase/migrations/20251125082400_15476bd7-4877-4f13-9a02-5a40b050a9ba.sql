-- Create ab_test_variants table to define test configurations
CREATE TABLE public.ab_test_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_name TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  model TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  temperature NUMERIC DEFAULT 0.7,
  is_active BOOLEAN NOT NULL DEFAULT true,
  traffic_allocation NUMERIC NOT NULL DEFAULT 50.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(test_name, variant_name)
);

-- Create ab_test_assignments table to track which users see which variants
CREATE TABLE public.ab_test_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  test_name TEXT NOT NULL,
  variant_id UUID NOT NULL REFERENCES public.ab_test_variants(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, test_name)
);

-- Create ab_test_metrics table to track performance of each variant
CREATE TABLE public.ab_test_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  variant_id UUID NOT NULL REFERENCES public.ab_test_variants(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  positive_feedback_count INTEGER NOT NULL DEFAULT 0,
  negative_feedback_count INTEGER NOT NULL DEFAULT 0,
  total_feedback_count INTEGER NOT NULL DEFAULT 0,
  acceptance_rate NUMERIC,
  avg_swipes_at_generation NUMERIC,
  avg_like_ratio_at_generation NUMERIC,
  generation_time_ms INTEGER,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ab_test_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_metrics ENABLE ROW LEVEL SECURITY;

-- Policies for ab_test_variants (public read, no write for users)
CREATE POLICY "Everyone can view active variants"
  ON public.ab_test_variants
  FOR SELECT
  USING (is_active = true);

-- Policies for ab_test_assignments
CREATE POLICY "Users can view their own assignments"
  ON public.ab_test_assignments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assignments"
  ON public.ab_test_assignments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies for ab_test_metrics
CREATE POLICY "Users can view metrics for their variants"
  ON public.ab_test_metrics
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_ab_test_variants_test_name ON public.ab_test_variants(test_name) WHERE is_active = true;
CREATE INDEX idx_ab_test_assignments_user_test ON public.ab_test_assignments(user_id, test_name);
CREATE INDEX idx_ab_test_metrics_variant_id ON public.ab_test_metrics(variant_id);
CREATE INDEX idx_ab_test_metrics_recorded_at ON public.ab_test_metrics(recorded_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_ab_test_variants_updated_at
  BEFORE UPDATE ON public.ab_test_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();