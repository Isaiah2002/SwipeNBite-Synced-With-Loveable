import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { address, city, state, zip_code } = await req.json();
    
    console.log(`Geocoding address: ${address}, ${city}, ${state} ${zip_code}`);
    
    if (!address || !city || !state || !zip_code) {
      throw new Error('Missing required address fields');
    }

    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key not configured');
    }

    const fullAddress = `${address}, ${city}, ${state} ${zip_code}`;
    const encodedAddress = encodeURIComponent(fullAddress);
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`;
    
    console.log(`Calling Google Maps Geocoding API for: ${fullAddress}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`Google Maps API response status: ${data.status}`);
    
    if (data.status !== 'OK') {
      console.error(`Google Maps API error: ${data.status}`, data.error_message || 'No error message');
      throw new Error(`Geocoding failed: ${data.status}${data.error_message ? ' - ' + data.error_message : ''}`);
    }
    
    if (!data.results || data.results.length === 0) {
      throw new Error('No results found for this address');
    }

    const location = data.results[0].geometry.location;
    
    console.log(`Successfully geocoded to: ${location.lat}, ${location.lng}`);
    
    return new Response(
      JSON.stringify({
        latitude: location.lat,
        longitude: location.lng,
        formatted_address: data.results[0].formatted_address
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
