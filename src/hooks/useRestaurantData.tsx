import { useState, useEffect } from 'react';
import { Restaurant } from '@/types/restaurant';
import { supabase } from '@/integrations/supabase/client';

interface EnrichedData {
  yelpData?: any;
  openTableData?: any;
  serpapiData?: any;
}

export const useRestaurantData = (restaurant: Restaurant, enabled: boolean = false) => {
  const [enrichedData, setEnrichedData] = useState<EnrichedData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        
        // Add a random delay to stagger requests and avoid rate limiting
        const randomDelay = Math.random() * 1000; // 0-1 second random delay
        await new Promise(resolve => setTimeout(resolve, randomDelay));

        const promises = [];

        // Fetch Yelp data
        promises.push(
          supabase.functions.invoke('yelp-restaurant', {
            body: {
              name: restaurant.name,
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
            }
          }).catch(err => {
            console.error('Yelp error:', err);
            return { data: null };
          })
        );

        // Fetch OpenTable data
        promises.push(
          supabase.functions.invoke('opentable-reservation', {
            body: {
              name: restaurant.name,
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
            }
          }).catch(err => {
            console.error('OpenTable error:', err);
            return { data: null };
          })
        );

        // Fetch SerpAPI menu data (primary source)
        promises.push(
          supabase.functions.invoke('serpapi-menu', {
            body: {
              restaurantName: restaurant.name,
              address: restaurant.address,
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
            }
          }).catch(err => {
            console.error('SerpAPI error:', err);
            return { data: null };
          })
        );

        const [yelpResponse, openTableResponse, serpapiResponse] = await Promise.all(promises);

        setEnrichedData({
          yelpData: yelpResponse.data,
          openTableData: openTableResponse.data,
          serpapiData: serpapiResponse.data,
        });

      } catch (err: any) {
        console.error('Error fetching enriched data:', err);
        setError(err.message);
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

  return { enrichedRestaurant, loading, error };
};
