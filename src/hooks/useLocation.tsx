import { useState, useEffect } from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface LocationError {
  code: number;
  message: string;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<LocationError | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');

  const requestLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      // First try browser geolocation as fallback
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              // Use Google Geolocation API for enhanced accuracy
              const response = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  considerIp: true,
                  wifiAccessPoints: [],
                  cellTowers: []
                })
              });

              if (response.ok) {
                const data = await response.json();
                setLocation({
                  latitude: data.location.lat,
                  longitude: data.location.lng,
                  accuracy: data.accuracy || position.coords.accuracy,
                });
              } else {
                // Fallback to browser geolocation
                setLocation({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                });
              }
              setPermissionStatus('granted');
              setLoading(false);
            } catch (apiError) {
              // Fallback to browser geolocation
              setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
              });
              setPermissionStatus('granted');
              setLoading(false);
            }
          },
          async (error) => {
            // If browser geolocation fails, try Google API without coordinates
            try {
              const response = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  considerIp: true,
                })
              });

              if (response.ok) {
                const data = await response.json();
                setLocation({
                  latitude: data.location.lat,
                  longitude: data.location.lng,
                  accuracy: data.accuracy || 1000,
                });
                setPermissionStatus('granted');
                setLoading(false);
                return;
              }
            } catch (apiError) {
              // Both methods failed
            }

            let message = 'Unable to get your location.';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                message = 'Location access denied. Please enable location services.';
                setPermissionStatus('denied');
                break;
              case error.POSITION_UNAVAILABLE:
                message = 'Location information is unavailable.';
                break;
              case error.TIMEOUT:
                message = 'Location request timed out.';
                break;
            }
            setError({ code: error.code, message });
            setLoading(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        );
      } else {
        // No geolocation support, try Google API with IP-based location
        const response = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            considerIp: true,
          })
        });

        if (response.ok) {
          const data = await response.json();
          setLocation({
            latitude: data.location.lat,
            longitude: data.location.lng,
            accuracy: data.accuracy || 1000,
          });
          setPermissionStatus('granted');
        } else {
          setError({ code: 0, message: 'Location services are not available.' });
        }
        setLoading(false);
      }
    } catch (error) {
      setError({ code: 0, message: 'Failed to get location. Please try again.' });
      setLoading(false);
    }
  };

  // Check permission status on mount
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionStatus(result.state as 'granted' | 'denied' | 'prompt');
      });
    }
  }, []);

  return {
    location,
    error,
    loading,
    permissionStatus,
    requestLocation,
  };
};