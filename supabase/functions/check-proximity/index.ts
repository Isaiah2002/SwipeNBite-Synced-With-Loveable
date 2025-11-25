import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROXIMITY_RADIUS_MILES = 0.5; // Alert when within 0.5 miles

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

    const { latitude, longitude } = await req.json();

    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude required');
    }

    console.log(`Checking proximity for user ${user.id} at ${latitude}, ${longitude}`);

    // Get user's liked restaurants with location data
    const { data: likedRestaurants, error: likedError } = await supabase
      .from('liked_restaurants')
      .select('restaurant_id, restaurant_name, latitude, longitude, cuisine, image')
      .eq('user_id', user.id)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (likedError) throw likedError;

    if (!likedRestaurants || likedRestaurants.length === 0) {
      return new Response(
        JSON.stringify({ nearbyFavorites: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate distances and find nearby favorites
    const nearbyFavorites = likedRestaurants
      .map(restaurant => {
        const distance = calculateDistance(
          latitude,
          longitude,
          restaurant.latitude!,
          restaurant.longitude!
        );
        return { ...restaurant, distance };
      })
      .filter(r => r.distance <= PROXIMITY_RADIUS_MILES)
      .sort((a, b) => a.distance - b.distance);

    console.log(`Found ${nearbyFavorites.length} nearby favorites`);

    // Send notifications for nearby favorites (only if not already notified recently)
    for (const restaurant of nearbyFavorites.slice(0, 3)) {
      // Check if we've already sent this notification recently (last 24 hours)
      const { data: recentNotifs } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'proximity')
        .eq('restaurant_id', restaurant.restaurant_id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (!recentNotifs || recentNotifs.length === 0) {
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            title: "You're nearby!",
            message: `${restaurant.restaurant_name} is just ${restaurant.distance.toFixed(1)} miles away. Perfect time for a visit!`,
            type: 'proximity',
            restaurant_id: restaurant.restaurant_id,
            restaurant_name: restaurant.restaurant_name
          });

        if (notifError) {
          console.error('Error creating proximity notification:', notifError);
        } else {
          console.log(`Proximity notification sent for ${restaurant.restaurant_name}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ nearbyFavorites }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in check-proximity:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
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
