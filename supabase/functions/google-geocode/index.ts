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
    const { address, city, state, zip_code } = await req.json();
    
    console.log('Geocoding address with Google Maps:', { address, city, state, zip_code });

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    // Build the search query
    const searchQuery = `${address}, ${city}, ${state} ${zip_code}, USA`;
    
    // Use Google Maps Geocoding API
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?` +
      `address=${encodeURIComponent(searchQuery)}` +
      `&key=${apiKey}`;

    console.log('Google Maps Geocoding request');

    const response = await fetch(geocodeUrl);

    if (!response.ok) {
      console.error('Google Maps API error:', response.status, response.statusText);
      throw new Error(`Google Maps API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('Google Maps response status:', data.status);

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.log('No results found for address');
      return new Response(
        JSON.stringify({ error: 'Unable to geocode address' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const result = data.results[0];
    const geocodedData = {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      formatted_address: result.formatted_address,
    };

    console.log('Successfully geocoded:', geocodedData);

    return new Response(
      JSON.stringify(geocodedData),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in google-geocode function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
