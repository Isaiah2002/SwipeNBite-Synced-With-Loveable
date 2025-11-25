import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error('Unauthorized');

    console.log(`Analyzing commute patterns for user ${user.id}`);

    // Get location history from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: locationHistory, error: historyError } = await supabase
      .from('location_history')
      .select('*')
      .eq('user_id', user.id)
      .gte('recorded_at', thirtyDaysAgo.toISOString())
      .order('recorded_at', { ascending: true });

    if (historyError) throw historyError;

    if (!locationHistory || locationHistory.length < 10) {
      return new Response(
        JSON.stringify({ 
          message: 'Not enough location data to analyze patterns',
          patterns: null 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyze patterns
    const patterns = analyzePatterns(locationHistory);

    // Get order history for meal time analysis
    const { data: orders } = await supabase
      .from('orders')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString());

    const mealTimes = analyzeMealTimes(orders || []);

    return new Response(
      JSON.stringify({ 
        patterns: {
          ...patterns,
          typicalMealTimes: mealTimes,
          dataPoints: locationHistory.length,
          analyzedPeriod: '30 days'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing commute patterns:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function analyzePatterns(history: any[]) {
  // Group by day of week and hour
  const routesByTime: { [key: string]: any[] } = {};
  
  history.forEach(point => {
    const key = `${point.day_of_week}-${point.hour_of_day}`;
    if (!routesByTime[key]) routesByTime[key] = [];
    routesByTime[key].push(point);
  });

  // Identify regular routes (routes taken 3+ times at similar times)
  const regularRoutes: any[] = [];
  Object.entries(routesByTime).forEach(([timeKey, points]) => {
    if (points.length >= 3) {
      const [dayOfWeek, hourOfDay] = timeKey.split('-').map(Number);
      
      // Cluster nearby points to identify route segments
      const clusters = clusterPoints(points);
      
      if (clusters.length > 0) {
        regularRoutes.push({
          dayOfWeek,
          hourOfDay,
          frequency: points.length,
          routePoints: clusters,
          isWeekday: dayOfWeek >= 1 && dayOfWeek <= 5,
          timeLabel: getTimeLabel(hourOfDay)
        });
      }
    }
  });

  // Identify commute times (weekday morning and evening patterns)
  const commutePatterns = regularRoutes.filter(route => 
    route.isWeekday && (
      (route.hourOfDay >= 6 && route.hourOfDay <= 9) ||  // Morning commute
      (route.hourOfDay >= 16 && route.hourOfDay <= 19)   // Evening commute
    )
  );

  return {
    regularRoutes: regularRoutes.slice(0, 5),
    commutePatterns,
    hasCommutePattern: commutePatterns.length >= 2,
    totalDataPoints: history.length
  };
}

function clusterPoints(points: any[], radiusMiles = 0.5) {
  const clusters: any[] = [];
  const used = new Set();

  points.forEach((point, i) => {
    if (used.has(i)) return;

    const cluster = [point];
    used.add(i);

    points.forEach((otherPoint, j) => {
      if (i === j || used.has(j)) return;

      const distance = calculateDistance(
        point.latitude,
        point.longitude,
        otherPoint.latitude,
        otherPoint.longitude
      );

      if (distance <= radiusMiles) {
        cluster.push(otherPoint);
        used.add(j);
      }
    });

    if (cluster.length >= 2) {
      const avgLat = cluster.reduce((sum, p) => sum + p.latitude, 0) / cluster.length;
      const avgLon = cluster.reduce((sum, p) => sum + p.longitude, 0) / cluster.length;
      clusters.push({ latitude: avgLat, longitude: avgLon, count: cluster.length });
    }
  });

  return clusters;
}

function analyzeMealTimes(orders: any[]) {
  const hourCounts: { [hour: number]: number } = {};
  
  orders.forEach(order => {
    const hour = new Date(order.created_at).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const mealTimes: any[] = [];
  
  // Breakfast (6-10 AM)
  const breakfastCount = [6, 7, 8, 9, 10].reduce((sum, h) => sum + (hourCounts[h] || 0), 0);
  if (breakfastCount > 0) {
    const topHour = [6, 7, 8, 9, 10].reduce((max, h) => 
      (hourCounts[h] || 0) > (hourCounts[max] || 0) ? h : max
    , 6);
    mealTimes.push({ type: 'breakfast', hour: topHour, frequency: breakfastCount });
  }

  // Lunch (11 AM-2 PM)
  const lunchCount = [11, 12, 13, 14].reduce((sum, h) => sum + (hourCounts[h] || 0), 0);
  if (lunchCount > 0) {
    const topHour = [11, 12, 13, 14].reduce((max, h) => 
      (hourCounts[h] || 0) > (hourCounts[max] || 0) ? h : max
    , 12);
    mealTimes.push({ type: 'lunch', hour: topHour, frequency: lunchCount });
  }

  // Dinner (5-9 PM)
  const dinnerCount = [17, 18, 19, 20, 21].reduce((sum, h) => sum + (hourCounts[h] || 0), 0);
  if (dinnerCount > 0) {
    const topHour = [17, 18, 19, 20, 21].reduce((max, h) => 
      (hourCounts[h] || 0) > (hourCounts[max] || 0) ? h : max
    , 18);
    mealTimes.push({ type: 'dinner', hour: topHour, frequency: dinnerCount });
  }

  return mealTimes;
}

function getTimeLabel(hour: number): string {
  if (hour >= 6 && hour <= 9) return 'Morning Commute';
  if (hour >= 10 && hour <= 15) return 'Midday';
  if (hour >= 16 && hour <= 19) return 'Evening Commute';
  if (hour >= 20 && hour <= 23) return 'Evening';
  return 'Night';
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
