import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Refresh restaurants that are older than 7 days
const REFRESH_THRESHOLD_DAYS = 7;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== PERIODIC REFRESH JOB STARTED ===');
    const startTime = Date.now();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find restaurants that need refreshing
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - REFRESH_THRESHOLD_DAYS);

    const { data: restaurants, error: fetchError } = await supabase
      .from('restaurants')
      .select('id, name, latitude, longitude, address, last_synced_at')
      .or(`last_synced_at.is.null,last_synced_at.lt.${thresholdDate.toISOString()}`)
      .limit(10); // Refresh 10 restaurants per run to avoid rate limits

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${restaurants?.length || 0} restaurants to refresh`);

    if (!restaurants || restaurants.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No restaurants need refreshing',
          timestamp: new Date().toISOString()
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const results = [];

    // Process restaurants with staggered delays to avoid rate limiting
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      
      try {
        console.log(`[${i + 1}/${restaurants.length}] Refreshing: ${restaurant.name}`);
        
        // Call unified enrichment middleware
        const { data, error } = await supabase.functions.invoke('enrich-restaurant-data', {
          body: {
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            address: restaurant.address,
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
          }
        });

        if (error) {
          throw error;
        }

        results.push({
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          success: true,
          sources: data.sources,
          processingTime: Date.now() - startTime,
        });

        console.log(`[${i + 1}/${restaurants.length}] ✓ Complete`);
        
        // Stagger requests (2-4 seconds between each)
        if (i < restaurants.length - 1) {
          const delay = 2000 + Math.random() * 2000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
      } catch (error) {
        console.error(`[${i + 1}/${restaurants.length}] ✗ Failed:`, error.message);
        results.push({
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          success: false,
          error: error.message,
        });
      }
    }

    const totalTime = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;

    console.log('=== REFRESH JOB COMPLETE ===');
    console.log(`Success: ${successCount}/${restaurants.length}`);
    console.log(`Total time: ${totalTime}ms`);

    return new Response(
      JSON.stringify({
        message: 'Refresh job completed',
        totalRestaurants: restaurants.length,
        successCount,
        failedCount: restaurants.length - successCount,
        totalTime: `${totalTime}ms`,
        results,
        timestamp: new Date().toISOString(),
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('=== REFRESH JOB ERROR ===', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
