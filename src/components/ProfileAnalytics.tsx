import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, Heart, Sparkles, ThumbsUp, ThumbsDown, TrendingUpIcon } from 'lucide-react';
import { toast } from 'sonner';
import { LocationInsights } from './LocationInsights';
import { CommuteInsights } from './CommuteInsights';
import { AIModelAnalytics } from './AIModelAnalytics';
import { ABTestDashboard } from './ABTestDashboard';

interface AnalyticsData {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  swipeStats: { right: number; left: number; total: number };
  topCuisines: { name: string; count: number }[];
  topRestaurants: { name: string; count: number; total: number }[];
}

interface Recommendation {
  title: string;
  reason: string;
  cuisine: string;
  insight: string;
}

interface RecommendationMetadata {
  sessionId: string;
  totalSwipes: number;
  likeRatio: string;
  modelUsed: string;
  variantId: string | null;
  testName: string;
  generationTime: number;
  generatedAt: string;
}

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--like))', 'hsl(var(--pass))'];

export const ProfileAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [metadata, setMetadata] = useState<RecommendationMetadata | null>(null);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<{ [key: number]: string }>({});

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
        const totalSwipes = swipes?.length || 0;
        const swipeStats = {
          right: swipes?.filter(s => s.swipe_direction === 'right').length || 0,
          left: swipes?.filter(s => s.swipe_direction === 'left').length || 0,
          total: totalSwipes,
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

  const generateRecommendations = async () => {
    if (!user) return;
    
    setLoadingRecs(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-recommendations', {
        body: { userId: user.id }
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error('Rate limit reached. Please try again in a moment.');
        } else if (error.message?.includes('402')) {
          toast.error('AI credits depleted. Please add credits to your workspace.');
        } else {
          toast.error('Failed to generate recommendations');
        }
        throw error;
      }

      if (data?.recommendations) {
        setRecommendations(data.recommendations);
        setMetadata(data.metadata);
        setFeedbackGiven({});
        toast.success('AI recommendations generated!');
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoadingRecs(false);
    }
  };

  const submitFeedback = async (index: number, feedbackType: 'positive' | 'negative') => {
    if (!user || !metadata) return;
    
    const rec = recommendations[index];
    
    try {
      const { error } = await supabase
        .from('recommendation_feedback')
        .insert({
          user_id: user.id,
          recommendation_title: rec.title,
          recommendation_cuisine: rec.cuisine,
          recommendation_reason: rec.reason,
          feedback_type: feedbackType,
          session_id: metadata.sessionId,
          model_used: metadata.modelUsed,
          total_swipes_at_generation: parseInt(metadata.totalSwipes.toString()),
          like_ratio_at_generation: parseFloat(metadata.likeRatio),
        });

      if (error) throw error;

      // Also record for A/B testing if applicable
      if (metadata.variantId) {
        await supabase.functions.invoke('record-ab-test-feedback', {
          body: {
            sessionId: metadata.sessionId,
            feedbackType
          }
        });
      }

      setFeedbackGiven(prev => ({ ...prev, [index]: feedbackType }));
      toast.success(`Feedback recorded! This helps improve recommendations.`);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

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

  const likeRatio = analytics.swipeStats.total > 0 
    ? ((analytics.swipeStats.right / analytics.swipeStats.total) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Swipe Insights Section */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="w-5 h-5 text-primary" />
            Swipe Insights
          </CardTitle>
          <CardDescription>Your restaurant browsing behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp className="w-4 h-4 text-like" />
                <p className="text-sm font-medium text-muted-foreground">Total Swipes</p>
              </div>
              <p className="text-3xl font-bold text-card-foreground">{analytics.swipeStats.total}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-like" />
                <p className="text-sm font-medium text-muted-foreground">Like Ratio</p>
              </div>
              <p className="text-3xl font-bold text-like">{likeRatio}%</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-3 p-3 bg-like/10 rounded-lg border border-like/20">
              <ThumbsUp className="w-5 h-5 text-like" />
              <div>
                <p className="text-sm text-muted-foreground">Liked</p>
                <p className="text-2xl font-bold text-like">{analytics.swipeStats.right}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-pass/10 rounded-lg border border-pass/20">
              <ThumbsDown className="w-5 h-5 text-pass" />
              <div>
                <p className="text-sm text-muted-foreground">Passed</p>
                <p className="text-2xl font-bold text-pass">{analytics.swipeStats.left}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Stats Cards */}
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
              <TrendingUpIcon className="w-4 h-4 text-accent" />
              Swipes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{analytics.swipeStats.total}</div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations Section */}
      <Card className="border-2 border-secondary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            AI-Powered Recommendations
          </CardTitle>
          <CardDescription>Personalized suggestions based on your swipe behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                Get personalized restaurant recommendations based on your swipe patterns!
              </p>
              <Button
                onClick={generateRecommendations}
                disabled={loadingRecs || analytics.swipeStats.total === 0}
                className="gradient-primary text-primary-foreground border-0"
              >
                {loadingRecs ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Recommendations
                  </>
                )}
              </Button>
              {analytics.swipeStats.total === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Start swiping to get recommendations!
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-lg border border-secondary/20"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <h4 className="font-semibold text-card-foreground">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.reason}</p>
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                            {rec.cuisine}
                          </span>
                          <span className="text-xs text-muted-foreground italic">
                            {rec.insight}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          {!feedbackGiven[index] ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => submitFeedback(index, 'positive')}
                                className="gap-2 text-like border-like/20 hover:bg-like/10"
                              >
                                <ThumbsUp className="w-3 h-3" />
                                Helpful
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => submitFeedback(index, 'negative')}
                                className="gap-2 text-pass border-pass/20 hover:bg-pass/10"
                              >
                                <ThumbsDown className="w-3 h-3" />
                                Not Helpful
                              </Button>
                            </>
                          ) : (
                            <div className={`flex items-center gap-2 text-sm ${feedbackGiven[index] === 'positive' ? 'text-like' : 'text-pass'}`}>
                              {feedbackGiven[index] === 'positive' ? (
                                <><ThumbsUp className="w-4 h-4" /> Marked as helpful</>
                              ) : (
                                <><ThumbsDown className="w-4 h-4" /> Marked as not helpful</>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                onClick={generateRecommendations}
                disabled={loadingRecs}
                variant="outline"
                className="w-full"
              >
                {loadingRecs ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Refresh Recommendations
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

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

      {/* Location Insights */}
      <LocationInsights />

      {/* Commute Insights */}
      <CommuteInsights />

      {/* AI Model Analytics */}
      <Card className="border-2 border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="w-5 h-5 text-accent" />
            AI Model Performance Analytics
          </CardTitle>
          <CardDescription>
            Track recommendation quality and model effectiveness over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AIModelAnalytics />
        </CardContent>
      </Card>

      {/* A/B Testing Dashboard */}
      <ABTestDashboard />
    </div>
  );
};
