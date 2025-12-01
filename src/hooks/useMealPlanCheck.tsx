import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

        // Check if restaurant is on the meal plan for this university
        const { data: mealPlanData } = await supabase
          .from('university_meal_plan_restaurants')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .eq('university', profile.university)
          .eq('verified', true)
          .maybeSingle();

        setIsOnMealPlan(!!mealPlanData);
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
