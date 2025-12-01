import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { restaurantName, address, latitude, longitude } = await req.json();
    const SERPAPI_API_KEY = Deno.env.get('SERPAPI_API_KEY');

    if (!SERPAPI_API_KEY) {
      throw new Error('SERPAPI_API_KEY is not configured');
    }

    console.log('Searching for restaurant:', { restaurantName, address, latitude, longitude });

    // Step 1: Search for the restaurant using Google Maps
    const searchQuery = `${restaurantName} ${address || ''}`.trim();
    const searchParams = new URLSearchParams({
      engine: 'google_maps',
      q: searchQuery,
      api_key: SERPAPI_API_KEY,
    });

    if (latitude && longitude) {
      searchParams.append('ll', `@${latitude},${longitude},15z`);
    }

    const searchUrl = `https://serpapi.com/search.json?${searchParams.toString()}`;
    console.log('SerpAPI search URL:', searchUrl);

    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('SerpAPI search error:', searchResponse.status, errorText);
      
      // Check if it's an HTML response (invalid API key)
      if (errorText.includes('<!DOCTYPE html>') || errorText.includes('<html')) {
        throw new Error('Invalid SerpAPI API key or service unavailable');
      }
      
      throw new Error(`SerpAPI search failed: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    console.log('SerpAPI search results:', JSON.stringify(searchData, null, 2));

    // Check for both place_results (direct match) and local_results (multiple matches)
    let matchedRestaurant = searchData.place_results;
    let dataId = matchedRestaurant?.data_id;

    // If no direct match, look in local_results
    if (!dataId) {
      const localResults = searchData.local_results || [];
      if (localResults.length === 0) {
        console.log('No restaurants found in search results');
        return new Response(
          JSON.stringify({ 
            available: false, 
            message: 'Restaurant not found in Google Maps' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Match by name (case-insensitive)
      const normalizedSearchName = restaurantName.toLowerCase();
      matchedRestaurant = localResults.find((r: any) => 
        r.title?.toLowerCase().includes(normalizedSearchName) || 
        normalizedSearchName.includes(r.title?.toLowerCase())
      );

      // If no match, use the first result
      if (!matchedRestaurant) {
        matchedRestaurant = localResults[0];
        console.log('No exact match found, using first result:', matchedRestaurant.title);
      }

      dataId = matchedRestaurant.data_id;
    } else {
      console.log('Found direct place match:', matchedRestaurant.title);
    }
    if (!dataId) {
      console.log('No data_id found for restaurant');
      return new Response(
        JSON.stringify({ 
          available: false,
          message: 'Restaurant data unavailable'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found restaurant with data_id:', dataId);

    // Step 2: Fetch detailed restaurant information including menu
    const detailsParams = new URLSearchParams({
      engine: 'google_maps',
      type: 'place',
      data_id: dataId,
      api_key: SERPAPI_API_KEY,
    });

    const detailsUrl = `https://serpapi.com/search.json?${detailsParams.toString()}`;
    console.log('Fetching restaurant details:', detailsUrl);

    const detailsResponse = await fetch(detailsUrl);
    
    if (!detailsResponse.ok) {
      const errorText = await detailsResponse.text();
      console.error('SerpAPI details error:', detailsResponse.status, errorText);
      throw new Error(`Failed to fetch restaurant details: ${detailsResponse.status}`);
    }

    const detailsData = await detailsResponse.json();
    console.log('Restaurant details received');

    // Extract menu information
    const menu = detailsData.menu;
    const menuSections: any[] = [];

    if (menu && menu.sections) {
      for (const section of menu.sections) {
        const menuSection = {
          section_name: section.title || 'Menu',
          menu_items: (section.items || []).map((item: any) => ({
            name: item.title || '',
            description: item.description || '',
            price: item.price || '',
          })),
        };
        menuSections.push(menuSection);
      }
    }

    // Build response with menu data and additional info
    const responseData = {
      available: menuSections.length > 0,
      menuItems: menuSections,
      restaurantPhone: detailsData.phone || matchedRestaurant.phone || '',
      restaurantWebsite: detailsData.website || matchedRestaurant.website || '',
      address: detailsData.address || matchedRestaurant.address || '',
      rating: detailsData.rating || matchedRestaurant.rating || null,
      reviews: detailsData.reviews || matchedRestaurant.reviews || 0,
      hours: detailsData.hours || [],
      photos: detailsData.photos?.slice(0, 10).map((p: any) => p.thumbnail || p.image) || [],
    };

    console.log(`Menu data extracted: ${menuSections.length} sections found`);

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in serpapi-menu function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        available: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
