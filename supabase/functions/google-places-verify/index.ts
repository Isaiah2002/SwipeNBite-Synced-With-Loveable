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
    const { restaurantName, address, latitude, longitude } = await req.json();
    
    console.log('Verifying restaurant location with Google Places:', { 
      restaurantName, 
      address, 
      latitude, 
      longitude 
    });

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    // First, try to find the place using nearby search with coordinates
    let placeData = null;
    
    if (latitude && longitude) {
      const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
        `location=${latitude},${longitude}` +
        `&radius=50` +
        `&keyword=${encodeURIComponent(restaurantName)}` +
        `&type=restaurant` +
        `&key=${apiKey}`;

      const nearbyResponse = await fetch(nearbyUrl);
      const nearbyData = await nearbyResponse.json();

      if (nearbyData.status === 'OK' && nearbyData.results.length > 0) {
        placeData = nearbyData.results[0];
      }
    }

    // If nearby search fails, try text search with address
    if (!placeData && address) {
      const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?` +
        `query=${encodeURIComponent(`${restaurantName} ${address}`)}` +
        `&type=restaurant` +
        `&key=${apiKey}`;

      const textResponse = await fetch(textSearchUrl);
      const textData = await textResponse.json();

      if (textData.status === 'OK' && textData.results.length > 0) {
        placeData = textData.results[0];
      }
    }

    // If no place found, return original data
    if (!placeData) {
      console.log('No Google Places data found, returning original coordinates');
      return new Response(
        JSON.stringify({
          verified: false,
          latitude,
          longitude,
          address,
          message: 'Location not verified with Google Places'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get detailed place information
    const placeId = placeData.place_id;
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?` +
      `place_id=${placeId}` +
      `&fields=name,formatted_address,geometry,formatted_phone_number,website,rating,user_ratings_total,photos,opening_hours,price_level` +
      `&key=${apiKey}`;

    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    if (detailsData.status !== 'OK' || !detailsData.result) {
      console.log('Could not fetch place details');
      return new Response(
        JSON.stringify({
          verified: true,
          latitude: placeData.geometry.location.lat,
          longitude: placeData.geometry.location.lng,
          address: placeData.vicinity || address,
          place_id: placeId
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const result = detailsData.result;
    
    // Extract photo URLs if available
    const photos = result.photos?.slice(0, 5).map((photo: any) => 
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${apiKey}`
    ) || [];

    const verifiedData = {
      verified: true,
      place_id: placeId,
      name: result.name,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      address: result.formatted_address,
      phone: result.formatted_phone_number,
      website: result.website,
      googleRating: result.rating,
      reviewCount: result.user_ratings_total,
      photos,
      priceLevel: result.price_level,
      isOpen: result.opening_hours?.open_now,
    };

    console.log('Successfully verified location with Google Places:', verifiedData);

    return new Response(
      JSON.stringify(verifiedData),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in google-places-verify function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        verified: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
