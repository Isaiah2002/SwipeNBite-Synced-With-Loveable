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
    const { latitude, longitude, name } = await req.json();
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');

    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    console.log(`Fetching place details for ${name} at ${latitude}, ${longitude}`);

    // First, find the place
    const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=50&keyword=${encodeURIComponent(name)}&key=${apiKey}`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.status !== 'OK' || !searchData.results || searchData.results.length === 0) {
      console.log('No place found, returning basic data');
      return new Response(JSON.stringify({
        placeId: null,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
        rating: null,
        userRatingsTotal: 0,
        photos: [],
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const place = searchData.results[0];
    const placeId = place.place_id;

    // Get detailed place information
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,photos,url,opening_hours,formatted_phone_number,website&key=${apiKey}`;
    
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    if (detailsData.status !== 'OK') {
      throw new Error(`Google Places API error: ${detailsData.status}`);
    }

    const placeDetails = detailsData.result;

    // Get photo URLs if available
    const photos = placeDetails.photos?.slice(0, 3).map((photo: any) => 
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${apiKey}`
    ) || [];

    const result = {
      placeId,
      mapsUrl: placeDetails.url || `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
      rating: placeDetails.rating,
      userRatingsTotal: placeDetails.user_ratings_total,
      photos,
      openingHours: placeDetails.opening_hours?.weekday_text || [],
      phoneNumber: placeDetails.formatted_phone_number,
      website: placeDetails.website,
    };

    console.log('Successfully fetched place details:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in google-maps-place function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      placeId: null,
      mapsUrl: null,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
