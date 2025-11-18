import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Popup, useMap, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant } from '@/types/restaurant';
import { useLocation } from '@/hooks/useLocation';
import { Star, MapPin, Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom marker icon with restaurant theme
const createRestaurantIcon = (isOpen?: boolean) => {
  const color = isOpen === false ? '#ef4444' : '#10b981';
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// Component to handle map centering
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
};

const MapView = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const { location: userLocation } = useLocation();
  const navigate = useNavigate();

  const defaultCenter: [number, number] = userLocation 
    ? [userLocation.latitude, userLocation.longitude]
    : [38.9072, -77.0369]; // DC default

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (error) throw error;
        
        // Map database snake_case to Restaurant camelCase
        const mappedRestaurants: Restaurant[] = (data || []).map((item) => ({
          id: item.id,
          name: item.name,
          cuisine: item.cuisine,
          price: item.price as '$' | '$$' | '$$$',
          rating: item.rating,
          distance: item.distance,
          image: item.image,
          description: item.description,
          dietary: item.dietary,
          deals: item.deals || undefined,
          estimatedTime: item.estimated_time,
          latitude: item.latitude || undefined,
          longitude: item.longitude || undefined,
          googleRating: item.google_rating || undefined,
          yelpRating: item.yelp_rating || undefined,
          address: item.maps_url || undefined,
        }));
        
        setRestaurants(mappedRestaurants);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleRestaurantClick = (restaurantId: string) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="bg-card border-b border-border/50 p-4 sticky top-0 z-[1000] backdrop-blur-lg">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Restaurant Map</h1>
            <p className="text-sm text-muted-foreground">{restaurants.length} locations</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
          >
            Back to Swipe
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-[calc(100vh-140px)]">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapUpdater center={defaultCenter} />

          {restaurants.map((restaurant) => {
            if (!restaurant.latitude || !restaurant.longitude) return null;
            
            return (
              <Marker
                key={restaurant.id}
                position={[restaurant.latitude, restaurant.longitude]}
                icon={createRestaurantIcon(restaurant.isOpen)}
              >
                <Popup maxWidth={280} minWidth={280}>
                  <Card className="border-0 shadow-none">
                    <div className="space-y-3 p-2">
                      {/* Restaurant Image */}
                      <div className="relative h-32 rounded-lg overflow-hidden">
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs font-bold">{restaurant.rating}</span>
                        </div>
                      </div>

                      {/* Restaurant Info */}
                      <div>
                        <h3 className="font-bold text-base mb-1">{restaurant.name}</h3>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {restaurant.description}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <span className="font-semibold text-secondary">{restaurant.price}</span>
                          <span>•</span>
                          <span>{restaurant.cuisine}</span>
                          <span>•</span>
                          <span>{restaurant.estimatedTime} min</span>
                        </div>

                        {restaurant.distance && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground mb-3">
                            <MapPin className="w-3 h-3" />
                            <span>{restaurant.distance} mi away</span>
                          </div>
                        )}

                        <Button
                          className="w-full"
                          size="sm"
                          onClick={() => handleRestaurantClick(restaurant.id)}
                        >
                          <Navigation className="w-3 h-3 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Popup>
              </Marker>
            );
          })}

          {userLocation && (
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={L.divIcon({
                html: `<div style="background: hsl(var(--accent)); width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 4px hsl(var(--accent) / 0.3);"></div>`,
                className: 'user-location-marker',
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              })}
            >
              <Popup>
                <div className="text-center font-medium text-sm">Your Location</div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <BottomNav />
    </div>
  );
};

export default MapView;
