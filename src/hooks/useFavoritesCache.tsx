import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface FavoriteCuisine {
  cuisine: string;
  count: number;
}

interface FavoritePrice {
  price: string;
  count: number;
}

interface FavoritesCache {
  cuisines: FavoriteCuisine[];
  priceRanges: FavoritePrice[];
  restaurantIds: Set<string>;
  loading: boolean;
}

// Global cache for favorites data
let globalFavoritesCache: FavoritesCache | null = null;
let lastCacheTime: number | null = null;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export const useFavoritesCache = () => {
  const { user } = useAuth();
  const [cache, setCache] = useState<FavoritesCache>(
    globalFavoritesCache || {
      cuisines: [],
      priceRanges: [],
      restaurantIds: new Set(),
      loading: true,
    }
  );

  useEffect(() => {
    if (!user) {
      setCache({ cuisines: [], priceRanges: [], restaurantIds: new Set(), loading: false });
      return;
    }

    // Check if cache is still valid
    const now = Date.now();
    if (globalFavoritesCache && lastCacheTime && (now - lastCacheTime) < CACHE_DURATION) {
      setCache(globalFavoritesCache);
      return;
    }

    loadFavoritesCache();
  }, [user]);

  const loadFavoritesCache = () => {
    try {
      const cachedFavorites = localStorage.getItem('cached_favorites');
      if (!cachedFavorites) {
        setCache({ cuisines: [], priceRanges: [], restaurantIds: new Set(), loading: false });
        return;
      }

      const favorites = JSON.parse(cachedFavorites);
      
      // Aggregate cuisines
      const cuisineMap = new Map<string, number>();
      favorites.forEach((fav: any) => {
        const cuisine = fav.cuisine;
        cuisineMap.set(cuisine, (cuisineMap.get(cuisine) || 0) + 1);
      });
      
      const cuisines = Array.from(cuisineMap.entries())
        .map(([cuisine, count]) => ({ cuisine, count }))
        .sort((a, b) => b.count - a.count);

      // Aggregate price ranges
      const priceMap = new Map<string, number>();
      favorites.forEach((fav: any) => {
        const price = fav.price;
        priceMap.set(price, (priceMap.get(price) || 0) + 1);
      });
      
      const priceRanges = Array.from(priceMap.entries())
        .map(([price, count]) => ({ price, count }))
        .sort((a, b) => b.count - a.count);

      // Extract restaurant IDs
      const restaurantIds = new Set<string>(favorites.map((fav: any) => fav.restaurant_id as string));

      const newCache = {
        cuisines,
        priceRanges,
        restaurantIds,
        loading: false,
      };

      globalFavoritesCache = newCache;
      lastCacheTime = Date.now();
      setCache(newCache);
    } catch (error) {
      console.error('Error loading favorites cache:', error);
      setCache({ cuisines: [], priceRanges: [], restaurantIds: new Set(), loading: false });
    }
  };

  const invalidateCache = () => {
    globalFavoritesCache = null;
    lastCacheTime = null;
    loadFavoritesCache();
  };

  return { ...cache, refresh: invalidateCache };
};
