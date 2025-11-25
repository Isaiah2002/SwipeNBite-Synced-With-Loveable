import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LocationInsights {
  topNeighborhoods: { area: string; count: number; avgDistance: number }[];
  avgOrderDistance: number;
  preferredDistanceRange: string;
  locationPatterns: { cuisine: string; avgDistance: number }[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log(`Analyzing location patterns for user ${user.id}`);

    // Get user's orders with location data
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('restaurant_id, restaurant_name, delivery_address')
      .eq('user_id', user.id);

    if (ordersError) throw ordersError;

    // Get liked restaurants with location data
    const { data: likedRestaurants, error: likedError } = await supabase
      .from('liked_restaurants')
      .select('restaurant_id, restaurant_name, distance, latitude, longitude, cuisine')
      .eq('user_id', user.id);

    if (likedError) throw likedError;

    // Analyze patterns
    const insights = await analyzeLocationBehavior(orders || [], likedRestaurants || []);

    return new Response(
      JSON.stringify({ success: true, insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-location-patterns:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function analyzeLocationBehavior(
  orders: any[],
  likedRestaurants: any[]
): Promise<LocationInsights> {
  // Group by neighborhoods (using first part of delivery address or proximity)
  const neighborhoodMap: Record<string, { count: number; distances: number[] }> = {};
  
  orders.forEach(order => {
    if (order.delivery_address) {
      // Extract neighborhood from address (simplified - could use geocoding)
      const parts = order.delivery_address.split(',');
      const neighborhood = parts[parts.length - 2]?.trim() || 'Unknown';
      
      if (!neighborhoodMap[neighborhood]) {
        neighborhoodMap[neighborhood] = { count: 0, distances: [] };
      }
      neighborhoodMap[neighborhood].count++;
    }
  });

  const topNeighborhoods = Object.entries(neighborhoodMap)
    .map(([area, data]) => ({
      area,
      count: data.count,
      avgDistance: data.distances.length > 0
        ? data.distances.reduce((a, b) => a + b, 0) / data.distances.length
        : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Analyze distance patterns
  const distances = likedRestaurants.map(r => r.distance).filter(d => d > 0);
  const avgOrderDistance = distances.length > 0
    ? distances.reduce((a, b) => a + b, 0) / distances.length
    : 0;

  // Determine preferred distance range
  let preferredDistanceRange = 'Any distance';
  if (avgOrderDistance < 1) {
    preferredDistanceRange = 'Under 1 mile';
  } else if (avgOrderDistance < 3) {
    preferredDistanceRange = '1-3 miles';
  } else if (avgOrderDistance < 5) {
    preferredDistanceRange = '3-5 miles';
  } else {
    preferredDistanceRange = '5+ miles';
  }

  // Cuisine-distance patterns
  const cuisineDistances: Record<string, number[]> = {};
  likedRestaurants.forEach(r => {
    if (r.cuisine && r.distance > 0) {
      if (!cuisineDistances[r.cuisine]) {
        cuisineDistances[r.cuisine] = [];
      }
      cuisineDistances[r.cuisine].push(r.distance);
    }
  });

  const locationPatterns = Object.entries(cuisineDistances)
    .map(([cuisine, dists]) => ({
      cuisine,
      avgDistance: dists.reduce((a, b) => a + b, 0) / dists.length
    }))
    .sort((a, b) => a.avgDistance - b.avgDistance)
    .slice(0, 5);

  return {
    topNeighborhoods,
    avgOrderDistance: Math.round(avgOrderDistance * 10) / 10,
    preferredDistanceRange,
    locationPatterns
  };
}
