import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Loader2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface OpenStreetMapEmbedProps {
  latitude: number;
  longitude: number;
  name: string;
  showDirections?: boolean;
  userLocation?: { lat: number; lng: number };
}

interface RouteData {
  distance: string;
  duration: string;
  coordinates: [number, number][];
}

export const OpenStreetMapEmbed = ({ 
  latitude, 
  longitude, 
  name,
  showDirections = false,
  userLocation,
}: OpenStreetMapEmbedProps) => {
  const [route, setRoute] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (showDirections && userLocation) {
      setIsLoading(true);
      setError(null);

      // Use OSRM (Open Source Routing Machine) for directions
      const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${longitude},${latitude}?overview=full&geometries=geojson`;

      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            const routeData = data.routes[0];
            const coordinates = routeData.geometry.coordinates.map((coord: [number, number]) => 
              [coord[1], coord[0]] as [number, number]
            );
            
            setRoute({
              distance: `${(routeData.distance / 1609.34).toFixed(1)} mi`,
              duration: `${Math.round(routeData.duration / 60)} min`,
              coordinates,
            });
          } else {
            setError('Unable to get directions');
          }
        })
        .catch(() => {
          setError('Unable to get directions');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setRoute(null);
    }
  }, [showDirections, userLocation, latitude, longitude]);

  const center: [number, number] = [latitude, longitude];
  const bounds = route && userLocation 
    ? L.latLngBounds([
        [userLocation.lat, userLocation.lng],
        [latitude, longitude],
      ])
    : undefined;

  return (
    <div className="relative">
      <div className="h-[400px] w-full rounded-lg overflow-hidden border border-border">
        <MapContainer
          center={center}
          zoom={showDirections && route ? undefined : 15}
          bounds={bounds}
          boundsOptions={{ padding: [50, 50] }}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {!showDirections && (
            <Marker position={center}>
              <Popup>{name}</Popup>
            </Marker>
          )}

          {showDirections && userLocation && (
            <>
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>Your Location</Popup>
              </Marker>
              <Marker position={center}>
                <Popup>{name}</Popup>
              </Marker>
            </>
          )}

          {route && (
            <Polyline 
              positions={route.coordinates} 
              pathOptions={{ 
                color: 'hsl(var(--primary))', 
                weight: 5,
                opacity: 0.7,
              }} 
            />
          )}
        </MapContainer>
      </div>

      {isLoading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-background/90 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 border border-border">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm">Getting directions...</span>
        </div>
      )}

      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}

      {showDirections && route && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Route Summary</h4>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Distance:</span> {route.distance}</p>
            <p><span className="font-medium">Duration:</span> {route.duration}</p>
          </div>
        </div>
      )}
    </div>
  );
};
