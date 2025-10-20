import { Restaurant } from '@/types/restaurant';
import { Heart, MapPin, Star, X, ExternalLink, Calendar, Info, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RestaurantDetails } from '@/components/RestaurantDetails';
import { useRestaurantData } from '@/hooks/useRestaurantData';
import { useState } from 'react';

interface LikedRestaurantsProps {
  likedRestaurants: Restaurant[];
  onClose: () => void;
  showCloseButton?: boolean;
  onRemove?: (restaurantId: string) => void;
}

const RestaurantCard = ({ restaurant, onRemove }: { restaurant: Restaurant; onRemove?: (restaurantId: string) => void }) => {
  const { enrichedRestaurant, loading } = useRestaurantData(restaurant);
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div className="swipe-card p-4 flex items-start space-x-4 hover:shadow-md relative">
      <img 
        src={restaurant.image}
        alt={restaurant.name}
        className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
      />
      
      <div className="flex-1 space-y-2 min-w-0">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-card-foreground truncate">{restaurant.name}</h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="price-badge text-xs">{restaurant.price}</span>
              {onRemove && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onRemove(restaurant.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
        </div>
        
        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span>{restaurant.rating}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="w-3 h-3" />
            <span>{restaurant.distance} mi</span>
          </div>
          {enrichedRestaurant.yelpRating && (
            <div className="flex items-center space-x-1">
              <span className="text-red-500">Yelp:</span>
              <span>{enrichedRestaurant.yelpRating}</span>
            </div>
          )}
        </div>

        {restaurant.deals && (
          <div className="text-xs font-medium text-secondary">
            🎯 {restaurant.deals}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Info className="w-3 h-3 mr-1" />
                Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">{restaurant.name}</DialogTitle>
              </DialogHeader>
              {loading ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading details...</p>
                </div>
              ) : (
                <RestaurantDetails restaurant={enrichedRestaurant} />
              )}
            </DialogContent>
          </Dialog>

          {enrichedRestaurant.mapsUrl && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open(enrichedRestaurant.mapsUrl, '_blank')}
            >
              <MapPin className="w-3 h-3 mr-1" />
              Navigate
            </Button>
          )}

          {enrichedRestaurant.reservationUrl && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open(enrichedRestaurant.reservationUrl, '_blank')}
            >
              <Calendar className="w-3 h-3 mr-1" />
              Reserve
            </Button>
          )}

          <Button 
            size="sm" 
            className="gradient-primary text-primary-foreground border-0"
            onClick={() => window.location.href = `/restaurant/${restaurant.id}`}
          >
            Order Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export const LikedRestaurants = ({ likedRestaurants, onClose, showCloseButton = true, onRemove }: LikedRestaurantsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-accent fill-current" />
          <h2 className="text-xl font-bold text-card-foreground">Your Matches</h2>
        </div>
        {showCloseButton && (
          <Button variant="outline" onClick={onClose} size="sm">
            <X className="w-4 h-4 mr-2" />
            Back to Swiping
          </Button>
        )}
      </div>

      {likedRestaurants.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <div className="text-6xl">🍽️</div>
          <h3 className="text-lg font-medium text-muted-foreground">No matches yet!</h3>
          <p className="text-sm text-muted-foreground">Start swiping to find your perfect meal</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {likedRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  );
};