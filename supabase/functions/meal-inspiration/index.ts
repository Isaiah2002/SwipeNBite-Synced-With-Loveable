import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MealSuggestion {
  mealType: string;
  reason: string;
  restaurants: any[];
  confidence: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude } = await req.json();
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get current time and determine meal type
    const now = new Date();
    const hour = now.getHours();
    const mealType = getMealType(hour);
    
    // Fetch weather data
    const weather = await fetchWeather(latitude, longitude);
    
    // Fetch user data
    const [profile, favorites, swipes] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('liked_restaurants').select('*').eq('user_id', user.id).limit(20),
      supabase.from('swipe_events').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50)
    ]);

    // Generate suggestions using rule-based algorithm
    const suggestions = await generateSuggestions({
      mealType,
      weather: weather.data,
      profile: profile.data,
      favorites: favorites.data || [],
      swipes: swipes.data || [],
      latitude,
      longitude,
      supabase
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        suggestions,
        context: {
          mealType,
          weather: weather.data?.description,
          temperature: weather.data?.temp
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getMealType(hour: number): string {
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 17) return 'snack';
  if (hour >= 17 && hour < 22) return 'dinner';
  return 'late-night';
}

async function fetchWeather(lat: number, lon: number) {
  try {
    // Using Open-Meteo (free, no API key needed)
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`
    );
    const data = await response.json();
    
    const weatherCode = data.current?.weather_code || 0;
    const temp = data.current?.temperature_2m || 70;
    
    return {
      success: true,
      data: {
        temp,
        description: getWeatherDescription(weatherCode),
        code: weatherCode
      }
    };
  } catch (error) {
    return { success: false, data: { temp: 70, description: 'clear', code: 0 } };
  }
}

function getWeatherDescription(code: number): string {
  if (code === 0) return 'clear';
  if (code <= 3) return 'cloudy';
  if (code >= 51 && code <= 67) return 'rainy';
  if (code >= 71 && code <= 77) return 'snowy';
  if (code >= 80 && code <= 99) return 'stormy';
  return 'clear';
}

async function generateSuggestions(params: any): Promise<MealSuggestion[]> {
  const { mealType, weather, profile, favorites, swipes, latitude, longitude, supabase } = params;
  const suggestions: MealSuggestion[] = [];

  // Extract user preferences
  const favoriteCuisines = extractFavoriteCuisines(favorites, swipes);
  const dietaryRestrictions = profile?.dietary_restrictions || [];
  const pricePreference = profile?.price_preference || '$$';

  // Rule 1: Time-based suggestions
  const timeBased = getTimeBasedSuggestion(mealType, weather, favoriteCuisines[0]);
  if (timeBased) {
    const restaurants = await findRestaurants(supabase, {
      cuisine: timeBased.cuisine,
      dietary: dietaryRestrictions,
      price: pricePreference,
      latitude,
      longitude,
      limit: 2
    });
    
    if (restaurants.length > 0) {
      suggestions.push({
        mealType: timeBased.name,
        reason: timeBased.reason,
        restaurants,
        confidence: 0.9
      });
    }
  }

  // Rule 2: Weather-based suggestions
  const weatherBased = getWeatherBasedSuggestion(weather, favoriteCuisines);
  if (weatherBased) {
    const restaurants = await findRestaurants(supabase, {
      cuisine: weatherBased.cuisine,
      dietary: dietaryRestrictions,
      price: pricePreference,
      latitude,
      longitude,
      limit: 2
    });
    
    if (restaurants.length > 0) {
      suggestions.push({
        mealType: weatherBased.name,
        reason: weatherBased.reason,
        restaurants,
        confidence: 0.8
      });
    }
  }

  // Rule 3: Favorite-based suggestions
  if (favorites.length > 0) {
    const topCuisine = favoriteCuisines[0];
    const restaurants = await findRestaurants(supabase, {
      cuisine: topCuisine,
      dietary: dietaryRestrictions,
      price: pricePreference,
      latitude,
      longitude,
      limit: 2
    });
    
    if (restaurants.length > 0) {
      suggestions.push({
        mealType: `Your ${topCuisine} Favorites`,
        reason: `Based on your love for ${topCuisine} cuisine`,
        restaurants,
        confidence: 0.95
      });
    }
  }

  // Rule 4: Fallback - Most popular nearby
  if (suggestions.length < 3) {
    const popular = await findRestaurants(supabase, {
      cuisine: null,
      dietary: dietaryRestrictions,
      price: null,
      latitude,
      longitude,
      limit: 3,
      sortBy: 'rating'
    });
    
    if (popular.length > 0) {
      suggestions.push({
        mealType: 'Most Popular Nearby',
        reason: 'Highly rated restaurants in your area',
        restaurants: popular,
        confidence: 0.7
      });
    }
  }

  // Return top 3-5 suggestions sorted by confidence
  return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

function extractFavoriteCuisines(favorites: any[], swipes: any[]): string[] {
  const cuisineCount: Record<string, number> = {};
  
  favorites.forEach(fav => {
    cuisineCount[fav.cuisine] = (cuisineCount[fav.cuisine] || 0) + 2; // Weight favorites higher
  });
  
  swipes.filter(s => s.swipe_direction === 'right').forEach(swipe => {
    if (swipe.cuisine) {
      cuisineCount[swipe.cuisine] = (cuisineCount[swipe.cuisine] || 0) + 1;
    }
  });
  
  return Object.entries(cuisineCount)
    .sort(([, a], [, b]) => b - a)
    .map(([cuisine]) => cuisine);
}

function getTimeBasedSuggestion(mealType: string, weather: any, topCuisine?: string) {
  const temp = weather?.temp || 70;
  
  switch (mealType) {
    case 'breakfast':
      return {
        name: 'Morning Fuel',
        cuisine: temp < 50 ? 'American' : 'Cafe',
        reason: temp < 50 ? 'Warm breakfast to start your day' : 'Light breakfast to energize you'
      };
    case 'lunch':
      return {
        name: 'Midday Break',
        cuisine: topCuisine || 'American',
        reason: 'Quick and satisfying lunch option'
      };
    case 'dinner':
      return {
        name: 'Evening Feast',
        cuisine: topCuisine || 'Italian',
        reason: 'Perfect dinner to end your day'
      };
    case 'snack':
      return {
        name: 'Afternoon Pick-Me-Up',
        cuisine: 'Cafe',
        reason: 'Light snack to keep you going'
      };
    case 'late-night':
      return {
        name: 'Late Night Cravings',
        cuisine: 'American',
        reason: 'Satisfying late-night options'
      };
    default:
      return null;
  }
}

function getWeatherBasedSuggestion(weather: any, favoriteCuisines: string[]) {
  const temp = weather?.temp || 70;
  const description = weather?.description || 'clear';
  
  if (temp < 40) {
    return {
      name: 'Cozy & Warm',
      cuisine: favoriteCuisines.includes('Italian') ? 'Italian' : 'American',
      reason: `It's ${Math.round(temp)}°F - warm comfort food sounds perfect`
    };
  }
  
  if (temp > 80) {
    return {
      name: 'Cool & Fresh',
      cuisine: favoriteCuisines.includes('Salad') ? 'Salad' : 'Asian',
      reason: `It's ${Math.round(temp)}°F - light and refreshing meals are ideal`
    };
  }
  
  if (description === 'rainy' || description === 'stormy') {
    return {
      name: 'Rainy Day Comfort',
      cuisine: favoriteCuisines.includes('Mexican') ? 'Mexican' : 'American',
      reason: 'Cozy comfort food for a rainy day'
    };
  }
  
  if (description === 'clear' && temp > 60 && temp < 80) {
    return {
      name: 'Beautiful Day Special',
      cuisine: favoriteCuisines[0] || 'Mediterranean',
      reason: 'Perfect weather for your favorite cuisine'
    };
  }
  
  return null;
}

async function findRestaurants(supabase: any, filters: any) {
  let query = supabase
    .from('restaurants')
    .select('*')
    .not('address', 'is', null);
  
  if (filters.cuisine) {
    query = query.ilike('cuisine', `%${filters.cuisine}%`);
  }
  
  if (filters.price) {
    query = query.eq('price', filters.price);
  }
  
  if (filters.dietary && filters.dietary.length > 0) {
    query = query.contains('dietary', filters.dietary);
  }
  
  const sortBy = filters.sortBy || 'rating';
  query = query.order(sortBy, { ascending: false }).limit(filters.limit || 3);
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error finding restaurants:', error);
    return [];
  }
  
  return data || [];
}