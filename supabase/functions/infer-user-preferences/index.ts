import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Analyzing preferences for user ${user.id}`);

    // Check if personalization is enabled
    const { data: profile } = await supabase
      .from("profiles")
      .select("personalization_enabled")
      .eq("user_id", user.id)
      .single();

    if (!profile?.personalization_enabled) {
      console.log("Personalization disabled for user");
      return new Response(JSON.stringify({ 
        personalizationEnabled: false,
        preferredCuisines: []
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Analyze favorited restaurants for explicit preferences
    const { data: favorites } = await supabase
      .from("liked_restaurants")
      .select("cuisine, price, restaurant_name")
      .eq("user_id", user.id);

    console.log(`Found ${favorites?.length || 0} favorited restaurants`);

    // 2. Analyze location history to find frequently visited areas
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: locationHistory } = await supabase
      .from("location_history")
      .select("latitude, longitude, recorded_at")
      .eq("user_id", user.id)
      .gte("recorded_at", thirtyDaysAgo.toISOString());

    console.log(`Found ${locationHistory?.length || 0} location records in last 30 days`);

    // 3. Analyze swipe history for behavioral patterns
    const { data: swipes } = await supabase
      .from("swipe_events")
      .select("cuisine, price, restaurant_name, swipe_direction, rating")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200);

    console.log(`Found ${swipes?.length || 0} swipe events`);

    // 4. Analyze orders to see actual purchasing behavior
    const { data: orders } = await supabase
      .from("orders")
      .select("restaurant_name, items")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    console.log(`Found ${orders?.length || 0} orders`);

    // Calculate cuisine frequencies with weighted scoring
    const cuisineScores: Record<string, number> = {};

    // Favorites get highest weight (5 points each)
    if (favorites) {
      for (const fav of favorites) {
        const cuisine = fav.cuisine.toLowerCase();
        cuisineScores[cuisine] = (cuisineScores[cuisine] || 0) + 5;
      }
    }

    // Orders get second highest weight (3 points each)
    if (orders) {
      for (const order of orders) {
        // Try to infer cuisine from restaurant name patterns
        const restaurantName = order.restaurant_name.toLowerCase();
        const inferredCuisine = inferCuisineFromRestaurantName(restaurantName);
        if (inferredCuisine) {
          cuisineScores[inferredCuisine] = (cuisineScores[inferredCuisine] || 0) + 3;
        }
      }
    }

    // Liked swipes get medium weight (2 points each)
    if (swipes) {
      const likedSwipes = swipes.filter(s => s.swipe_direction === 'right');
      for (const swipe of likedSwipes) {
        if (swipe.cuisine) {
          const cuisine = swipe.cuisine.toLowerCase();
          cuisineScores[cuisine] = (cuisineScores[cuisine] || 0) + 2;
        }
      }
    }

    // Frequently opened (viewed details) restaurants from location history patterns
    // This would require tracking which restaurants users view details for
    // For now, we use the data we have

    // Sort cuisines by score and get top preferences
    const preferredCuisines = Object.entries(cuisineScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cuisine, score]) => ({
        cuisine: cuisine.charAt(0).toUpperCase() + cuisine.slice(1),
        confidence: Math.min(100, (score / 20) * 100) // Normalize to percentage
      }));

    console.log(`Inferred top cuisines:`, preferredCuisines);

    // Calculate preferred price range
    const priceScores: Record<string, number> = {};
    
    if (favorites) {
      for (const fav of favorites) {
        priceScores[fav.price] = (priceScores[fav.price] || 0) + 3;
      }
    }
    
    if (swipes) {
      const likedSwipes = swipes.filter(s => s.swipe_direction === 'right' && s.price);
      for (const swipe of likedSwipes) {
        priceScores[swipe.price!] = (priceScores[swipe.price!] || 0) + 1;
      }
    }

    const preferredPriceRange = Object.entries(priceScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([price]) => price);

    console.log(`Preferred price ranges:`, preferredPriceRange);

    // Identify frequently visited restaurant types based on location patterns
    const locationClusters = analyzeLocationClusters(locationHistory || []);
    console.log(`Identified ${locationClusters.length} frequent location clusters`);

    return new Response(JSON.stringify({
      personalizationEnabled: true,
      preferredCuisines,
      preferredPriceRange,
      locationClusters,
      dataPoints: {
        favorites: favorites?.length || 0,
        orders: orders?.length || 0,
        swipes: swipes?.length || 0,
        locationRecords: locationHistory?.length || 0
      },
      analyzedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error inferring preferences:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Helper function to infer cuisine from restaurant name patterns
function inferCuisineFromRestaurantName(name: string): string | null {
  const patterns: Record<string, string[]> = {
    'mexican': ['taco', 'burrito', 'mexican', 'cantina', 'tortilla'],
    'italian': ['pizza', 'pasta', 'italian', 'trattoria', 'pizzeria'],
    'chinese': ['chinese', 'wok', 'dynasty', 'panda'],
    'japanese': ['sushi', 'ramen', 'japanese', 'hibachi'],
    'indian': ['indian', 'curry', 'tandoor', 'spice'],
    'american': ['burger', 'grill', 'diner', 'bbq', 'smokehouse'],
    'thai': ['thai', 'pad thai'],
    'mediterranean': ['mediterranean', 'gyro', 'kebab', 'falafel'],
  };

  for (const [cuisine, keywords] of Object.entries(patterns)) {
    if (keywords.some(keyword => name.includes(keyword))) {
      return cuisine;
    }
  }

  return null;
}

// Helper function to identify location clusters
function analyzeLocationClusters(locations: Array<{ latitude: number; longitude: number; recorded_at: string }>) {
  if (locations.length < 5) return [];

  // Simple clustering: group locations within 0.01 degree (~1km)
  const clusters: Array<{ lat: number; lng: number; count: number }> = [];
  const CLUSTER_THRESHOLD = 0.01;

  for (const loc of locations) {
    let addedToCluster = false;
    
    for (const cluster of clusters) {
      const distance = Math.sqrt(
        Math.pow(loc.latitude - cluster.lat, 2) + 
        Math.pow(loc.longitude - cluster.lng, 2)
      );
      
      if (distance < CLUSTER_THRESHOLD) {
        cluster.count++;
        cluster.lat = (cluster.lat * (cluster.count - 1) + loc.latitude) / cluster.count;
        cluster.lng = (cluster.lng * (cluster.count - 1) + loc.longitude) / cluster.count;
        addedToCluster = true;
        break;
      }
    }
    
    if (!addedToCluster) {
      clusters.push({
        lat: loc.latitude,
        lng: loc.longitude,
        count: 1
      });
    }
  }

  // Return top 3 most frequent clusters
  return clusters
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(c => ({ latitude: c.lat, longitude: c.lng, frequency: c.count }));
}
