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
    
    if (!restaurantName || !latitude || !longitude) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters: restaurantName, latitude, and longitude are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const MEALME_API_KEY = Deno.env.get('MEALME_API_KEY');
    
    if (!MEALME_API_KEY) {
      console.error('MEALME_API_KEY is not configured');
      return new Response(
        JSON.stringify({ 
          error: 'MealMe API key not configured',
          available: false 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Search for restaurant using MealMe API
    const searchUrl = new URL('https://api.mealme.ai/v1/restaurants/search');
    searchUrl.searchParams.append('latitude', latitude.toString());
    searchUrl.searchParams.append('longitude', longitude.toString());
    searchUrl.searchParams.append('radius', '500'); // 500 meters
    searchUrl.searchParams.append('query', restaurantName);

    console.log('Searching MealMe for:', restaurantName, 'at', latitude, longitude);

    const searchResponse = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MEALME_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('MealMe search error:', searchResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to search MealMe',
          available: false 
        }),
        { 
          status: searchResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.restaurants || searchData.restaurants.length === 0) {
      console.log('No restaurants found in MealMe for:', restaurantName);
      return new Response(
        JSON.stringify({ 
          available: false,
          message: 'Restaurant not found in MealMe' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Find best match by name
    const restaurant = searchData.restaurants.find((r: any) => 
      r.name.toLowerCase().includes(restaurantName.toLowerCase()) ||
      restaurantName.toLowerCase().includes(r.name.toLowerCase())
    ) || searchData.restaurants[0];

    console.log('Found restaurant in MealMe:', restaurant.name);

    // Fetch full menu details
    const menuResponse = await fetch(
      `https://api.mealme.ai/v1/restaurants/${restaurant.id}/menu`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${MEALME_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!menuResponse.ok) {
      const errorText = await menuResponse.text();
      console.error('MealMe menu fetch error:', menuResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          available: false,
          message: 'Failed to fetch menu from MealMe' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const menuData = await menuResponse.json();

    // Transform MealMe menu data to our format
    const menuItems = [];
    
    if (menuData.menu && Array.isArray(menuData.menu.categories)) {
      for (const category of menuData.menu.categories) {
        const section = {
          section_name: category.name || 'Menu Items',
          menu_items: [] as any[]
        };

        if (Array.isArray(category.items)) {
          for (const item of category.items) {
            section.menu_items.push({
              name: item.name || '',
              description: item.description || '',
              price: item.price ? `$${(item.price / 100).toFixed(2)}` : undefined,
              image: item.image_url || undefined
            });
          }
        }

        if (section.menu_items.length > 0) {
          menuItems.push(section);
        }
      }
    }

    return new Response(
      JSON.stringify({
        available: menuItems.length > 0,
        menuItems: menuItems,
        restaurantPhone: restaurant.phone || undefined,
        restaurantWebsite: restaurant.website || undefined,
        photos: restaurant.images || [],
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in mealme-menu function:', error);
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
