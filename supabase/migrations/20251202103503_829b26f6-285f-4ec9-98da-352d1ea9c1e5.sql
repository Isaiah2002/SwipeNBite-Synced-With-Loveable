-- Add real-time information fields to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS hours jsonb,
ADD COLUMN IF NOT EXISTS is_open_now boolean,
ADD COLUMN IF NOT EXISTS opening_hours text,
ADD COLUMN IF NOT EXISTS estimated_wait_minutes integer,
ADD COLUMN IF NOT EXISTS current_popularity integer,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS status_last_checked timestamp with time zone;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_restaurants_status ON restaurants(is_open_now, status);
CREATE INDEX IF NOT EXISTS idx_restaurants_last_checked ON restaurants(status_last_checked);

-- Comment on columns
COMMENT ON COLUMN restaurants.hours IS 'Structured hours data from Google Places API';
COMMENT ON COLUMN restaurants.is_open_now IS 'Real-time open/closed status';
COMMENT ON COLUMN restaurants.opening_hours IS 'Human-readable hours text';
COMMENT ON COLUMN restaurants.estimated_wait_minutes IS 'Estimated wait time in minutes';
COMMENT ON COLUMN restaurants.current_popularity IS 'Current popularity/busy level (0-100)';
COMMENT ON COLUMN restaurants.status IS 'operational_status: operational, closed_temporarily, closed_permanently, unknown';
COMMENT ON COLUMN restaurants.status_last_checked IS 'Last time status was verified';