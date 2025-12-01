import { useState, useEffect } from 'react';
import { Restaurant } from '@/types/restaurant';
import { supabase } from '@/integrations/supabase/client';

interface EnrichedData {
  googlePlacesData?: any;
  yelpData?: any;
  openTableData?: any;
}

interface ApiStatus {
  yelp: 'success' | 'failed' | 'rate_limited' | 'loading';
  openTable: 'success' | 'failed' | 'rate_limited' | 'loading';
}

export const useRestaurantData = (restaurant: Restaurant, enabled: boolean = false) => {
  const [enrichedData, setEnrichedData] = useState<EnrichedData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    yelp: 'loading',
    openTable: 'loading'
  });

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const fetchEnrichedData = async () => {
      if (!restaurant.latitude || !restaurant.longitude) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setApiStatus({ yelp: 'loading', openTable: 'loading' });
        
        // Try to fetch from cache first
        const cacheKey = `restaurant_${restaurant.id}`;
        const cachedData = localStorage.getItem(cacheKey);
        const cachedTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
        const cacheAge = cachedTimestamp ? Date.now() - parseInt(cachedTimestamp) : Infinity;
        
        // Use cache if less than 1 hour old
        if (cachedData && cacheAge < 3600000) {
          const parsed = JSON.parse(cachedData);
          setEnrichedData(parsed);
          setApiStatus({ yelp: 'success', openTable: 'success' });
          setLoading(false);
          return;
        }

        // Call unified middleware endpoint
        console.log('Calling unified enrichment middleware for:', restaurant.name);
        const { data: middlewareData, error: middlewareError } = await supabase.functions.invoke('enrich-restaurant-data', {
          body: {
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            address: restaurant.address,
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
          }
        });

        if (middlewareError) {
          throw middlewareError;
        }

        // Extract data from unified response
        const { merged, sources } = middlewareData;

        // Update API status based on source results
        setApiStatus({
          yelp: sources.yelp?.success ? 'success' : 
                sources.yelp?.error?.includes('Rate limited') ? 'rate_limited' : 'failed',
          openTable: sources.opentable?.success ? 'success' :
                     sources.opentable?.error?.includes('Rate limited') ? 'rate_limited' : 'failed',
        });

        // Structure data for component consumption
        const finalData = {
          googlePlacesData: sources.google?.success ? {
            verified: true,
            latitude: merged.latitude,
            longitude: merged.longitude,
            address: merged.address,
            phone: merged.phone,
            googleRating: merged.googleRating,
            place_id: merged.placeId,
            website: merged.website,
            photos: merged.photos,
            isOpen: merged.isOpen,
            priceLevel: merged.priceLevel,
          } : null,
          yelpData: sources.yelp?.success ? {
            yelpId: merged.yelpId,
            yelpUrl: merged.yelpUrl,
            rating: merged.yelpRating,
            reviewCount: merged.reviewCount,
            reviews: merged.reviews,
            phone: merged.phone,
          } : null,
          openTableData: sources.opentable?.success ? {
            reservationUrl: merged.reservationUrl,
            available: merged.openTableAvailable,
          } : null,
        };

        setEnrichedData(finalData);

        // Cache successful data with data freshness info
        const cacheData = {
          ...finalData,
          _cached_at: Date.now(),
          _sources: sources,
          _last_updated: middlewareData.lastUpdated,
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());

        console.log('Enrichment complete. Data freshness:', middlewareData.lastUpdated);

      } catch (err: any) {
        console.error('Error fetching enriched data:', err);
        setError(err.message);
        
        // Try to use cached data as ultimate fallback
        const cacheKey = `restaurant_${restaurant.id}`;
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          setEnrichedData(parsed);
          setApiStatus({ yelp: 'failed', openTable: 'failed' });
          console.log('Using stale cached data as fallback');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEnrichedData();
  }, [enabled, restaurant.id, restaurant.latitude, restaurant.longitude, restaurant.name]);

  // Merge enriched data with restaurant data
  // Google Places is primary source for location, Yelp for ratings
  const enrichedRestaurant: Restaurant = {
    ...restaurant,
    // Google Places verified location data (highest priority)
    ...(enrichedData.googlePlacesData ? {
      latitude: enrichedData.googlePlacesData.latitude,
      longitude: enrichedData.googlePlacesData.longitude,
      address: enrichedData.googlePlacesData.address,
      phone: enrichedData.googlePlacesData.phone || restaurant.phone,
      googleRating: enrichedData.googlePlacesData.googleRating,
      placeId: enrichedData.googlePlacesData.place_id,
    } : {}),
    // Yelp data for ratings, reviews, and business info
    yelpId: enrichedData.yelpData?.yelpId,
    yelpUrl: enrichedData.yelpData?.yelpUrl,
    yelpRating: enrichedData.yelpData?.rating,
    reviewCount: enrichedData.yelpData?.reviewCount,
    reviews: enrichedData.yelpData?.reviews,
    // OpenTable for reservations
    reservationUrl: enrichedData.openTableData?.reservationUrl,
    openTableAvailable: enrichedData.openTableData?.available,
    // Merge photos from Google Places and Yelp
    photos: [
      ...(restaurant.photos || []),
      ...(enrichedData.googlePlacesData?.photos || []),
    ].filter((photo, index, self) => self.indexOf(photo) === index).slice(0, 10),
  };

  return { enrichedRestaurant, loading, error, apiStatus };
};
