import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { Restaurant, Filters } from '@/types/restaurant';
import { restaurants } from '@/data/restaurants';
import { calculateDistance } from '@/utils/distance';
import { SwipeCard } from '@/components/SwipeCard';
import { FilterBar } from '@/components/FilterBar';
import { LikedRestaurants } from '@/components/LikedRestaurants';
import { LocationPrompt } from '@/components/LocationPrompt';
import { ShareDialog } from '@/components/ShareDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, RotateCcw, LogOut, User, Search, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { location, error: locationError, loading: locationLoading, permissionStatus, requestLocation } = useLocation();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  const [currentRestaurants, setCurrentRestaurants] = useState<Restaurant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedRestaurants, setLikedRestaurants] = useState<Restaurant[]>([]);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<Restaurant[]>([]);
  const [showLiked, setShowLiked] = useState(false);
  const [swipeAnimation, setSwipeAnimation] = useState<'left' | 'right' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [restaurantToShare, setRestaurantToShare] = useState<Restaurant | null>(null);
  const [fetchingRestaurants, setFetchingRestaurants] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    maxPrice: '$$$',
    maxDistance: 25,
    dietary: [],
    minRating: 3.5
  });

  // Fetch restaurants from Yelp when location is available
  useEffect(() => {
    const fetchNearbyRestaurants = async () => {
      if (!location) {
        // Use static data when no location
        setCurrentRestaurants(restaurants);
        return;
      }

      setFetchingRestaurants(true);
      try {
        const radiusInMeters = Math.round(filters.maxDistance * 1609.34); // Convert miles to meters
        
        const { data, error } = await supabase.functions.invoke('nearby-restaurants', {
          body: {
            latitude: location.latitude,
            longitude: location.longitude,
            radius: radiusInMeters,
            limit: 50
          }
        });

        if (error) {
          console.error('Error fetching restaurants:', error);
          toast.error('Failed to fetch nearby restaurants. Using default list.');
          setCurrentRestaurants(restaurants);
        } else if (data?.restaurants) {
          console.log(`Fetched ${data.restaurants.length} restaurants from Yelp`);
          setCurrentRestaurants(data.restaurants);
        } else {
          console.log('No restaurants found nearby, using default list');
          setCurrentRestaurants(restaurants);
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        toast.error('Failed to fetch nearby restaurants. Using default list.');
        setCurrentRestaurants(restaurants);
      } finally {
        setFetchingRestaurants(false);
      }
    };

    fetchNearbyRestaurants();
  }, [location, filters.maxDistance]);

  // Filter restaurants based on current filters and search
  useEffect(() => {
    if (currentRestaurants.length === 0) return;

    const priceValues: { [key: string]: number } = { '$': 1, '$$': 2, '$$$': 3 };
    const maxPriceValue = priceValues[filters.maxPrice];

    console.log(`User location: ${location?.latitude}, ${location?.longitude}`);
    console.log(`Current filters - maxDistance: ${filters.maxDistance}, minRating: ${filters.minRating}, maxPrice: ${filters.maxPrice}`);
    
    const filtered = currentRestaurants.filter(restaurant => {
      const restaurantPriceValue = priceValues[restaurant.price];
      const matchesPrice = restaurantPriceValue <= maxPriceValue;
      const matchesRating = restaurant.rating >= filters.minRating;
      const matchesDietary = filters.dietary.length === 0 || 
        filters.dietary.some(diet => restaurant.dietary.includes(diet));
      const matchesSearch = searchTerm === '' || 
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesPrice && matchesRating && matchesDietary && matchesSearch;
    });

    console.log(`Filtered restaurants count: ${filtered.length}`);

    setCurrentRestaurants(filtered);
    setCurrentIndex(0);
  }, [filters.maxPrice, filters.minRating, filters.dietary, searchTerm]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentRestaurant = currentRestaurants[currentIndex];
    if (!currentRestaurant) return;

    setSwipeAnimation(direction);

    if (direction === 'right') {
      setLikedRestaurants(prev => [...prev, currentRestaurant]);
      
      // Save to database
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('liked_restaurants').insert({
            user_id: user.id,
            restaurant_id: currentRestaurant.id,
            restaurant_name: currentRestaurant.name,
            cuisine: currentRestaurant.cuisine,
            price: currentRestaurant.price,
            rating: currentRestaurant.rating,
            distance: currentRestaurant.distance,
            image: currentRestaurant.image,
            description: currentRestaurant.description,
            dietary: currentRestaurant.dietary,
            estimated_time: currentRestaurant.estimatedTime,
            latitude: currentRestaurant.latitude,
            longitude: currentRestaurant.longitude,
            deals: currentRestaurant.deals
          });
        }
      } catch (error: any) {
        console.error('Error saving liked restaurant:', error);
      }
      
      toast.success(`Added ${currentRestaurant.name} to your matches! 💚`);
    } else {
      toast(`Passed on ${currentRestaurant.name} 👋`);
    }

    // Move to next restaurant after animation
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeAnimation(null);
    }, 600);
  };

  const handleFavorite = (restaurant: Restaurant) => {
    const isFavorited = favoriteRestaurants.some(fav => fav.id === restaurant.id);
    
    if (isFavorited) {
      setFavoriteRestaurants(prev => prev.filter(fav => fav.id !== restaurant.id));
      toast.success(`Removed ${restaurant.name} from favorites`);
    } else {
      setFavoriteRestaurants(prev => [...prev, restaurant]);
      toast.success(`Added ${restaurant.name} to favorites! ⭐`);
    }
  };

  const resetCards = () => {
    setCurrentIndex(0);
    setSwipeAnimation(null);
    toast.success('Cards reset! Start swiping again 🔄');
  };

  const handleShare = (restaurant: Restaurant) => {
    setRestaurantToShare(restaurant);
    setShareDialogOpen(true);
  };

  const handleLocationRequest = () => {
    requestLocation();
    setShowLocationPrompt(false);
  };

  const currentRestaurant = currentRestaurants[currentIndex];
  const hasMoreCards = currentIndex < currentRestaurants.length;

  // Show loading state while checking auth or fetching restaurants
  if (loading || fetchingRestaurants) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">
            {fetchingRestaurants ? 'Finding restaurants near you...' : 'Loading SwipEats...'}
          </p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  if (showLiked) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto">
          <LikedRestaurants 
            likedRestaurants={likedRestaurants}
            onClose={() => setShowLiked(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Location Prompt Modal */}
      {showLocationPrompt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            <LocationPrompt 
              onRequestLocation={handleLocationRequest}
              error={locationError?.message}
              loading={locationLoading}
            />
            <Button
              variant="ghost"
              onClick={() => setShowLocationPrompt(false)}
              className="w-full mt-2 text-muted-foreground"
            >
              Maybe later
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 pb-2">
        <div className="max-w-md mx-auto space-y-4">
          {/* User Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-card-foreground">Welcome back!</h2>
                <p className="text-sm text-muted-foreground">
                  {location 
                    ? `📍 Showing nearby restaurants • ${currentRestaurants.length} found`
                    : user.email
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
            {!location && permissionStatus !== 'denied' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLocationPrompt(true)}
                className="text-muted-foreground hover:text-foreground relative"
              >
                <MapPin className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
              </Button>
            )}
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <FilterBar filters={filters} onFiltersChange={setFilters} />
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search restaurants or cuisine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border/50"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Cards Stack */}
          <div className="relative h-[600px] flex items-center justify-center">
            {!hasMoreCards ? (
              // No more cards
              <div className="text-center space-y-6">
                <div className="text-8xl">🎉</div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-card-foreground">
                    You've seen all restaurants!
                  </h3>
                  <p className="text-muted-foreground">
                    {likedRestaurants.length > 0 
                      ? `You have ${likedRestaurants.length} matches waiting for you!`
                      : location 
                        ? 'No restaurants found within your distance filter. Try increasing the distance or adjusting other filters.'
                        : 'Try adjusting your filters to see more options'
                    }
                  </p>
                </div>
                <div className="space-y-3">
                  <Button 
                    onClick={resetCards}
                    className="gradient-primary text-primary-foreground border-0 w-full"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Start Over
                  </Button>
                  {likedRestaurants.length > 0 && (
                    <Button 
                      onClick={() => setShowLiked(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <Heart className="w-4 h-4 mr-2 text-accent fill-current" />
                      View Matches ({likedRestaurants.length})
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              // Show current card with next card behind it
              <div className="relative w-full">
                {/* Next card (behind current) */}
                {currentRestaurants[currentIndex + 1] && (
                  <div className="absolute inset-0 transform scale-95 opacity-50">
                  <SwipeCard 
                    restaurant={currentRestaurants[currentIndex + 1]}
                    onSwipe={() => {}}
                    onFavorite={handleFavorite}
                    onShare={handleShare}
                    isFavorited={favoriteRestaurants.some(fav => fav.id === currentRestaurants[currentIndex + 1]?.id)}
                    isActive={false}
                  />
                  </div>
                )}
                
                {/* Current card */}
                <div 
                  className={`relative transition-all duration-600 ease-out ${
                    swipeAnimation === 'right' ? 'animate-swipe-right' :
                    swipeAnimation === 'left' ? 'animate-swipe-left' : ''
                  }`}
                >
                <SwipeCard 
                  restaurant={currentRestaurant}
                  onSwipe={handleSwipe}
                  onFavorite={handleFavorite}
                  onShare={handleShare}
                  isFavorited={favoriteRestaurants.some(fav => fav.id === currentRestaurant.id)}
                  isActive={!swipeAnimation}
                />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Stats */}
          {hasMoreCards && (
            <div className="flex justify-between items-center text-sm text-muted-foreground bg-card p-4 rounded-2xl border border-border/50">
              <div className="text-center">
                <div className="font-bold text-card-foreground text-base">
                  {currentIndex + 1}
                </div>
                <div>of {currentRestaurants.length}</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-card-foreground text-base">
                  {likedRestaurants.length}
                </div>
                <div>matches</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLiked(true)}
                className="flex items-center space-x-2"
              >
                <Heart className="w-4 h-4 text-accent fill-current" />
                <span>Matches</span>
              </Button>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
      
      {/* Share Dialog */}
      {restaurantToShare && (
        <ShareDialog 
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          restaurant={restaurantToShare}
        />
      )}
    </div>
  );
};

export default Index;