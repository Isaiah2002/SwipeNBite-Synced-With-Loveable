import { Restaurant } from '@/types/restaurant';
import { Heart, MapPin, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LikedRestaurantsProps {
  likedRestaurants: Restaurant[];
  onClose: () => void;
  showCloseButton?: boolean;
}

export const LikedRestaurants = ({ likedRestaurants, onClose, showCloseButton = true }: LikedRestaurantsProps) => {
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
            <div
              key={restaurant.id}
              className="swipe-card p-4 flex items-center space-x-4 hover:shadow-md"
            >
              <img 
                src={restaurant.image}
                alt={restaurant.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-card-foreground">{restaurant.name}</h3>
                  <span className="price-badge text-xs">{restaurant.price}</span>
                </div>
                
                <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
                
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span>{restaurant.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{restaurant.distance} mi</span>
                  </div>
                </div>

                {restaurant.deals && (
                  <div className="text-xs font-medium text-secondary">
                    🎯 {restaurant.deals}
                  </div>
                )}
              </div>
              
              <Button size="sm" className="gradient-primary text-primary-foreground border-0">
                Order Now
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};