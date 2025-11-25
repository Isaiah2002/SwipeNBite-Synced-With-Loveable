-- Add budget fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS daily_budget DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS weekly_budget DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS monthly_budget DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS budget_alerts_enabled BOOLEAN DEFAULT true;

-- Add comment explaining the budget fields
COMMENT ON COLUMN public.profiles.daily_budget IS 'Daily food budget limit in dollars';
COMMENT ON COLUMN public.profiles.weekly_budget IS 'Weekly food budget limit in dollars';
COMMENT ON COLUMN public.profiles.monthly_budget IS 'Monthly food budget limit in dollars';
COMMENT ON COLUMN public.profiles.budget_alerts_enabled IS 'Whether to show budget alerts to the user';