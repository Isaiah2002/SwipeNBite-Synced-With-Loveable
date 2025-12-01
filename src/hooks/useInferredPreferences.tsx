import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface InferredCuisine {
  cuisine: string;
  confidence: number;
}

interface InferredPreferences {
  cuisines: InferredCuisine[];
  priceRange?: string;
  loading: boolean;
}

// Global cache to persist across navigation
let cachedPreferences: InferredCuisine[] | null = null;
let lastFetchTime: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useInferredPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<InferredPreferences>({
    cuisines: cachedPreferences || [],
    loading: cachedPreferences === null,
  });

  const fetchPreferences = useCallback(async () => {
    if (!user) {
      setPreferences({ cuisines: [], loading: false });
      return;
    }

    // Check if cache is still valid
    const now = Date.now();
    if (cachedPreferences && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION) {
      setPreferences({ cuisines: cachedPreferences, loading: false });
      return;
    }

    try {
      setPreferences(prev => ({ ...prev, loading: true }));

      // Check if personalization is enabled
      const { data: profile } = await supabase
        .from('profiles')
        .select('personalization_enabled')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile?.personalization_enabled === false) {
        cachedPreferences = [];
        setPreferences({ cuisines: [], loading: false });
        return;
      }

      const { data, error } = await supabase.functions.invoke('infer-user-preferences', {
        body: { userId: user.id }
      });

      if (error) throw error;

      const inferredCuisines = data?.preferredCuisines || [];
      
      // Update cache
      cachedPreferences = inferredCuisines;
      lastFetchTime = now;

      setPreferences({
        cuisines: inferredCuisines,
        priceRange: data?.preferredPriceRange,
        loading: false,
      });
    } catch (error) {
      console.error('Error inferring preferences:', error);
      setPreferences({ cuisines: [], loading: false });
    }
  }, [user]);

  // Prefetch preferences when user logs in
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return { ...preferences, refetch: fetchPreferences };
};

// Helper to clear cache (useful when user changes preferences manually)
export const clearPreferencesCache = () => {
  cachedPreferences = null;
  lastFetchTime = null;
};
