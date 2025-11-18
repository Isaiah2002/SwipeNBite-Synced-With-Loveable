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
    
    console.log('Geocoding address:', { address, city, state, zip_code });

    // Build the search query
    const searchQuery = `${address}, ${city}, ${state} ${zip_code}, USA`;
    
    // Use Nominatim API (OpenStreetMap's geocoding service)
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(searchQuery)}` +
      `&format=json` +
      `&limit=1` +
      `&addressdetails=1`;

    console.log('Nominatim request URL:', nominatimUrl);

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'SwipeNBite/1.0 (Restaurant Discovery App)', // Required by Nominatim
      },
    });

    if (!response.ok) {
      console.error('Nominatim API error:', response.status, response.statusText);
      throw new Error(`Nominatim API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('Nominatim response:', data);

    if (!data || data.length === 0) {
      console.log('No results found for address');
      return new Response(
        JSON.stringify({ error: 'Unable to geocode address' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const result = data[0];
    const geocodedData = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      formatted_address: result.display_name,
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
    console.error('Error in nominatim-geocode function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
