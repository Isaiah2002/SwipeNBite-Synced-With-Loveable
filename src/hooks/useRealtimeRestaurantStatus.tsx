import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RestaurantStatus {
  is_open_now?: boolean;
  status?: string;
  hours?: any;
  opening_hours?: string;
  estimated_wait_minutes?: number;
  current_popularity?: number;
  status_last_checked?: string;
}

export const useRealtimeRestaurantStatus = (restaurantId: string, placeId?: string) => {
  const [status, setStatus] = useState<RestaurantStatus>({});
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const refreshStatus = useCallback(async () => {
    if (!restaurantId) return;

    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-restaurant-status', {
        body: { restaurantId, placeId }
      });

      if (error) throw error;

      if (data?.restaurant) {
        setStatus({
          is_open_now: data.restaurant.is_open_now,
          status: data.restaurant.status,
          hours: data.restaurant.hours,
          opening_hours: data.restaurant.opening_hours,
          estimated_wait_minutes: data.restaurant.estimated_wait_minutes,
          current_popularity: data.restaurant.current_popularity,
          status_last_checked: data.restaurant.status_last_checked
        });
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error refreshing restaurant status:', error);
    } finally {
      setRefreshing(false);
    }
  }, [restaurantId, placeId]);

  // Subscribe to real-time updates for this restaurant
  useEffect(() => {
    if (!restaurantId) return;

    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      // Fetch initial status
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('is_open_now, status, hours, opening_hours, estimated_wait_minutes, current_popularity, status_last_checked')
        .eq('id', restaurantId)
        .single();

      if (restaurant) {
        setStatus(restaurant);
      }

      // Subscribe to real-time changes
      channel = supabase
        .channel(`restaurant-status-${restaurantId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'restaurants',
            filter: `id=eq.${restaurantId}`
          },
          (payload) => {
            const newData = payload.new as any;
            setStatus({
              is_open_now: newData.is_open_now,
              status: newData.status,
              hours: newData.hours,
              opening_hours: newData.opening_hours,
              estimated_wait_minutes: newData.estimated_wait_minutes,
              current_popularity: newData.current_popularity,
              status_last_checked: newData.status_last_checked
            });
            setLastUpdate(new Date());
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [restaurantId]);

  // Auto-refresh every 15 minutes if status is stale
  useEffect(() => {
    if (!status.status_last_checked) return;

    const checkStaleness = () => {
      const lastChecked = new Date(status.status_last_checked!);
      const minutesSinceUpdate = (Date.now() - lastChecked.getTime()) / 1000 / 60;

      // Auto-refresh if data is older than 15 minutes
      if (minutesSinceUpdate > 15) {
        refreshStatus();
      }
    };

    checkStaleness();
    const interval = setInterval(checkStaleness, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [status.status_last_checked, refreshStatus]);

  return {
    status,
    refreshStatus,
    refreshing,
    lastUpdate
  };
};