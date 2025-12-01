import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useMealPlanCheck = (restaurantId: string) => {
  const { user } = useAuth();
  const [acceptsMealPlan, setAcceptsMealPlan] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkMealPlan = async () => {
      if (!user || !restaurantId) return;

      setLoading(true);
      try {
        // Get user's university from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('university')
          .eq('user_id', user.id)
          .single();

        if (!profile?.university) {
          setAcceptsMealPlan(false);
          setVerified(false);
          setLoading(false);
          return;
        }

        // Check if restaurant accepts meal plans for this university
        const { data: mealPlanData } = await supabase
          .from('university_meal_plan_restaurants')
          .select('verified')
          .eq('restaurant_id', restaurantId)
          .eq('university', profile.university)
          .maybeSingle();

        setAcceptsMealPlan(!!mealPlanData);
        setVerified(mealPlanData?.verified || false);
      } catch (error) {
        console.error('Error checking meal plan:', error);
        setAcceptsMealPlan(false);
        setVerified(false);
      } finally {
        setLoading(false);
      }
    };

    checkMealPlan();
  }, [restaurantId, user]);

  return { acceptsMealPlan, verified, loading };
};