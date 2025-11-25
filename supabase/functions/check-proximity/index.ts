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

    // Get user profile for preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('favorite_cuisines, price_preference, dietary_restrictions')
      .eq('user_id', user.id)
      .single();

    // Get user's liked restaurants with location data
    const { data: likedRestaurants, error: likedError } = await supabase
      .from('liked_restaurants')
      .select('restaurant_id, restaurant_name, latitude, longitude, cuisine, image')
      .eq('user_id', user.id)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (likedError) throw likedError;

    // Calculate distances and find nearby favorites
    const nearbyFavorites = (likedRestaurants || [])
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

    // Fetch highly-rated restaurants matching preferences
    let newRestaurantsQuery = supabase
      .from('restaurants')
      .select('id, name, latitude, longitude, rating, cuisine, price, image')
      .gte('rating', 4.0)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    // Apply preference filters if available
    if (profile?.favorite_cuisines && profile.favorite_cuisines.length > 0) {
      newRestaurantsQuery = newRestaurantsQuery.in('cuisine', profile.favorite_cuisines);
    }
    if (profile?.price_preference) {
      newRestaurantsQuery = newRestaurantsQuery.eq('price', profile.price_preference);
    }

    const { data: allRestaurants } = await newRestaurantsQuery;

    // Calculate distance and filter nearby restaurants (excluding already liked ones)
    const likedIds = new Set((likedRestaurants || []).map(r => r.restaurant_id));
    const nearbyNewPlaces = (allRestaurants || [])
      .filter(restaurant => !likedIds.has(restaurant.id))
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
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 2);

    console.log(`Found ${nearbyNewPlaces.length} nearby new places matching preferences`);

    // Send notifications for nearby favorites (only if not already notified recently)
    for (const restaurant of nearbyFavorites.slice(0, 2)) {
      const { data: recentNotifs } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'proximity')
        .eq('restaurant_id', restaurant.restaurant_id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (!recentNotifs || recentNotifs.length === 0) {
        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            title: "You're near a favorite!",
            message: `${restaurant.restaurant_name} is just ${restaurant.distance.toFixed(1)} miles away. Perfect time to visit!`,
            type: 'proximity',
            restaurant_id: restaurant.restaurant_id,
            restaurant_name: restaurant.restaurant_name
          });
        console.log(`Proximity notification sent for ${restaurant.restaurant_name}`);
      }
    }

    // Send notifications for nearby new places
    for (const restaurant of nearbyNewPlaces) {
      const { data: recentNotifs } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'discovery')
        .eq('restaurant_id', restaurant.id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (!recentNotifs || recentNotifs.length === 0) {
        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            title: "Discover nearby!",
            message: `${restaurant.name} (${restaurant.rating}★) is ${restaurant.distance.toFixed(1)} miles away and matches your taste!`,
            type: 'discovery',
            restaurant_id: restaurant.id,
            restaurant_name: restaurant.name
          });
        console.log(`Discovery notification sent for ${restaurant.name}`);
      }
    }

    // Check for commute-based suggestions
    const now = new Date();
    const currentHour = now.getHours();
    const isCommuteTime = (currentHour >= 6 && currentHour <= 9) || (currentHour >= 16 && currentHour <= 19);
    
    if (isCommuteTime) {
      try {
        await supabase.functions.invoke('commute-suggestions', {
          body: { latitude, longitude }
        });
      } catch (error) {
        console.log('Commute suggestions check:', error);
      }
    }

  return new Response(
    JSON.stringify({ 
      nearbyFavorites: nearbyFavorites.length,
      nearbyNewPlaces: nearbyNewPlaces.length 
    }),
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
