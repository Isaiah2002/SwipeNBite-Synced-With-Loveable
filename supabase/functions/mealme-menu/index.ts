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
    const searchUrl = new URL('https://api.mealme.ai/search/store/v3');
    searchUrl.searchParams.append('latitude', latitude.toString());
    searchUrl.searchParams.append('longitude', longitude.toString());
    searchUrl.searchParams.append('query', restaurantName);
    searchUrl.searchParams.append('store_type', 'restaurant');
    searchUrl.searchParams.append('maximum_miles', '1');

    console.log('Searching MealMe for:', restaurantName, 'at', latitude, longitude);

    const searchResponse = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: {
        'Id-Token': MEALME_API_KEY,
        'accept': 'application/json',
      },
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('MealMe search error:', searchResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to search MealMe',
          available: false,
          statusCode: searchResponse.status
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.stores || searchData.stores.length === 0) {
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
    const restaurant = searchData.stores.find((r: any) => 
      r.name.toLowerCase().includes(restaurantName.toLowerCase()) ||
      restaurantName.toLowerCase().includes(r.name.toLowerCase())
    ) || searchData.stores[0];

    console.log('Found restaurant in MealMe:', restaurant.name, 'ID:', restaurant.mealme_store_id);

    // Fetch full menu details using store lookup and inventory APIs
    const storeUrl = new URL('https://api.mealme.ai/store/lookup/v2');
    storeUrl.searchParams.append('store_ids', restaurant.mealme_store_id);
    
    const storeResponse = await fetch(storeUrl.toString(), {
      method: 'GET',
      headers: {
        'Id-Token': MEALME_API_KEY,
        'accept': 'application/json',
      },
    });

    if (!storeResponse.ok) {
      const errorText = await storeResponse.text();
      console.error('MealMe store lookup error:', storeResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          available: false,
          message: 'Failed to fetch store details from MealMe' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const storeData = await storeResponse.json();
    const storeDetails = storeData.stores?.[0];

    if (!storeDetails) {
      return new Response(
        JSON.stringify({ 
          available: false,
          message: 'Store details not found' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch inventory/menu
    const inventoryUrl = new URL('https://api.mealme.ai/inventory/details/v4');
    inventoryUrl.searchParams.append('store_id', restaurant.mealme_store_id);

    const menuResponse = await fetch(inventoryUrl.toString(), {
      method: 'GET',
      headers: {
        'Id-Token': MEALME_API_KEY,
        'accept': 'application/json',
      },
    });

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
    
    if (menuData.sections && Array.isArray(menuData.sections)) {
      for (const section of menuData.sections) {
        const menuSection = {
          section_name: section.name || 'Menu Items',
          menu_items: [] as any[]
        };

        if (Array.isArray(section.items)) {
          for (const item of section.items) {
            menuSection.menu_items.push({
              name: item.name || '',
              description: item.description || '',
              price: item.price ? `$${(item.price / 100).toFixed(2)}` : undefined,
              image: item.image || undefined
            });
          }
        }

        if (menuSection.menu_items.length > 0) {
          menuItems.push(menuSection);
        }
      }
    }

    return new Response(
      JSON.stringify({
        available: menuItems.length > 0,
        menuItems: menuItems,
        restaurantPhone: storeDetails.phone_number || undefined,
        restaurantWebsite: storeDetails.website || undefined,
        photos: storeDetails.images || [],
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
