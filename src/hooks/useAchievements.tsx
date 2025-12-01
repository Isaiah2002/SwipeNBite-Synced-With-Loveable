import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_icon: string;
  badge_color: string;
  criteria_type: string;
  criteria_threshold: number;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  unlocked_at: string;
  achievements: Achievement;
}

export const useAchievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const fetchAchievements = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*, achievements(*)')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const checkForNewAchievements = useCallback(async () => {
    if (!user || checking) return;

    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-achievements', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) throw error;

      if (data?.newlyUnlocked && data.newlyUnlocked.length > 0) {
        // Show toast for each newly unlocked achievement
        for (const achievement of data.newlyUnlocked) {
          toast.success(`🎉 Achievement Unlocked: ${achievement.name}`, {
            description: achievement.description,
            duration: 5000,
          });
        }
        
        // Refresh achievements list
        await fetchAchievements();
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    } finally {
      setChecking(false);
    }
  }, [user, checking, fetchAchievements]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return {
    achievements,
    loading,
    checking,
    checkForNewAchievements,
    refetch: fetchAchievements,
  };
};