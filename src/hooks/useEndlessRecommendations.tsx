import { useState, useEffect, useCallback } from 'react';
import { Restaurant, Filters } from '@/types/restaurant';
import { supabase } from '@/integrations/supabase/client';
import { restaurants as staticRestaurants } from '@/data/restaurants';
import { toast } from 'sonner';

interface EndlessRecommendationsConfig {
  location: { latitude: number; longitude: number } | null;
  filters: Filters;
  currentIndex: number;
  totalRestaurants: number;
  likedRestaurantIds: Set<string>;
  recentlyPassedIds: Set<string>;
  currentRestaurants: Restaurant[];
}

export const useEndlessRecommendations = ({
  location,
  filters,
  currentIndex,
  totalRestaurants,
  likedRestaurantIds,
  recentlyPassedIds,
  currentRestaurants
}: EndlessRecommendationsConfig) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [shownRestaurantIds, setShownRestaurantIds] = useState<Set<string>>(new Set());
  const [expandedRadius, setExpandedRadius] = useState<number | null>(null);
  const [relaxedFilters, setRelaxedFilters] = useState<Filters | null>(null);

  // Track shown restaurants
  useEffect(() => {
    if (currentIndex < totalRestaurants) {
      const currentRestaurant = currentRestaurants[currentIndex];
      if (currentRestaurant) {
        setShownRestaurantIds(prev => new Set([...prev, currentRestaurant.id]));
      }
    }
  }, [currentIndex, currentRestaurants, totalRestaurants]);

  const fetchWithExpandedRadius = useCallback(async (radius: number): Promise<Restaurant[]> => {
    if (!location) return [];

    try {
      const radiusInMeters = Math.round(radius * 1609.34);
      const { data, error } = await supabase.functions.invoke('nearby-restaurants', {
        body: {
          latitude: location.latitude,
          longitude: location.longitude,
          radius: radiusInMeters,
          limit: 50
        }
      });

      if (error) throw error;
      return data?.restaurants || [];
    } catch (err) {
      console.error('Error fetching with expanded radius:', err);
      return [];
    }
  }, [location]);

  const applyRelaxedFilters = useCallback((restaurants: Restaurant[], currentFilters: Filters): Restaurant[] => {
    const priceValues: { [key: string]: number } = { '$': 1, '$$': 2, '$$$': 3 };
    
    // Relax price filter by one level
    const relaxedPriceValue = Math.min(priceValues[currentFilters.maxPrice] + 1, 3);
    const relaxedPrice = Object.keys(priceValues).find(k => priceValues[k] === relaxedPriceValue) || '$$$';
    
    // Relax rating by 0.5
    const relaxedRating = Math.max(currentFilters.minRating - 0.5, 3.0);
    
    // Keep dietary restrictions but make them optional
    const filtered = restaurants.filter(restaurant => {
      const restaurantPriceValue = priceValues[restaurant.price];
      const matchesPrice = restaurantPriceValue <= priceValues[relaxedPrice];
      const matchesRating = restaurant.rating >= relaxedRating;
      
      // Dietary is now optional - matches if no dietary filters OR if matches any
      const matchesDietary = currentFilters.dietary.length === 0 || 
        currentFilters.dietary.some(diet => restaurant.dietary.includes(diet));
      
      // Exclude currently liked restaurants but allow previously passed ones
      const notLiked = !likedRestaurantIds.has(restaurant.id);
      
      // Only exclude restaurants passed in the last 24 hours (more aggressive reuse)
      const notRecentlyPassed = !recentlyPassedIds.has(restaurant.id);
      
      return matchesPrice && matchesRating && matchesDietary && notLiked && notRecentlyPassed;
    });

    return filtered;
  }, [likedRestaurantIds, recentlyPassedIds]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const refreshRecommendations = useCallback(async (): Promise<Restaurant[]> => {
    if (isRefreshing) return [];
    
    setIsRefreshing(true);
    setRefreshCount(prev => prev + 1);
    
    try {
      let newRestaurants: Restaurant[] = [];
      const currentRadius = expandedRadius || filters.maxDistance || 10;

      // Strategy 1: Expand search radius (up to 40 miles maximum)
      if (currentRadius < 40) {
        const newRadius = Math.min(currentRadius * 1.5, 40);
        console.log(`Expanding search radius from ${currentRadius} to ${newRadius} miles`);
        setExpandedRadius(newRadius);
        
        newRestaurants = await fetchWithExpandedRadius(newRadius);
        
        if (newRestaurants.length > 0) {
          toast.success(`Found ${newRestaurants.length} more restaurants nearby!`, {
            description: `Expanded search to ${newRadius.toFixed(1)} miles`
          });
        }
      }

      // Strategy 2: Relax filters if still not enough restaurants
      if (newRestaurants.length < 10) {
        console.log('Relaxing filters to find more restaurants');
        const currentRestaurantsPool = newRestaurants.length > 0 ? newRestaurants : currentRestaurants;
        const relaxed = applyRelaxedFilters(currentRestaurantsPool, filters);
        
        if (relaxed.length > newRestaurants.length) {
          newRestaurants = relaxed;
          setRelaxedFilters(filters);
          toast.success(`Relaxed filters to show more options!`, {
            description: `Found ${newRestaurants.length} restaurants`
          });
        }
      }

      // Strategy 3: Include static restaurant data if still running low
      if (newRestaurants.length < 10) {
        console.log('Including backup restaurant data');
        const backupRestaurants = staticRestaurants.filter(
          r => !likedRestaurantIds.has(r.id) && !shownRestaurantIds.has(r.id)
        );
        newRestaurants = [...newRestaurants, ...backupRestaurants.slice(0, 20)];
      }

      // Strategy 4: Re-include passed restaurants after cooldown (older than shown)
      if (newRestaurants.length < 10) {
        console.log('Re-including previously passed restaurants');
        const reusableRestaurants = currentRestaurants.filter(
          r => !likedRestaurantIds.has(r.id) && shownRestaurantIds.has(r.id)
        );
        newRestaurants = [...newRestaurants, ...reusableRestaurants];
        
        // Clear shown history to allow full reuse
        setShownRestaurantIds(new Set());
        
        if (reusableRestaurants.length > 0) {
          toast.success('Showing fresh picks from earlier!', {
            description: 'You might have new perspective now'
          });
        }
      }

      // Filter out duplicates and shuffle
      const uniqueRestaurants = Array.from(
        new Map(newRestaurants.map(r => [r.id, r])).values()
      );
      
      const shuffled = shuffleArray(uniqueRestaurants);
      
      console.log(`Refresh ${refreshCount + 1}: Generated ${shuffled.length} restaurants`);
      
      return shuffled;
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
      toast.error('Failed to load more restaurants');
      return [];
    } finally {
      setIsRefreshing(false);
    }
  }, [
    isRefreshing,
    expandedRadius,
    filters,
    currentRestaurants,
    likedRestaurantIds,
    recentlyPassedIds,
    shownRestaurantIds,
    fetchWithExpandedRadius,
    applyRelaxedFilters,
    refreshCount
  ]);

  // Check if we need to refresh (threshold: 3 restaurants remaining)
  const remainingRestaurants = totalRestaurants - currentIndex;
  const shouldRefresh = remainingRestaurants <= 3 && !isRefreshing;

  return {
    shouldRefresh,
    isRefreshing,
    refreshRecommendations,
    remainingRestaurants,
    expandedRadius,
    relaxedFilters,
    refreshCount
  };
};
