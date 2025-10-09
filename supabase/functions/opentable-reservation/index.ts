import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, latitude, longitude } = await req.json();
    const apiKey = Deno.env.get('OPENTABLE_API_KEY');

    if (!apiKey) {
      throw new Error('OpenTable API key not configured');
    }

    console.log(`Fetching OpenTable data for ${name} at ${latitude}, ${longitude}`);

    // Search for restaurant
    const searchUrl = `https://platform.otqa.com/sync/listings`;
    
    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        latitude: latitude,
        longitude: longitude,
      })
    });

    if (!searchResponse.ok) {
      console.log(`OpenTable API returned ${searchResponse.status}, generating fallback URL`);
      
      // Create a generic OpenTable search URL as fallback
      const searchName = encodeURIComponent(name.replace(/[^\w\s]/gi, '').replace(/\s+/g, '-').toLowerCase());
      const fallbackUrl = `https://www.opentable.com/s?term=${searchName}`;
      
      return new Response(JSON.stringify({
        restaurantId: null,
        reservationUrl: fallbackUrl,
        available: false,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await searchResponse.json();

    if (!data.items || data.items.length === 0) {
      console.log('No OpenTable restaurant found');
      const searchName = encodeURIComponent(name.replace(/[^\w\s]/gi, '').replace(/\s+/g, '-').toLowerCase());
      const fallbackUrl = `https://www.opentable.com/s?term=${searchName}`;
      
      return new Response(JSON.stringify({
        restaurantId: null,
        reservationUrl: fallbackUrl,
        available: false,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const restaurant = data.items[0];

    const result = {
      restaurantId: restaurant.id,
      reservationUrl: restaurant.reserve_url || `https://www.opentable.com/r/${restaurant.id}`,
      available: restaurant.is_available || false,
      name: restaurant.name,
    };

    console.log('Successfully fetched OpenTable data:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in opentable-reservation function:', error);
    
    // Always provide a fallback URL even on error
    try {
      const { name } = await req.json();
      const searchName = encodeURIComponent(name.replace(/[^\w\s]/gi, '').replace(/\s+/g, '-').toLowerCase());
      const fallbackUrl = `https://www.opentable.com/s?term=${searchName}`;
      
      return new Response(JSON.stringify({ 
        error: error.message,
        restaurantId: null,
        reservationUrl: fallbackUrl,
        available: false,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch {
      return new Response(JSON.stringify({ 
        error: error.message,
        restaurantId: null,
        reservationUrl: null,
        available: false,
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }
});
