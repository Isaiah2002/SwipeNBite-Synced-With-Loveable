import { useEffect, useRef, memo } from 'react';

interface RestaurantMapProps {
  latitude: number;
  longitude: number;
  name: string;
  address?: string;
}

export const RestaurantMap = memo(({ latitude, longitude, name, address }: RestaurantMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initMap = () => {
      if (!window.google) {
        console.error('Google Maps API not loaded');
        return;
      }

      const position = { lat: latitude, lng: longitude };

      // Initialize map only once
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapContainerRef.current!, {
          center: position,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        // Create marker
        markerRef.current = new google.maps.Marker({
          position: position,
          map: mapInstanceRef.current,
          title: name,
        });

        // Create info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="font-size: 0.875rem; padding: 0.25rem;">
              <div style="font-weight: 600; margin-bottom: 0.25rem;">${name}</div>
              ${address ? `<div style="color: #6b7280; font-size: 0.75rem;">${address}</div>` : ''}
            </div>
          `,
        });

        markerRef.current.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current!, markerRef.current!);
        });
      } else {
        // Update position if props change
        mapInstanceRef.current.setCenter(position);
        if (markerRef.current) {
          markerRef.current.setPosition(position);
        }
      }
    };

    // Load Google Maps script if not already loaded
    if (!window.google) {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
        console.error('Google Maps API key not configured');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [latitude, longitude, name, address]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-[300px] rounded-lg overflow-hidden border border-border bg-muted"
    />
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.latitude === nextProps.latitude &&
    prevProps.longitude === nextProps.longitude &&
    prevProps.name === nextProps.name
  );
});
