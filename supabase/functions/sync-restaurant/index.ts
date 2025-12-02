import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncRestaurantRequest {
  restaurant: {
    id: string;
    name: string;
    cuisine: string;
    price: string;
    rating: number;
    distance: number;
    image: string;
    description: string;
    dietary: string[];
    estimatedTime: number;
    latitude?: number;
    longitude?: number;
    address?: string;
    deals?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { restaurant } = await req.json() as SyncRestaurantRequest;

    console.log(`[Sync] Syncing restaurant: ${restaurant.name}`);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if restaurant exists in database
    const { data: existingRestaurant } = await supabase
      .from('restaurants')
      .select('id, maps_url, place_id, last_synced_at')
      .eq('id', restaurant.id)
      .single();

    if (existingRestaurant) {
      console.log(`[Sync] Restaurant exists in database`);
      return new Response(JSON.stringify({
        success: true,
        restaurant_id: restaurant.id,
        maps_url: existingRestaurant.maps_url,
        already_synced: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[Sync] Restaurant not in database - adding and enriching...`);

    // Restaurant doesn't exist - add it and enrich with Google Places
    let mapsUrl = null;
    let placeId = null;
    let googleRating = null;
    let photos: string[] = [];

    // Try to get Google Places data
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    
    if (GOOGLE_MAPS_API_KEY) {
      try {
        console.log(`[Sync] Enriching with Google Places...`);
        
        // Try nearby search first if we have coordinates
        if (restaurant.latitude && restaurant.longitude) {
          const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${restaurant.latitude},${restaurant.longitude}&radius=50&keyword=${encodeURIComponent(restaurant.name)}&key=${GOOGLE_MAPS_API_KEY}`;
          const nearbyResponse = await fetch(nearbyUrl);
          const nearbyData = await nearbyResponse.json();

          if (nearbyData.results && nearbyData.results.length > 0) {
            const place = nearbyData.results[0];
            placeId = place.place_id;
            googleRating = place.rating;
            mapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
            
            if (place.photos && place.photos.length > 0) {
              photos = place.photos.slice(0, 5).map((photo: any) => 
                `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
              );
            }
            
            console.log(`[Sync] Found via nearby search: ${placeId}`);
          }
        }

        // Fallback to text search if nearby didn't work
        if (!placeId && restaurant.address) {
          const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(`${restaurant.name} ${restaurant.address}`)}&key=${GOOGLE_MAPS_API_KEY}`;
          const textResponse = await fetch(textSearchUrl);
          const textData = await textResponse.json();

          if (textData.results && textData.results.length > 0) {
            const place = textData.results[0];
            placeId = place.place_id;
            googleRating = place.rating;
            mapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
            
            if (place.photos && place.photos.length > 0) {
              photos = place.photos.slice(0, 5).map((photo: any) => 
                `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
              );
            }
            
            console.log(`[Sync] Found via text search: ${placeId}`);
          }
        }
      } catch (error) {
        console.error('[Sync] Google Places enrichment failed:', error);
      }
    }

    // Insert restaurant into database
    const { error: insertError } = await supabase
      .from('restaurants')
      .insert({
        id: restaurant.id,
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        price: restaurant.price,
        rating: restaurant.rating,
        distance: restaurant.distance,
        image: restaurant.image,
        description: restaurant.description,
        dietary: restaurant.dietary,
        estimated_time: restaurant.estimatedTime,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        deals: restaurant.deals,
        place_id: placeId,
        maps_url: mapsUrl,
        google_rating: googleRating,
        photos: photos.length > 0 ? photos : null,
        last_synced_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('[Sync] Error inserting restaurant:', insertError);
      throw insertError;
    }

    console.log(`[Sync] Restaurant synced successfully`);

    return new Response(JSON.stringify({
      success: true,
      restaurant_id: restaurant.id,
      maps_url: mapsUrl,
      place_id: placeId,
      newly_synced: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Sync] Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
