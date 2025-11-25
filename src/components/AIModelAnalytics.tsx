import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, ThumbsUp, ThumbsDown, Activity, Sparkles } from 'lucide-react';

interface FeedbackMetrics {
  totalFeedback: number;
  positiveCount: number;
  negativeCount: number;
  acceptanceRate: number;
  feedbackByDate: { date: string; positive: number; negative: number }[];
  feedbackByCuisine: { cuisine: string; positive: number; negative: number; total: number }[];
  avgSwipesPerSession: number;
  avgLikeRatioPerSession: number;
}

const CHART_COLORS = {
  positive: 'hsl(var(--like))',
  negative: 'hsl(var(--pass))',
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
};

export const AIModelAnalytics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<FeedbackMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [user]);

  const fetchMetrics = async () => {
    if (!user) return;

    try {
      const { data: feedback, error } = await supabase
        .from('recommendation_feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!feedback || feedback.length === 0) {
        setMetrics(null);
        setLoading(false);
        return;
      }

      // Calculate metrics
      const positiveCount = feedback.filter(f => f.feedback_type === 'positive').length;
      const negativeCount = feedback.filter(f => f.feedback_type === 'negative').length;
      const totalFeedback = feedback.length;
      const acceptanceRate = totalFeedback > 0 ? (positiveCount / totalFeedback) * 100 : 0;

      // Group by date (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const feedbackByDate = last7Days.map(date => {
        const dayFeedback = feedback.filter(f => f.created_at.startsWith(date));
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          positive: dayFeedback.filter(f => f.feedback_type === 'positive').length,
          negative: dayFeedback.filter(f => f.feedback_type === 'negative').length,
        };
      });

      // Group by cuisine
      const cuisineFeedback: { [key: string]: { positive: number; negative: number } } = {};
      feedback.forEach(f => {
        if (!cuisineFeedback[f.recommendation_cuisine]) {
          cuisineFeedback[f.recommendation_cuisine] = { positive: 0, negative: 0 };
        }
        if (f.feedback_type === 'positive') {
          cuisineFeedback[f.recommendation_cuisine].positive++;
        } else {
          cuisineFeedback[f.recommendation_cuisine].negative++;
        }
      });

      const feedbackByCuisine = Object.entries(cuisineFeedback)
        .map(([cuisine, counts]) => ({
          cuisine,
          positive: counts.positive,
          negative: counts.negative,
          total: counts.positive + counts.negative,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // Calculate average metrics
      const avgSwipesPerSession = feedback.reduce((sum, f) => sum + (f.total_swipes_at_generation || 0), 0) / totalFeedback;
      const avgLikeRatioPerSession = feedback.reduce((sum, f) => sum + (Number(f.like_ratio_at_generation) || 0), 0) / totalFeedback;

      setMetrics({
        totalFeedback,
        positiveCount,
        negativeCount,
        acceptanceRate,
        feedbackByDate,
        feedbackByCuisine,
        avgSwipesPerSession,
        avgLikeRatioPerSession,
      });
    } catch (error) {
      console.error('Error fetching AI metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            AI Model Performance
          </CardTitle>
          <CardDescription>
            No feedback data yet. Rate AI recommendations to see analytics.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const pieData = [
    { name: 'Positive', value: metrics.positiveCount, color: CHART_COLORS.positive },
    { name: 'Negative', value: metrics.negativeCount, color: CHART_COLORS.negative },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Total Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalFeedback}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-like" />
              Positive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-like">{metrics.positiveCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ThumbsDown className="w-4 h-4 text-pass" />
              Negative
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pass">{metrics.negativeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-secondary" />
              Acceptance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{metrics.acceptanceRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Trend (Last 7 Days)</CardTitle>
          <CardDescription>Daily feedback distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={metrics.feedbackByDate}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="positive" 
                stroke={CHART_COLORS.positive} 
                strokeWidth={2}
                name="Positive"
              />
              <Line 
                type="monotone" 
                dataKey="negative" 
                stroke={CHART_COLORS.negative} 
                strokeWidth={2}
                name="Negative"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Feedback Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Feedback Distribution</CardTitle>
            <CardDescription>Overall sentiment breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>AI model effectiveness indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Avg Swipes/Session</p>
                <p className="text-2xl font-bold text-card-foreground">{metrics.avgSwipesPerSession.toFixed(0)}</p>
              </div>
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Avg Like Ratio</p>
                <p className="text-2xl font-bold text-like">{metrics.avgLikeRatioPerSession.toFixed(1)}%</p>
              </div>
              <ThumbsUp className="w-8 h-8 text-like" />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Model Used</p>
                <p className="text-sm font-medium text-card-foreground">Gemini 2.5 Flash</p>
              </div>
              <Activity className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback by Cuisine */}
      {metrics.feedbackByCuisine.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Feedback by Cuisine Type</CardTitle>
            <CardDescription>Most recommended cuisine categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={metrics.feedbackByCuisine} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="cuisine" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="positive" fill={CHART_COLORS.positive} name="Positive" stackId="stack" />
                <Bar dataKey="negative" fill={CHART_COLORS.negative} name="Negative" stackId="stack" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
