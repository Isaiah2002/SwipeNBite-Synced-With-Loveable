import { useState, useEffect } from 'react';
import { Restaurant } from '@/types/restaurant';
import { supabase } from '@/integrations/supabase/client';

interface EnrichedData {
  googleData?: any;
  yelpData?: any;
  openTableData?: any;
}

export const useRestaurantData = (restaurant: Restaurant) => {
  const [enrichedData, setEnrichedData] = useState<EnrichedData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrichedData = async () => {
      if (!restaurant.latitude || !restaurant.longitude) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const promises = [];

        // Fetch Google Maps data
        promises.push(
          supabase.functions.invoke('google-maps-place', {
            body: {
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
              name: restaurant.name,
            }
          }).catch(err => {
            console.error('Google Maps error:', err);
            return { data: null };
          })
        );

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

        const [googleResponse, yelpResponse, openTableResponse] = await Promise.all(promises);

        setEnrichedData({
          googleData: googleResponse.data,
          yelpData: yelpResponse.data,
          openTableData: openTableResponse.data,
        });

      } catch (err: any) {
        console.error('Error fetching enriched data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrichedData();
  }, [restaurant.id, restaurant.latitude, restaurant.longitude, restaurant.name]);

  // Merge enriched data with restaurant data
  const enrichedRestaurant: Restaurant = {
    ...restaurant,
    placeId: enrichedData.googleData?.placeId,
    mapsUrl: enrichedData.googleData?.mapsUrl,
    googleRating: enrichedData.googleData?.rating,
    photos: enrichedData.googleData?.photos || [],
    yelpId: enrichedData.yelpData?.yelpId,
    yelpUrl: enrichedData.yelpData?.yelpUrl,
    yelpRating: enrichedData.yelpData?.rating,
    reviewCount: enrichedData.yelpData?.reviewCount,
    reviews: enrichedData.yelpData?.reviews,
    reservationUrl: enrichedData.openTableData?.reservationUrl,
    openTableAvailable: enrichedData.openTableData?.available,
  };

  return { enrichedRestaurant, loading, error };
};
