import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { restaurantId, placeId } = await req.json();
    
    if (!restaurantId) {
      throw new Error('Restaurant ID is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let statusData: any = {
      status_last_checked: new Date().toISOString()
    };

    // Fetch real-time data from Google Places if placeId is available
    if (placeId) {
      const GOOGLE_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
      
      if (GOOGLE_API_KEY) {
        try {
          const fields = [
            'opening_hours',
            'current_opening_hours',
            'business_status',
            'utc_offset_minutes'
          ].join(',');

          const placeResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`
          );

          const placeData = await placeResponse.json();

          if (placeData.status === 'OK' && placeData.result) {
            const result = placeData.result;
            
            // Extract business status
            if (result.business_status) {
              statusData.status = result.business_status === 'OPERATIONAL' 
                ? 'operational' 
                : result.business_status === 'CLOSED_TEMPORARILY'
                ? 'closed_temporarily'
                : result.business_status === 'CLOSED_PERMANENTLY'
                ? 'closed_permanently'
                : 'unknown';
            }

            // Extract current opening status
            if (result.current_opening_hours) {
              statusData.is_open_now = result.current_opening_hours.open_now || false;
              
              // Store structured hours data
              if (result.current_opening_hours.weekday_text) {
                statusData.hours = {
                  weekday_text: result.current_opening_hours.weekday_text,
                  periods: result.current_opening_hours.periods || []
                };
                statusData.opening_hours = result.current_opening_hours.weekday_text.join('\n');
              }
            } else if (result.opening_hours) {
              statusData.is_open_now = result.opening_hours.open_now || false;
              
              if (result.opening_hours.weekday_text) {
                statusData.hours = {
                  weekday_text: result.opening_hours.weekday_text,
                  periods: result.opening_hours.periods || []
                };
                statusData.opening_hours = result.opening_hours.weekday_text.join('\n');
              }
            }

            // Estimate wait times based on popular times (if available from Places API)
            // Note: Popular times require Places API (New) which has different pricing
            // For now, we'll set a placeholder
            statusData.estimated_wait_minutes = null;
            statusData.current_popularity = null;
          }
        } catch (error) {
          console.error('Error fetching Google Places data:', error);
          // Continue with partial update
        }
      }
    }

    // Update the restaurant record
    const { error: updateError } = await supabase
      .from('restaurants')
      .update(statusData)
      .eq('id', restaurantId);

    if (updateError) throw updateError;

    // Fetch the updated restaurant
    const { data: restaurant, error: fetchError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single();

    if (fetchError) throw fetchError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        restaurant,
        updated: Object.keys(statusData)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});