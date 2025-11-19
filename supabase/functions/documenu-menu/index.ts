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
    const { restaurantName, latitude, longitude } = await req.json();
    console.log('Fetching menu for:', restaurantName, 'at', latitude, longitude);

    const DOCUMENU_API_KEY = Deno.env.get('DOCUMENU_API_KEY');
    if (!DOCUMENU_API_KEY) {
      throw new Error('DOCUMENU_API_KEY is not configured');
    }

    // Search for restaurant by name and location
    const searchUrl = new URL('https://api.documenu.com/v2/restaurants/search/geo');
    searchUrl.searchParams.append('lat', latitude.toString());
    searchUrl.searchParams.append('lon', longitude.toString());
    searchUrl.searchParams.append('distance', '1'); // 1 mile radius
    searchUrl.searchParams.append('fullmenu', 'true');

    console.log('Searching Documenu API:', searchUrl.toString());

    const searchResponse = await fetch(searchUrl.toString(), {
      headers: {
        'X-API-KEY': DOCUMENU_API_KEY,
      },
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Documenu API error:', searchResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch from Documenu API',
          details: errorText,
          available: false 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const restaurants = await searchResponse.json();
    console.log('Found restaurants:', restaurants.data?.length || 0);

    if (!restaurants.data || restaurants.data.length === 0) {
      return new Response(
        JSON.stringify({ 
          available: false,
          message: 'No menu data available'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Find the best match by name
    const normalizedSearchName = restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchedRestaurant = restaurants.data.find((r: any) => {
      const normalizedName = r.restaurant_name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normalizedName.includes(normalizedSearchName) || normalizedSearchName.includes(normalizedName);
    }) || restaurants.data[0];

    console.log('Matched restaurant:', matchedRestaurant.restaurant_name);

    // Fetch full menu details if we have a restaurant ID
    if (matchedRestaurant.restaurant_id) {
      const menuUrl = `https://api.documenu.com/v2/restaurant/${matchedRestaurant.restaurant_id}`;
      console.log('Fetching menu details:', menuUrl);

      const menuResponse = await fetch(menuUrl, {
        headers: {
          'X-API-KEY': DOCUMENU_API_KEY,
        },
      });

      if (menuResponse.ok) {
        const menuData = await menuResponse.json();
        console.log('Menu data retrieved successfully');

        return new Response(
          JSON.stringify({
            available: true,
            restaurantId: menuData.restaurant_id,
            restaurantName: menuData.restaurant_name,
            restaurantPhone: menuData.restaurant_phone,
            restaurantWebsite: menuData.restaurant_website,
            hours: menuData.hours,
            menuItems: menuData.menus || [],
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Fallback: return basic data from search
    return new Response(
      JSON.stringify({
        available: true,
        restaurantId: matchedRestaurant.restaurant_id,
        restaurantName: matchedRestaurant.restaurant_name,
        menuItems: matchedRestaurant.menus || [],
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in documenu-menu function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        available: false 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
