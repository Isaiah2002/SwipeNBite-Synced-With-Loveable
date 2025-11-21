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
import { AddressInput } from '@/components/AddressInput';
import { Onboarding } from '@/components/Onboarding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, RotateCcw, LogOut, User, Search, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/toaster';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Fetch and geocode delivery address
  useEffect(() => {
    const fetchAndGeocodeAddress = async () => {
      if (!user) return;
      
      setLocationLoading(true);
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('address, city, state, zip_code, favorite_cuisines')
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;

        // Set cuisine preferences
        if (profile?.favorite_cuisines) {
          setUserCuisinePreferences(profile.favorite_cuisines);
        }

        if (profile?.address && profile?.city && profile?.state && profile?.zip_code) {
          const { data: geocodeData, error: geocodeError } = await supabase.functions.invoke('nominatim-geocode', {
            body: {
              address: profile.address,
              city: profile.city,
              state: profile.state,
              zip_code: profile.zip_code
            }
          });

          if (geocodeError) throw geocodeError;

          if (geocodeData?.latitude && geocodeData?.longitude) {
            setLocation({
              latitude: geocodeData.latitude,
              longitude: geocodeData.longitude
            });
          }
        }
      } catch (error: any) {
        console.error('Error loading profile:', error);
      } finally {
        setLocationLoading(false);
      }
    };

    fetchAndGeocodeAddress();
  }, [user]);
  const [currentRestaurants, setCurrentRestaurants] = useState<Restaurant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedRestaurants, setLikedRestaurants] = useState<Restaurant[]>([]);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<Restaurant[]>([]);
  const [showLiked, setShowLiked] = useState(false);
  const [swipeAnimation, setSwipeAnimation] = useState<'left' | 'right' | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [restaurantToShare, setRestaurantToShare] = useState<Restaurant | null>(null);
  const [fetchingRestaurants, setFetchingRestaurants] = useState(false);
  const [userCuisinePreferences, setUserCuisinePreferences] = useState<string[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Load saved filters from localStorage or use defaults
  const [filters, setFilters] = useState<Filters>(() => {
    const savedFilters = localStorage.getItem('swipenbite-filters');
    if (savedFilters) {
      try {
        return JSON.parse(savedFilters);
      } catch (e) {
        console.error('Failed to parse saved filters:', e);
      }
    }
    return {
      maxPrice: '$$$',
      maxDistance: 10,
      dietary: [],
      minRating: 3.5
    };
  });

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('swipenbite-filters', JSON.stringify(filters));
  }, [filters]);

  // Check if user has completed onboarding
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('swipenbite-onboarding-completed');
    if (!hasCompletedOnboarding && user) {
      setShowOnboarding(true);
    }
  }, [user]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('swipenbite-onboarding-completed', 'true');
    setShowOnboarding(false);
    toast.success("Welcome to SwipeN'Bite! Start swiping! 🎉");
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('swipenbite-onboarding-completed', 'true');
    setShowOnboarding(false);
  };

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
        // Use 40km (Yelp's max) if no limit is set, otherwise convert miles to meters
        const radiusInMeters = filters.maxDistance 
          ? Math.round(filters.maxDistance * 1609.34)
          : 40000; // Yelp's maximum radius
        
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
    console.log(`User cuisine preferences: ${userCuisinePreferences.join(', ')}`);
    
    const filtered = currentRestaurants.filter(restaurant => {
      const restaurantPriceValue = priceValues[restaurant.price];
      const matchesPrice = restaurantPriceValue <= maxPriceValue;
      const matchesRating = restaurant.rating >= filters.minRating;
      const matchesDietary = filters.dietary.length === 0 || 
        filters.dietary.some(diet => restaurant.dietary.includes(diet));
      
      // Filter by cuisine preferences if user has set any
      const matchesCuisine = userCuisinePreferences.length === 0 || 
        userCuisinePreferences.some(pref => 
          restaurant.cuisine.toLowerCase().includes(pref.toLowerCase())
        );
      
      return matchesPrice && matchesRating && matchesDietary && matchesCuisine;
    });

    console.log(`Filtered restaurants count: ${filtered.length}`);

    setCurrentRestaurants(filtered);
    setCurrentIndex(0);
  }, [filters.maxPrice, filters.minRating, filters.dietary, userCuisinePreferences]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentRestaurant = currentRestaurants[currentIndex];
    if (!currentRestaurant) return;

    setSwipeAnimation(direction);

    // Log swipe event for analytics
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('swipe_events').insert({
          user_id: user.id,
          restaurant_id: currentRestaurant.id,
          restaurant_name: currentRestaurant.name,
          swipe_direction: direction,
          cuisine: currentRestaurant.cuisine,
          price: currentRestaurant.price,
          rating: currentRestaurant.rating,
          distance: currentRestaurant.distance
        });
      }
    } catch (error: any) {
      console.error('Error logging swipe event:', error);
    }

    if (direction === 'right') {
      setLikedRestaurants(prev => [...prev, currentRestaurant]);
      
      // Save to liked_restaurants
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

  const handleAddressUpdate = async () => {
    if (!user) return;
    
    setLocationLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('address, city, state, zip_code')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      if (profile?.address && profile?.city && profile?.state && profile?.zip_code) {
        const { data: geocodeData, error: geocodeError } = await supabase.functions.invoke('nominatim-geocode', {
          body: {
            address: profile.address,
            city: profile.city,
            state: profile.state,
            zip_code: profile.zip_code
          }
        });

        if (geocodeError) throw geocodeError;

        if (geocodeData?.latitude && geocodeData?.longitude) {
          setLocation({
            latitude: geocodeData.latitude,
            longitude: geocodeData.longitude
          });
          toast.success('Location updated based on delivery address!');
        }
      }
    } catch (error: any) {
      console.error('Error geocoding address:', error);
      toast.error('Failed to update location from address');
    } finally {
      setLocationLoading(false);
    }
  };

  const currentRestaurant = currentRestaurants[currentIndex];
  const hasMoreCards = currentIndex < currentRestaurants.length;
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard shortcuts when not in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Don't handle if onboarding is showing
      if (showOnboarding || showLiked) {
        return;
      }

      // Don't handle if no cards available
      if (!hasMoreCards || !currentRestaurant) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handleSwipe('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSwipe('right');
          break;
        case 'Enter':
          e.preventDefault();
          setDetailsOpen(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRestaurant, hasMoreCards, showOnboarding, showLiked]);

  // Show loading state while checking auth or fetching restaurants
  if (loading || fetchingRestaurants) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">
            {fetchingRestaurants ? 'Finding restaurants near you...' : 'Loading SwipeN\'Bite...'}
          </p>
        </div>
      </div>
    );
  }

  // Show keyboard shortcuts hint on first visit
  useEffect(() => {
    const hasSeenKeyboardHint = localStorage.getItem('swipenbite-keyboard-hint');
    if (!hasSeenKeyboardHint && user && !showOnboarding) {
      setTimeout(() => {
        toast('Keyboard shortcuts: ← Pass, → Like, Enter for details', {
          duration: 5000,
        });
        localStorage.setItem('swipenbite-keyboard-hint', 'true');
      }, 2000);
    }
  }, [user, showOnboarding]);

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
    <>
      <Toaster />
      {/* Screen reader live region for swipe feedback */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {swipeAnimation && (
          swipeAnimation === 'right' 
            ? `Added ${currentRestaurant?.name} to favorites` 
            : `Passed on ${currentRestaurant?.name}`
        )}
      </div>
      {showOnboarding && (
        <Onboarding 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
      
      <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="p-4 pb-2 pt-2">
        <div className="max-w-md mx-auto space-y-3">
          <FilterBar filters={filters} onFiltersChange={setFilters} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pt-2" role="main" aria-label="Restaurant discovery">
        <div className="max-w-md mx-auto space-y-4">
          
          {/* Cards Stack */}
          <div className="relative h-[660px] flex items-center justify-center">
            {!hasMoreCards ? (
              // No more cards
              <div className="text-center space-y-6" role="status" aria-live="polite">
                <div className="text-8xl" aria-hidden="true">🎉</div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-card-foreground">
                    You've seen all restaurants!
                  </h2>
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
                    aria-label="Reset and start swiping again"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" aria-hidden="true" />
                    Start Over
                  </Button>
                  {likedRestaurants.length > 0 && (
                    <Button 
                      onClick={() => setShowLiked(true)}
                      variant="outline"
                      className="w-full"
                      aria-label={`View your ${likedRestaurants.length} matched restaurants`}
                    >
                      <Heart className="w-4 h-4 mr-2 text-accent fill-current" aria-hidden="true" />
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
                    hasLocation={!!location}
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
                  hasLocation={!!location}
                  detailsOpen={detailsOpen}
                  onDetailsOpenChange={setDetailsOpen}
                />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Stats */}
          {hasMoreCards && (
            <div className="flex justify-between items-center text-sm text-muted-foreground bg-card p-4 rounded-2xl border border-border/50" role="status" aria-label="Swiping progress">
              <div className="text-center">
                <div className="font-bold text-card-foreground text-base" aria-label={`Restaurant ${currentIndex + 1} of ${currentRestaurants.length}`}>
                  {currentIndex + 1}
                </div>
                <div>of {currentRestaurants.length}</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-card-foreground text-base" aria-label={`${likedRestaurants.length} matched restaurants`}>
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
      </main>
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
    </>
  );
};

export default Index;