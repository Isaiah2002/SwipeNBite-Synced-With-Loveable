import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { universityCampuses } from '@/data/universityCampuses';
import { calculateDistance } from '@/utils/distance';

export const useMealPlanCheck = (restaurantId: string) => {
  const { user } = useAuth();
  const [isOnMealPlan, setIsOnMealPlan] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMealPlan = async () => {
      if (!user || !restaurantId) {
        setIsOnMealPlan(false);
        setLoading(false);
        return;
      }

      try {
        // Get user's university
        const { data: profile } = await supabase
          .from('profiles')
          .select('university')
          .eq('user_id', user.id)
          .single();

        if (!profile?.university) {
          setIsOnMealPlan(false);
          setLoading(false);
          return;
        }

        // Get campus data for user's university
        const campusData = universityCampuses[profile.university];
        if (!campusData) {
          setIsOnMealPlan(false);
          setLoading(false);
          return;
        }

        // Get restaurant location
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('latitude, longitude')
          .eq('id', restaurantId)
          .single();

        if (!restaurant?.latitude || !restaurant?.longitude) {
          setIsOnMealPlan(false);
          setLoading(false);
          return;
        }

        // Calculate distance from restaurant to campus center
        const distance = calculateDistance(
          { latitude: campusData.latitude, longitude: campusData.longitude },
          { latitude: restaurant.latitude, longitude: restaurant.longitude }
        );

        // Check if restaurant is within campus radius (diameter / 2) plus 0.5 mile buffer
        const campusRadius = (campusData.diameterMiles / 2) + 0.5;
        setIsOnMealPlan(distance <= campusRadius);
      } catch (error) {
        console.error('Error checking meal plan:', error);
        setIsOnMealPlan(false);
      } finally {
        setLoading(false);
      }
    };

    checkMealPlan();
  }, [user, restaurantId]);

  return { isOnMealPlan, loading };
};
