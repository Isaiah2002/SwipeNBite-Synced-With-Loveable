import { Restaurant } from '@/types/restaurant';
import { Star, MapPin, Clock, ExternalLink, Phone, Calendar, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { OpenStreetMapEmbed } from '@/components/OpenStreetMapEmbed';
import { useState } from 'react';
import { useLocation } from '@/hooks/useLocation';

interface RestaurantDetailsProps {
  restaurant: Restaurant;
}

export const RestaurantDetails = ({ restaurant }: RestaurantDetailsProps) => {
  const [showDirections, setShowDirections] = useState(false);
  const { location: userLocation } = useLocation();

  const handleMapsClick = () => {
    if (restaurant.mapsUrl) {
      window.open(restaurant.mapsUrl, '_blank');
    } else if (restaurant.latitude && restaurant.longitude) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`, '_blank');
    }
  };

  const handleDirectionsClick = () => {
    setShowDirections(!showDirections);
  };

  const handleReservationClick = () => {
    if (restaurant.reservationUrl) {
      window.open(restaurant.reservationUrl, '_blank');
    }
  };

  const handleYelpClick = () => {
    if (restaurant.yelpUrl) {
      window.open(restaurant.yelpUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Photos Gallery */}
      {restaurant.photos && restaurant.photos.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-card-foreground">Photos</h3>
          <div className="grid grid-cols-3 gap-2">
            {restaurant.photos.slice(0, 6).map((photo, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden">
                <img 
                  src={photo} 
                  alt={`${restaurant.name} photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ratings */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Ratings</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="font-medium">App Rating</span>
            </div>
            <span className="font-bold text-lg">{restaurant.rating}</span>
          </div>

          {restaurant.googleRating && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Google</span>
                </div>
                <span className="font-bold text-lg">{restaurant.googleRating}</span>
              </div>
            </>
          )}

          {restaurant.yelpRating && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-red-500 fill-current" />
                  <span className="font-medium">Yelp</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{restaurant.yelpRating}</div>
                  {restaurant.reviewCount && (
                    <div className="text-xs text-muted-foreground">{restaurant.reviewCount} reviews</div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Location & Map */}
      {restaurant.latitude && restaurant.longitude && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-card-foreground">Location</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDirectionsClick}
            >
              <Navigation className="w-4 h-4 mr-2" />
              {showDirections ? 'Hide' : 'Show'} Directions
            </Button>
          </div>

          {restaurant.address && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{restaurant.address}</span>
            </div>
          )}

          <OpenStreetMapEmbed
            latitude={restaurant.latitude}
            longitude={restaurant.longitude}
            name={restaurant.name}
            showDirections={showDirections}
            userLocation={userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : undefined}
          />

          {restaurant.openingHours && restaurant.openingHours.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Hours</h4>
                  {restaurant.isOpen !== undefined && (
                    <span className={`text-sm font-medium ${restaurant.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                      {restaurant.isOpen ? 'Open Now' : 'Closed'}
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  {restaurant.openingHours.map((hours, index) => (
                    <div key={index} className="text-muted-foreground">{hours}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {restaurant.phoneNumber && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <a href={`tel:${restaurant.phoneNumber}`} className="text-primary hover:underline">
                    {restaurant.phoneNumber}
                  </a>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Reviews */}
      {restaurant.reviews && restaurant.reviews.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-card-foreground">Recent Reviews</h3>
            {restaurant.yelpUrl && (
              <Button variant="ghost" size="sm" onClick={handleYelpClick}>
                View all <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
          
          {restaurant.reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{review.user[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{review.user}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{review.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">{review.text}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(review.timeCreated).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-card-foreground">Quick Actions</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleDirectionsClick}
            disabled={!restaurant.latitude || !restaurant.longitude}
          >
            <Navigation className="w-4 h-4 mr-2" />
            {showDirections ? 'Hide' : 'Show'} Directions
          </Button>

          {restaurant.reservationUrl && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleReservationClick}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Reserve
            </Button>
          )}

          {restaurant.yelpUrl && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleYelpClick}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Yelp
            </Button>
          )}
        </div>
      </div>

      {/* Info */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="font-medium">Estimated Delivery</div>
              <div className="text-sm text-muted-foreground">{restaurant.estimatedTime} min</div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="font-medium">Distance</div>
              <div className="text-sm text-muted-foreground">{restaurant.distance} mi away</div>
            </div>
          </div>

          {restaurant.deals && (
            <>
              <Separator />
              <div className="bg-secondary/20 p-3 rounded-lg">
                <div className="font-medium text-secondary-foreground">🎉 {restaurant.deals}</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
