import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DataSourcePriority {
  location: 'google' | 'yelp' | 'database';
  rating: 'google' | 'yelp' | 'database';
  reviews: 'yelp' | 'google';
  reservations: 'opentable';
  photos: 'google' | 'yelp';
}

const PRIORITY_RULES: DataSourcePriority = {
  location: 'google',      // Google Places most accurate for location
  rating: 'yelp',          // Yelp has most comprehensive ratings
  reviews: 'yelp',         // Yelp reviews are most detailed
  reservations: 'opentable', // OpenTable only source
  photos: 'google',        // Google Places photos highest quality
};

interface EnrichedResult {
  data: any;
  sources: {
    google?: { success: boolean; timestamp: string; error?: string };
    yelp?: { success: boolean; timestamp: string; error?: string };
    opentable?: { success: boolean; timestamp: string; error?: string };
  };
  merged: any;
  lastUpdated: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { restaurantId, restaurantName, address, latitude, longitude } = await req.json();
    
    console.log('=== MIDDLEWARE: Enriching restaurant data ===');
    console.log(`Restaurant: ${restaurantName} (ID: ${restaurantId})`);
    console.log(`Location: ${latitude}, ${longitude}`);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    
    // Track API call results
    const sources: EnrichedResult['sources'] = {};

    // 1. Fetch Google Places data (PRIORITY: location, photos, basic info)
    let googleData = null;
    try {
      console.log('[Google Places] Fetching...');
      const { data, error } = await supabase.functions.invoke('google-places-verify', {
        body: { restaurantName, address, latitude, longitude }
      });
      
      if (error) throw error;
      
      googleData = data;
      sources.google = { 
        success: data?.verified || false, 
        timestamp,
        error: data?.verified ? undefined : 'Location not verified'
      };
      console.log(`[Google Places] ${data?.verified ? '✓ Success' : '✗ Failed'}`);
    } catch (error) {
      console.error('[Google Places] Error:', error.message);
      sources.google = { success: false, timestamp, error: error.message };
    }

    // 2. Fetch Yelp data (PRIORITY: ratings, reviews)
    let yelpData = null;
    try {
      console.log('[Yelp] Fetching...');
      const { data, error } = await supabase.functions.invoke('yelp-restaurant', {
        body: { name: restaurantName, latitude, longitude }
      });
      
      if (error && error.message?.includes('429')) {
        throw new Error('Rate limited');
      }
      
      yelpData = data;
      sources.yelp = { 
        success: !!data, 
        timestamp,
        error: data ? undefined : 'No Yelp data found'
      };
      console.log(`[Yelp] ${data ? '✓ Success' : '✗ Failed'}`);
    } catch (error) {
      console.error('[Yelp] Error:', error.message);
      sources.yelp = { 
        success: false, 
        timestamp, 
        error: error.message.includes('429') ? 'Rate limited' : error.message 
      };
    }

    // 3. Fetch OpenTable data (PRIORITY: reservations)
    let openTableData = null;
    try {
      console.log('[OpenTable] Fetching...');
      const { data, error } = await supabase.functions.invoke('opentable-reservation', {
        body: { name: restaurantName, latitude, longitude }
      });
      
      openTableData = data;
      sources.opentable = { 
        success: data?.available || false, 
        timestamp,
        error: data?.available ? undefined : 'Reservations not available'
      };
      console.log(`[OpenTable] ${data?.available ? '✓ Success' : '✗ Failed'}`);
    } catch (error) {
      console.error('[OpenTable] Error:', error.message);
      sources.opentable = { success: false, timestamp, error: error.message };
    }

    // 4. MERGE DATA USING PRIORITY RULES
    console.log('=== MERGING DATA ===');
    
    const merged = {
      // Location data (Priority: Google > Database)
      latitude: googleData?.latitude || latitude,
      longitude: googleData?.longitude || longitude,
      address: googleData?.address || address,
      placeId: googleData?.place_id,
      
      // Contact info (Priority: Google > Yelp)
      phone: googleData?.phone || yelpData?.phone,
      website: googleData?.website,
      
      // Ratings (Store all, Priority: Yelp > Google for display)
      primaryRating: yelpData?.rating || googleData?.googleRating,
      googleRating: googleData?.googleRating,
      yelpRating: yelpData?.rating,
      reviewCount: yelpData?.reviewCount || googleData?.reviewCount,
      
      // Reviews (Priority: Yelp only)
      reviews: yelpData?.reviews || [],
      
      // External links
      yelpId: yelpData?.yelpId,
      yelpUrl: yelpData?.yelpUrl,
      mapsUrl: googleData?.place_id 
        ? `https://www.google.com/maps/place/?q=place_id:${googleData.place_id}`
        : `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
      
      // Reservations (Priority: OpenTable only)
      reservationUrl: openTableData?.reservationUrl,
      openTableAvailable: openTableData?.available || false,
      
      // Photos (Priority: Google > Yelp)
      photos: [
        ...(googleData?.photos || []),
        ...(yelpData?.photos || []),
      ].filter((photo, index, self) => self.indexOf(photo) === index).slice(0, 10),
      
      // Business hours (Priority: Google)
      isOpen: googleData?.isOpen,
      priceLevel: googleData?.priceLevel,
    };

    const processingTime = Date.now() - startTime;
    
    console.log('=== ENRICHMENT COMPLETE ===');
    console.log(`Processing time: ${processingTime}ms`);
    console.log(`Data sources used: ${Object.keys(sources).filter(k => sources[k as keyof typeof sources]?.success).join(', ')}`);

    // 6. UPDATE RESTAURANT IN DATABASE (background task)
    EdgeRuntime.waitUntil((async () => {
      try {
        const { error: updateError } = await supabase
          .from('restaurants')
          .update({
            latitude: merged.latitude,
            longitude: merged.longitude,
            place_id: merged.placeId,
            maps_url: merged.mapsUrl,
            google_rating: merged.googleRating,
            yelp_id: merged.yelpId,
            yelp_url: merged.yelpUrl,
            yelp_rating: merged.yelpRating,
            review_count: merged.reviewCount,
            reservation_url: merged.reservationUrl,
            opentable_available: merged.openTableAvailable,
            photos: merged.photos,
            last_synced_at: timestamp,
          })
          .eq('id', restaurantId);

        if (updateError) {
          console.error('[Database Update] Failed:', updateError.message);
        } else {
          console.log('[Database Update] ✓ Success');
        }
      } catch (error) {
        console.error('[Database Update] Error:', error.message);
      }
    })());

    const result: EnrichedResult = {
      data: merged,
      sources,
      merged,
      lastUpdated: timestamp,
    };

    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('=== MIDDLEWARE ERROR ===', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
