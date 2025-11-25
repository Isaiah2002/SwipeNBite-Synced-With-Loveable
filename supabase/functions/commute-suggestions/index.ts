import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ROUTE_RADIUS_MILES = 0.8; // Restaurants within 0.8 miles of route

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

    const { latitude, longitude } = await req.json();
    if (!latitude || !longitude) throw new Error('Location required');

    console.log(`Finding commute suggestions for user ${user.id} at ${latitude}, ${longitude}`);

    // Get user preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('favorite_cuisines, price_preference')
      .eq('user_id', user.id)
      .single();

    // Get commute patterns
    const { data: patternsData } = await supabase.functions.invoke('analyze-commute-patterns');
    const patterns = patternsData?.patterns;

    if (!patterns || !patterns.hasCommutePattern) {
      return new Response(
        JSON.stringify({ 
          suggestions: [],
          message: 'No commute patterns detected yet. Keep using the app to build your profile!'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current hour and day
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    // Find if we're on a typical route
    const relevantRoutes = patterns.commutePatterns.filter((pattern: any) =>
      pattern.dayOfWeek === currentDay &&
      Math.abs(pattern.hourOfDay - currentHour) <= 1
    );

    if (relevantRoutes.length === 0) {
      return new Response(
        JSON.stringify({ 
          suggestions: [],
          message: 'Not currently on a typical commute route'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all restaurants
    let restaurantsQuery = supabase
      .from('restaurants')
      .select('*')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .gte('rating', 3.5);

    if (profile?.favorite_cuisines && profile.favorite_cuisines.length > 0) {
      restaurantsQuery = restaurantsQuery.in('cuisine', profile.favorite_cuisines);
    }
    if (profile?.price_preference) {
      restaurantsQuery = restaurantsQuery.eq('price', profile.price_preference);
    }

    const { data: restaurants } = await restaurantsQuery;

    // Find restaurants along the route
    const routeSuggestions = (restaurants || [])
      .map(restaurant => {
        const distanceFromCurrent = calculateDistance(
          latitude,
          longitude,
          restaurant.latitude!,
          restaurant.longitude!
        );

        // Check if restaurant is near any point on typical routes
        let minRouteDistance = Infinity;
        relevantRoutes.forEach((route: any) => {
          route.routePoints?.forEach((point: any) => {
            const dist = calculateDistance(
              point.latitude,
              point.longitude,
              restaurant.latitude!,
              restaurant.longitude!
            );
            if (dist < minRouteDistance) minRouteDistance = dist;
          });
        });

        return {
          ...restaurant,
          distanceFromRoute: minRouteDistance,
          distanceFromCurrent
        };
      })
      .filter(r => r.distanceFromRoute <= ROUTE_RADIUS_MILES)
      .sort((a, b) => a.distanceFromCurrent - b.distanceFromCurrent)
      .slice(0, 5);

    // Check meal time and send notification if appropriate
    const mealTime = patterns.typicalMealTimes?.find((meal: any) => 
      Math.abs(meal.hour - currentHour) <= 1
    );

    if (mealTime && routeSuggestions.length > 0) {
      const topSuggestion = routeSuggestions[0];
      
      // Check if we've notified about this recently
      const { data: recentNotifs } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'commute')
        .gte('created_at', new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString());

      if (!recentNotifs || recentNotifs.length === 0) {
        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            title: `Perfect ${mealTime.type} spot ahead!`,
            message: `${topSuggestion.name} is ${topSuggestion.distanceFromCurrent.toFixed(1)} miles along your route. ${topSuggestion.rating}★`,
            type: 'commute',
            restaurant_id: topSuggestion.id,
            restaurant_name: topSuggestion.name
          });
        console.log(`Commute suggestion sent for ${topSuggestion.name}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        suggestions: routeSuggestions,
        mealTime: mealTime?.type,
        routeType: relevantRoutes[0]?.timeLabel
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating commute suggestions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

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
