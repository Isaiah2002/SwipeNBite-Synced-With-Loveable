import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Clock, Star } from 'lucide-react';
import { Restaurant } from '@/types/restaurant';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getCachedLikedRestaurants, cacheLikedRestaurant } from '@/lib/offlineDB';

interface BecauseYouLikedProps {
  onRestaurantClick: (restaurant: Restaurant) => void;
}

export const BecauseYouLiked = ({ onRestaurantClick }: BecauseYouLikedProps) => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Array<{ restaurant: Restaurant; reason: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSuggestions = async () => {
      if (!user) return;

      try {
        // Try to load from cache first for faster rendering
        const cachedLiked = await getCachedLikedRestaurants();
        
        // Fetch fresh data from Supabase
        const { data: likedRestaurants } = await supabase
          .from('liked_restaurants')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!likedRestaurants || likedRestaurants.length === 0) {
          setLoading(false);
          return;
        }

        // Cache favorites for offline access
        for (const restaurant of likedRestaurants) {
          await cacheLikedRestaurant(restaurant);
        }

        // Get all available restaurants
        const { data: allRestaurants } = await supabase
          .from('restaurants')
          .select('*')
          .limit(100);

        if (!allRestaurants) {
          setLoading(false);
          return;
        }

        // Create similarity clusters based on favorites
        const likedIds = new Set(likedRestaurants.map(r => r.restaurant_id));
        const similarRestaurants: Array<{ restaurant: Restaurant; reason: string; score: number }> = [];

        for (const restaurant of allRestaurants) {
          // Skip if already liked
          if (likedIds.has(restaurant.id)) continue;

          let score = 0;
          let reasons: string[] = [];

          // Find matching favorites
          for (const liked of likedRestaurants) {
            // Same cuisine match
            if (restaurant.cuisine.toLowerCase() === liked.cuisine.toLowerCase()) {
              score += 5;
              if (!reasons.some(r => r.includes('cuisine'))) {
                reasons.push(liked.restaurant_name);
              }
            }
            
            // Same price range
            if (restaurant.price === liked.price) {
              score += 2;
            }
            
            // Similar rating (within 0.5 stars)
            if (Math.abs(restaurant.rating - liked.rating) <= 0.5) {
              score += 1;
            }
            
            // Similar distance (within 0.5 miles)
            if (Math.abs(restaurant.distance - liked.distance) <= 0.5) {
              score += 1;
            }
          }

          if (score > 0 && reasons.length > 0) {
            similarRestaurants.push({
              restaurant: {
                ...restaurant,
                estimatedTime: restaurant.estimated_time
              } as Restaurant,
              reason: reasons[0],
              score
            });
          }
        }

        // Sort by score and take top 5
        const topSuggestions = similarRestaurants
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map(({ restaurant, reason }) => ({
            restaurant,
            reason: `Because you liked ${reason}`
          }));

        setSuggestions(topSuggestions);
      } catch (error) {
        console.error('Error loading suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSuggestions();
  }, [user]);

  if (loading || suggestions.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Heart className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold text-foreground">Because You Liked...</h2>
      </div>
      
      <div className="space-y-3">
        {suggestions.map(({ restaurant, reason }) => (
          <Card 
            key={restaurant.id}
            className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            onClick={() => onRestaurantClick(restaurant)}
          >
            <div className="flex gap-4">
              <img 
                src={restaurant.image} 
                alt={restaurant.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              
              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="font-semibold text-card-foreground">{restaurant.name}</h3>
                  <p className="text-xs text-muted-foreground">{reason}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary" className="gap-1">
                    <Star className="w-3 h-3" />
                    {restaurant.rating}
                  </Badge>
                  <Badge variant="outline">{restaurant.cuisine}</Badge>
                  <Badge variant="outline">{restaurant.price}</Badge>
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="w-3 h-3" />
                    {restaurant.distance} mi
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="w-3 h-3" />
                    {restaurant.estimatedTime} min
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
