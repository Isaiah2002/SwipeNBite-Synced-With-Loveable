import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting restaurant sync...');

    // Fetch all restaurants from database
    const { data: restaurants, error: fetchError } = await supabase
      .from('restaurants')
      .select('*');

    if (fetchError) {
      console.error('Error fetching restaurants:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${restaurants?.length || 0} restaurants to sync`);

    const syncResults = {
      total: restaurants?.length || 0,
      successful: 0,
      failed: 0,
      errors: [] as any[]
    };

    // Sync each restaurant
    for (const restaurant of restaurants || []) {
      try {
        console.log(`Syncing ${restaurant.name}...`);

        if (!restaurant.latitude || !restaurant.longitude) {
          console.log(`Skipping ${restaurant.name} - missing coordinates`);
          continue;
        }

        // Fetch data from all APIs in parallel
        const [googleResponse, yelpResponse, openTableResponse] = await Promise.allSettled([
          // Google Maps
          fetch(`${supabaseUrl}/functions/v1/google-maps-place`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
              name: restaurant.name,
            }),
          }).then(res => res.json()),

          // Yelp
          fetch(`${supabaseUrl}/functions/v1/yelp-restaurant`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              name: restaurant.name,
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
            }),
          }).then(res => res.json()),

          // OpenTable
          fetch(`${supabaseUrl}/functions/v1/opentable-reservation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              name: restaurant.name,
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
            }),
          }).then(res => res.json()),
        ]);

        // Extract data from fulfilled promises
        const googleData = googleResponse.status === 'fulfilled' ? googleResponse.value : null;
        const yelpData = yelpResponse.status === 'fulfilled' ? yelpResponse.value : null;
        const openTableData = openTableResponse.status === 'fulfilled' ? openTableResponse.value : null;

        // Update restaurant with fresh data
        const updateData: any = {
          last_synced_at: new Date().toISOString(),
        };

        if (googleData) {
          updateData.place_id = googleData.placeId;
          updateData.maps_url = googleData.mapsUrl;
          updateData.google_rating = googleData.rating;
          updateData.photos = googleData.photos || [];
        }

        if (yelpData && !yelpData.error) {
          updateData.yelp_id = yelpData.yelpId;
          updateData.yelp_url = yelpData.yelpUrl;
          updateData.yelp_rating = yelpData.rating;
          updateData.review_count = yelpData.reviewCount;
        }

        if (openTableData) {
          updateData.reservation_url = openTableData.reservationUrl;
          updateData.opentable_available = openTableData.available;
        }

        const { error: updateError } = await supabase
          .from('restaurants')
          .update(updateData)
          .eq('id', restaurant.id);

        if (updateError) {
          console.error(`Error updating ${restaurant.name}:`, updateError);
          syncResults.failed++;
          syncResults.errors.push({
            restaurant: restaurant.name,
            error: updateError.message,
          });
        } else {
          console.log(`Successfully synced ${restaurant.name}`);
          syncResults.successful++;
        }

      } catch (error: any) {
        console.error(`Error syncing ${restaurant.name}:`, error);
        syncResults.failed++;
        syncResults.errors.push({
          restaurant: restaurant.name,
          error: error.message,
        });
      }
    }

    console.log('Sync completed:', syncResults);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Restaurant sync completed',
        results: syncResults,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in sync-restaurants function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
