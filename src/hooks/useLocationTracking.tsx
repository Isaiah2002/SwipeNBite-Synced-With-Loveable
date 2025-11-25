import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
  permissionGranted: boolean;
}

export const useLocationTracking = (enableProximityAlerts: boolean = false) => {
  const { user } = useAuth();
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    loading: false,
    error: null,
    permissionGranted: false,
  });

  const checkProximity = useCallback(async (lat: number, lon: number) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('check-proximity', {
        body: { latitude: lat, longitude: lon }
      });

      if (error) throw error;

      if (data.nearbyFavorites > 0 || data.nearbyNewPlaces > 0) {
        console.log(`Geofencing check: ${data.nearbyFavorites} favorites, ${data.nearbyNewPlaces} new places nearby`);
      }
    } catch (error) {
      console.error('Error checking proximity:', error);
    }
  }, [user]);

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
      }));
      return;
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }));

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;
      
      setLocation({
        latitude,
        longitude,
        loading: false,
        error: null,
        permissionGranted: true,
      });

      // Check proximity if enabled
      if (enableProximityAlerts) {
        await checkProximity(latitude, longitude);
      }
    } catch (error: any) {
      let errorMessage = 'Unable to get your location';
      
      if (error.code === 1) {
        errorMessage = 'Location permission denied';
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out';
      }

      setLocation({
        latitude: null,
        longitude: null,
        loading: false,
        error: errorMessage,
        permissionGranted: false,
      });
    }
  }, [enableProximityAlerts, checkProximity]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          latitude,
          longitude,
          loading: false,
          error: null,
          permissionGranted: true,
        });

        if (enableProximityAlerts) {
          checkProximity(latitude, longitude);
        }
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [enableProximityAlerts, checkProximity]);

  return {
    location,
    requestLocation,
    startTracking,
  };
};
