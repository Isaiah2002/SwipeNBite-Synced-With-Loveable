import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import {
  getUnsyncedOrders,
  markOrderSynced,
  cacheRestaurants,
  getCachedRestaurants,
  cacheOrder,
  getCachedOrders,
  cacheLikedRestaurant,
  getCachedLikedRestaurants
} from '@/lib/offlineDB';

export const useOfflineSync = () => {
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online/offline status and sync on mount
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing data...');
      syncData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.info('You\'re offline. Changes will sync when you reconnect.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Sync data on mount if user is logged in and online
    if (user && isOnline) {
      syncData();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  // Sync data when coming back online
  const syncData = async () => {
    if (!user || !isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      // Sync unsynced orders
      const unsyncedOrders = await getUnsyncedOrders();
      for (const order of unsyncedOrders) {
        try {
          const { error } = await supabase
            .from('orders')
            .insert(order);
          
          if (!error) {
            await markOrderSynced(order.id);
          }
        } catch (error) {
          console.error('Error syncing order:', error);
        }
      }

      // Fetch and cache latest data from server
      await Promise.all([
        syncRestaurants(),
        syncOrders(),
        syncLikedRestaurants(),
        syncProfile()
      ]);

      if (unsyncedOrders.length > 0) {
        toast.success('Data synced successfully!');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync some data');
    } finally {
      setIsSyncing(false);
    }
  };

  const syncRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .limit(100);

      if (!error && data) {
        await cacheRestaurants(data);
      }
    } catch (error) {
      console.error('Error syncing restaurants:', error);
    }
  };

  const syncOrders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        for (const order of data) {
          await cacheOrder(order, true);
        }
      }
    } catch (error) {
      console.error('Error syncing orders:', error);
    }
  };

  const syncLikedRestaurants = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('liked_restaurants')
        .select('*')
        .eq('user_id', user.id);

      if (!error && data) {
        for (const restaurant of data) {
          await cacheLikedRestaurant(restaurant);
        }
      }
    } catch (error) {
      console.error('Error syncing liked restaurants:', error);
    }
  };

  const syncProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        // Cache profile data in localStorage for quick access
        localStorage.setItem('cached_profile', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error syncing profile:', error);
    }
  };

  // Get data with offline fallback
  const getRestaurants = async () => {
    if (isOnline) {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .limit(100);

      if (!error && data) {
        await cacheRestaurants(data);
        return data;
      }
    }
    
    return getCachedRestaurants();
  };

  const getOrders = async () => {
    if (isOnline && user) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        for (const order of data) {
          await cacheOrder(order, true);
        }
        return data;
      }
    }
    
    return getCachedOrders();
  };

  const getLikedRestaurants = async () => {
    if (isOnline && user) {
      const { data, error } = await supabase
        .from('liked_restaurants')
        .select('*')
        .eq('user_id', user.id);

      if (!error && data) {
        for (const restaurant of data) {
          await cacheLikedRestaurant(restaurant);
        }
        return data;
      }
    }
    
    return getCachedLikedRestaurants();
  };

  const getProfile = () => {
    const cached = localStorage.getItem('cached_profile');
    return cached ? JSON.parse(cached) : null;
  };

  return {
    isOnline,
    isSyncing,
    syncData,
    getRestaurants,
    getOrders,
    getLikedRestaurants,
    getProfile
  };
};
