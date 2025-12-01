import { useState, useEffect } from 'react';
import { Restaurant } from '@/types/restaurant';
import { supabase } from '@/integrations/supabase/client';

interface EnrichedData {
  yelpData?: any;
  openTableData?: any;
  serpapiData?: any;
}

interface ApiStatus {
  yelp: 'success' | 'failed' | 'rate_limited' | 'loading';
  openTable: 'success' | 'failed' | 'rate_limited' | 'loading';
  menu: 'success' | 'failed' | 'rate_limited' | 'loading';
}

export const useRestaurantData = (restaurant: Restaurant, enabled: boolean = false) => {
  const [enrichedData, setEnrichedData] = useState<EnrichedData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    yelp: 'loading',
    openTable: 'loading',
    menu: 'loading'
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
        setApiStatus({ yelp: 'loading', openTable: 'loading', menu: 'loading' });
        
        // Add a random delay to stagger requests and avoid rate limiting
        const randomDelay = Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, randomDelay));

        // Try to fetch from cache first
        const cacheKey = `restaurant_${restaurant.id}`;
        const cachedData = localStorage.getItem(cacheKey);
        const cachedTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
        const cacheAge = cachedTimestamp ? Date.now() - parseInt(cachedTimestamp) : Infinity;
        
        // Use cache if less than 1 hour old
        if (cachedData && cacheAge < 3600000) {
          const parsed = JSON.parse(cachedData);
          setEnrichedData(parsed);
          setApiStatus({ yelp: 'success', openTable: 'success', menu: 'success' });
          setLoading(false);
          return;
        }

        // Fetch Yelp data with fallback
        const yelpPromise = supabase.functions.invoke('yelp-restaurant', {
          body: {
            name: restaurant.name,
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
          }
        }).then(res => {
          if (res.error?.message?.includes('429') || res.error?.message?.includes('rate limit')) {
            setApiStatus(prev => ({ ...prev, yelp: 'rate_limited' }));
            return { data: null, status: 'rate_limited' };
          }
          setApiStatus(prev => ({ ...prev, yelp: res.data ? 'success' : 'failed' }));
          return { data: res.data, status: res.data ? 'success' : 'failed' };
        }).catch(() => {
          setApiStatus(prev => ({ ...prev, yelp: 'failed' }));
          return { data: null, status: 'failed' };
        });

        // Fetch OpenTable data with fallback
        const openTablePromise = supabase.functions.invoke('opentable-reservation', {
          body: {
            name: restaurant.name,
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
          }
        }).then(res => {
          if (res.error?.message?.includes('429') || res.error?.message?.includes('rate limit')) {
            setApiStatus(prev => ({ ...prev, openTable: 'rate_limited' }));
            return { data: null, status: 'rate_limited' };
          }
          setApiStatus(prev => ({ ...prev, openTable: res.data ? 'success' : 'failed' }));
          return { data: res.data, status: res.data ? 'success' : 'failed' };
        }).catch(() => {
          setApiStatus(prev => ({ ...prev, openTable: 'failed' }));
          return { data: null, status: 'failed' };
        });

        // Fetch menu data with fallback (MealMe primary, SerpAPI secondary)
        const mealmePromise = supabase.functions.invoke('mealme-menu', {
          body: {
            restaurantName: restaurant.name,
            address: restaurant.address,
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
          }
        }).catch(() => ({ data: null }));

        const serpapiPromise = supabase.functions.invoke('serpapi-menu', {
          body: {
            restaurantName: restaurant.name,
            address: restaurant.address,
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
          }
        }).catch(() => ({ data: null }));

        const [yelpResult, openTableResult, mealmeResponse, serpapiResponse] = await Promise.all([
          yelpPromise, 
          openTablePromise, 
          mealmePromise, 
          serpapiPromise
        ]);

        // Prioritize MealMe for menu data, fallback to SerpAPI
        const menuData = mealmeResponse.data?.available 
          ? mealmeResponse.data 
          : serpapiResponse.data;

        if (menuData?.available) {
          setApiStatus(prev => ({ ...prev, menu: 'success' }));
        } else {
          setApiStatus(prev => ({ ...prev, menu: 'failed' }));
        }

        const finalData = {
          yelpData: yelpResult.data,
          openTableData: openTableResult.data,
          serpapiData: menuData,
        };

        setEnrichedData(finalData);

        // Cache successful data
        localStorage.setItem(cacheKey, JSON.stringify(finalData));
        localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());

      } catch (err: any) {
        console.error('Error fetching enriched data:', err);
        setError(err.message);
        
        // Try to use cached data as ultimate fallback
        const cacheKey = `restaurant_${restaurant.id}`;
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          setEnrichedData(JSON.parse(cachedData));
          setApiStatus({ yelp: 'failed', openTable: 'failed', menu: 'failed' });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEnrichedData();
  }, [enabled, restaurant.id, restaurant.latitude, restaurant.longitude, restaurant.name]);

  // Merge enriched data with restaurant data
  // SerpAPI is primary source for menus, Yelp for ratings and business info
  const enrichedRestaurant: Restaurant = {
    ...restaurant,
    // Yelp data for ratings, reviews, and business info
    yelpId: enrichedData.yelpData?.yelpId,
    yelpUrl: enrichedData.yelpData?.yelpUrl,
    yelpRating: enrichedData.yelpData?.rating,
    reviewCount: enrichedData.yelpData?.reviewCount,
    reviews: enrichedData.yelpData?.reviews,
    // OpenTable for reservations
    reservationUrl: enrichedData.openTableData?.reservationUrl,
    openTableAvailable: enrichedData.openTableData?.available,
    // SerpAPI for menu data (primary source)
    menuAvailable: enrichedData.serpapiData?.available,
    menuItems: enrichedData.serpapiData?.menuItems,
    restaurantPhone: enrichedData.serpapiData?.restaurantPhone || enrichedData.yelpData?.phone,
    restaurantWebsite: enrichedData.serpapiData?.restaurantWebsite,
    // Merge photos from both Yelp and SerpAPI
    photos: [
      ...(restaurant.photos || []),
      ...(enrichedData.serpapiData?.photos || []),
    ].filter((photo, index, self) => self.indexOf(photo) === index).slice(0, 10),
  };

  return { enrichedRestaurant, loading, error, apiStatus };
};
