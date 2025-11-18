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
    const { latitude, longitude, radius = 8000, limit = 50 } = await req.json();
    const apiKey = Deno.env.get('YELP_API_KEY');

    if (!apiKey) {
      throw new Error('Yelp API key not configured');
    }

    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required');
    }

    // Yelp API has a maximum radius of 40000 meters (40km)
    const validRadius = Math.min(radius, 40000);
    
    console.log(`Fetching restaurants near ${latitude}, ${longitude} within ${validRadius}m`);

    const searchUrl = `https://api.yelp.com/v3/businesses/search?latitude=${latitude}&longitude=${longitude}&radius=${validRadius}&categories=restaurants,food&limit=${limit}&sort_by=distance`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      }
    });

    if (!searchResponse.ok) {
      const errorData = await searchResponse.text();
      console.error('Yelp API error response:', errorData);
      throw new Error(`Yelp API returned ${searchResponse.status}: ${errorData}`);
    }

    const data = await searchResponse.json();

    if (!data.businesses || data.businesses.length === 0) {
      console.log('No restaurants found nearby');
      return new Response(JSON.stringify({ restaurants: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Transform Yelp data to our restaurant format
    const restaurants = data.businesses.map((business: any, index: number) => {
      // Convert distance from meters to miles
      const distanceInMiles = business.distance ? (business.distance * 0.000621371).toFixed(1) : '0.5';
      
      // Map Yelp price to our format
      let price = business.price || '$';
      if (price === '$$$$') price = '$$$'; // Normalize 4-dollar signs to 3
      
      // Extract dietary options from categories
      const dietary: string[] = [];
      if (business.categories) {
        business.categories.forEach((cat: any) => {
          const alias = cat.alias.toLowerCase();
          if (alias.includes('vegan')) dietary.push('Vegan');
          if (alias.includes('vegetarian')) dietary.push('Vegetarian');
          if (alias.includes('gluten')) dietary.push('Gluten-Free');
          if (alias.includes('halal')) dietary.push('Halal');
          if (alias.includes('kosher')) dietary.push('Kosher');
        });
      }

      return {
        id: business.id || `yelp-${index}`,
        name: business.name,
        cuisine: business.categories?.[0]?.title || 'Restaurant',
        price: price,
        rating: business.rating || 4.0,
        distance: parseFloat(distanceInMiles),
        image: business.image_url || '/placeholder.svg',
        description: business.categories?.map((c: any) => c.title).join(' • ') || 'Local restaurant',
        dietary: dietary,
        deals: business.transactions?.includes('delivery') ? 'Delivery available' : null,
        estimatedTime: Math.round(parseFloat(distanceInMiles) * 3 + 10), // Rough estimate
        latitude: business.coordinates?.latitude,
        longitude: business.coordinates?.longitude,
        yelpId: business.id,
        yelpUrl: business.url,
        yelpRating: business.rating,
        reviewCount: business.review_count,
        phone: business.phone,
        address: business.location?.display_address?.join(', '),
      };
    });

    console.log(`Successfully fetched ${restaurants.length} restaurants`);

    return new Response(JSON.stringify({ restaurants }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in nearby-restaurants function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      restaurants: [],
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
