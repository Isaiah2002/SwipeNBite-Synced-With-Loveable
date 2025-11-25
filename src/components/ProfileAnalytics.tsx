import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, Heart } from 'lucide-react';

interface AnalyticsData {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  swipeStats: { right: number; left: number };
  topCuisines: { name: string; count: number }[];
  topRestaurants: { name: string; count: number; total: number }[];
}

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--like))', 'hsl(var(--pass))'];

export const ProfileAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        // Fetch order statistics
        const { data: orders } = await supabase
          .from('orders')
          .select('total, restaurant_name')
          .eq('user_id', user.id);

        // Fetch swipe statistics
        const { data: swipes } = await supabase
          .from('swipe_events')
          .select('swipe_direction, cuisine')
          .eq('user_id', user.id);

        const totalOrders = orders?.length || 0;
        const totalSpent = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
        const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

        // Calculate swipe stats
        const swipeStats = {
          right: swipes?.filter(s => s.swipe_direction === 'right').length || 0,
          left: swipes?.filter(s => s.swipe_direction === 'left').length || 0,
        };

        // Calculate top cuisines from swipes
        const cuisineCounts: { [key: string]: number } = {};
        swipes?.forEach(swipe => {
          if (swipe.cuisine) {
            cuisineCounts[swipe.cuisine] = (cuisineCounts[swipe.cuisine] || 0) + 1;
          }
        });
        const topCuisines = Object.entries(cuisineCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Calculate top restaurants from orders
        const restaurantStats: { [key: string]: { count: number; total: number } } = {};
        orders?.forEach(order => {
          if (!restaurantStats[order.restaurant_name]) {
            restaurantStats[order.restaurant_name] = { count: 0, total: 0 };
          }
          restaurantStats[order.restaurant_name].count += 1;
          restaurantStats[order.restaurant_name].total += Number(order.total);
        });
        const topRestaurants = Object.entries(restaurantStats)
          .map(([name, stats]) => ({ name, count: stats.count, total: stats.total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);

        setAnalytics({
          totalOrders,
          totalSpent,
          averageOrderValue,
          swipeStats,
          topCuisines,
          topRestaurants,
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!analytics) return null;

  const swipeData = [
    { name: 'Liked', value: analytics.swipeStats.right, color: 'hsl(var(--like))' },
    { name: 'Passed', value: analytics.swipeStats.left, color: 'hsl(var(--pass))' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{analytics.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-secondary" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">${analytics.totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              Avg Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">${analytics.averageOrderValue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="w-4 h-4 text-like" />
              Liked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{analytics.swipeStats.right}</div>
          </CardContent>
        </Card>
      </div>

      {/* Swipe Patterns Chart */}
      {(analytics.swipeStats.right > 0 || analytics.swipeStats.left > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Swipe Patterns</CardTitle>
            <CardDescription>Your restaurant browsing behavior</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={swipeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {swipeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Cuisines */}
      {analytics.topCuisines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Favorite Cuisines</CardTitle>
            <CardDescription>Based on your swipe history</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.topCuisines} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Restaurants */}
      {analytics.topRestaurants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Ordered Restaurants</CardTitle>
            <CardDescription>Your go-to dining spots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topRestaurants.map((restaurant, index) => (
                <div key={restaurant.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{restaurant.name}</p>
                      <p className="text-sm text-muted-foreground">{restaurant.count} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-card-foreground">${restaurant.total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">total spent</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
