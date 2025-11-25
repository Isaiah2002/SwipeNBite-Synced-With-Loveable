import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { startOfDay, startOfWeek, startOfMonth, endOfDay } from 'date-fns';

interface BudgetData {
  daily: {
    budget: number | null;
    spent: number;
    remaining: number;
    percentage: number;
  };
  weekly: {
    budget: number | null;
    spent: number;
    remaining: number;
    percentage: number;
  };
  monthly: {
    budget: number | null;
    spent: number;
    remaining: number;
    percentage: number;
  };
  alertsEnabled: boolean;
}

export const useBudgetTracking = () => {
  const { user } = useAuth();
  const [budgetData, setBudgetData] = useState<BudgetData>({
    daily: { budget: null, spent: 0, remaining: 0, percentage: 0 },
    weekly: { budget: null, spent: 0, remaining: 0, percentage: 0 },
    monthly: { budget: null, spent: 0, remaining: 0, percentage: 0 },
    alertsEnabled: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchBudgetData();
  }, [user]);

  const fetchBudgetData = async () => {
    if (!user) return;

    try {
      // Fetch profile with budget settings
      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_budget, weekly_budget, monthly_budget, budget_alerts_enabled')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Calculate spending for each period
      const now = new Date();
      const dayStart = startOfDay(now).toISOString();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
      const monthStart = startOfMonth(now).toISOString();

      // Fetch orders for each period
      const [dailyOrders, weeklyOrders, monthlyOrders] = await Promise.all([
        supabase
          .from('orders')
          .select('total')
          .eq('user_id', user.id)
          .gte('created_at', dayStart),
        supabase
          .from('orders')
          .select('total')
          .eq('user_id', user.id)
          .gte('created_at', weekStart),
        supabase
          .from('orders')
          .select('total')
          .eq('user_id', user.id)
          .gte('created_at', monthStart)
      ]);

      // Calculate totals
      const dailySpent = dailyOrders.data?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
      const weeklySpent = weeklyOrders.data?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
      const monthlySpent = monthlyOrders.data?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

      const calculateBudgetInfo = (budget: number | null, spent: number) => {
        if (!budget) {
          return { budget, spent, remaining: 0, percentage: 0 };
        }
        const remaining = Math.max(0, budget - spent);
        const percentage = budget > 0 ? (spent / budget) * 100 : 0;
        return { budget, spent, remaining, percentage };
      };

      setBudgetData({
        daily: calculateBudgetInfo(profile.daily_budget, dailySpent),
        weekly: calculateBudgetInfo(profile.weekly_budget, weeklySpent),
        monthly: calculateBudgetInfo(profile.monthly_budget, monthlySpent),
        alertsEnabled: profile.budget_alerts_enabled ?? true
      });
    } catch (error) {
      console.error('Error fetching budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBudgets = async (
    daily: number | null,
    weekly: number | null,
    monthly: number | null
  ) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        daily_budget: daily,
        weekly_budget: weekly,
        monthly_budget: monthly
      })
      .eq('user_id', user.id);

    if (!error) {
      await fetchBudgetData();
    }

    return { error };
  };

  const toggleAlerts = async (enabled: boolean) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ budget_alerts_enabled: enabled })
      .eq('user_id', user.id);

    if (!error) {
      setBudgetData(prev => ({ ...prev, alertsEnabled: enabled }));
    }

    return { error };
  };

  const isApproachingLimit = (percentage: number) => percentage >= 80 && percentage < 100;
  const isOverLimit = (percentage: number) => percentage >= 100;

  return {
    budgetData,
    loading,
    updateBudgets,
    toggleAlerts,
    isApproachingLimit,
    isOverLimit,
    refreshBudgetData: fetchBudgetData
  };
};
