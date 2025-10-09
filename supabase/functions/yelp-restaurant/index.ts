import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 3600000; // 1 hour

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, latitude, longitude } = await req.json();
    const apiKey = Deno.env.get('YELP_API_KEY');

    if (!apiKey) {
      throw new Error('Yelp API key not configured');
    }

    const cacheKey = `${name}_${latitude}_${longitude}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Returning cached Yelp data');
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Fetching Yelp data for ${name} at ${latitude}, ${longitude}`);

    // Search for business
    const searchUrl = `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(name)}&latitude=${latitude}&longitude=${longitude}&limit=1`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      }
    });

    if (!searchResponse.ok) {
      throw new Error(`Yelp API error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();

    if (!searchData.businesses || searchData.businesses.length === 0) {
      console.log('No Yelp business found');
      return new Response(JSON.stringify({
        yelpId: null,
        rating: null,
        reviewCount: 0,
        photos: [],
        categories: [],
        yelpUrl: null,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const business = searchData.businesses[0];

    // Get detailed business information including reviews
    const detailsUrl = `https://api.yelp.com/v3/businesses/${business.id}`;
    
    const detailsResponse = await fetch(detailsUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      }
    });

    const detailsData = await detailsResponse.json();

    // Get reviews
    const reviewsUrl = `https://api.yelp.com/v3/businesses/${business.id}/reviews?limit=3&sort_by=rating`;
    
    const reviewsResponse = await fetch(reviewsUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      }
    });

    const reviewsData = await reviewsResponse.json();

    const result = {
      yelpId: business.id,
      rating: detailsData.rating,
      reviewCount: detailsData.review_count,
      photos: detailsData.photos || [],
      categories: detailsData.categories?.map((cat: any) => cat.title) || [],
      yelpUrl: detailsData.url,
      price: detailsData.price,
      phone: detailsData.display_phone,
      reviews: reviewsData.reviews?.map((review: any) => ({
        id: review.id,
        rating: review.rating,
        text: review.text,
        user: review.user.name,
        timeCreated: review.time_created,
      })) || [],
      transactions: detailsData.transactions || [],
    };

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    console.log('Successfully fetched Yelp data:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in yelp-restaurant function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      yelpId: null,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
