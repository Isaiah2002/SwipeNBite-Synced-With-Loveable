# Restaurant Data Sync Middleware

## Overview
Unified middleware layer that orchestrates Google Maps, Yelp, and OpenTable data enrichment with clear priority rules and automatic refresh jobs.

## Data Source Priority Rules

### Location Data
- **Primary**: Google Places API (most accurate coordinates and addresses)
- **Fallback**: Database records

### Ratings
- **Primary**: Yelp (most comprehensive user ratings)
- **Secondary**: Google Places
- **Display**: Show both when available

### Reviews
- **Primary**: Yelp (detailed user reviews)
- **Fallback**: None (reviews require Yelp)

### Menu Data
- **Primary**: MealMe API (structured menu data)
- **Secondary**: SerpAPI (fallback when MealMe unavailable)

### Reservations
- **Only Source**: OpenTable

### Photos
- **Priority Order**: Google Places > Yelp > Menu APIs
- **Max**: 10 photos per restaurant

## Architecture

### 1. Unified Enrichment Endpoint
**Function**: `enrich-restaurant-data`
- Orchestrates all API calls in parallel
- Applies priority rules for data merging
- Tracks data source success/failure
- Logs data freshness timestamps
- Updates database in background

### 2. Periodic Refresh Job
**Function**: `refresh-restaurant-data`
- Refreshes restaurants older than 7 days
- Processes 10 restaurants per run
- Staggers requests to avoid rate limits
- Can be scheduled via pg_cron

### 3. Client-Side Hook
**Hook**: `useRestaurantData`
- Calls unified middleware
- Caches enriched data (1 hour TTL)
- Provides graceful degradation
- Exposes API status for UI feedback

## Setup Periodic Refresh (Optional)

To enable automatic data refresh, run this SQL in your Supabase SQL Editor:

```sql
-- Enable extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule refresh job (runs every 6 hours)
SELECT cron.schedule(
  'refresh-restaurant-data',
  '0 */6 * * *',  -- Every 6 hours
  $$
  SELECT net.http_post(
    url:='https://otjtbhrwoxhdsxfvoigr.supabase.co/functions/v1/refresh-restaurant-data',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90anRiaHJ3b3hoZHN4ZnZvaWdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDEyNDEsImV4cCI6MjA3MzAxNzI0MX0.LvqpJAi1P_lIgiElFCQa7bcmpatBcYMjXGCOskPReRI"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- View scheduled jobs
SELECT * FROM cron.job;

-- To remove the job (if needed):
-- SELECT cron.unschedule('refresh-restaurant-data');
```

## Data Freshness

- **Cache TTL**: 1 hour (client-side)
- **Refresh Threshold**: 7 days (database)
- **Last Synced**: Tracked in `restaurants.last_synced_at`

## Error Handling

### Rate Limiting
- Detected automatically for all APIs
- Falls back to cached data
- Displays user-friendly status messages

### API Failures
- Graceful degradation to cached data
- Individual API failures don't break entire flow
- Missing data shows "currently unavailable" placeholders

### Cache Strategy
- Client-side localStorage (1 hour)
- Database persistence (permanent)
- Stale-while-revalidate pattern

## Monitoring

Check edge function logs to monitor:
- API success/failure rates
- Rate limiting occurrences
- Data merge conflicts
- Processing times

Links:
- [Enrichment Logs](https://supabase.com/dashboard/project/otjtbhrwoxhdsxfvoigr/functions/enrich-restaurant-data/logs)
- [Refresh Job Logs](https://supabase.com/dashboard/project/otjtbhrwoxhdsxfvoigr/functions/refresh-restaurant-data/logs)
