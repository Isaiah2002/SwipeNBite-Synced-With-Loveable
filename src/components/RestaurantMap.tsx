import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configure default Leaflet marker icons
// (Leaflet's defaults rely on asset paths that don't work well with bundlers)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface RestaurantMapProps {
  latitude: number;
  longitude: number;
  name: string;
  address?: string;
}

export const RestaurantMap = ({ latitude, longitude, name, address }: RestaurantMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map only once
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([latitude, longitude], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const marker = L.marker([latitude, longitude]).addTo(map);
      const popupContent = `
        <div style="font-size: 0.875rem;">
          <div style="font-weight: 600;">${name}</div>
          ${address ? `<div style="margin-top: 0.25rem; color: #6b7280; font-size: 0.75rem;">${address}</div>` : ''}
        </div>
      `;
      marker.bindPopup(popupContent);

      mapInstanceRef.current = map;
    } else {
      // If props change, update view/marker position
      mapInstanceRef.current.setView([latitude, longitude], 15);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, name, address]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-[300px] rounded-lg overflow-hidden border border-border bg-muted"
    />
  );
};

