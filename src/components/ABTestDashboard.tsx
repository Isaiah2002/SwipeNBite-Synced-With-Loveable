import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';
import { FlaskConical, Trophy, TrendingUp, Users, Zap } from 'lucide-react';

interface ABTestVariant {
  id: string;
  variant_name: string;
  model: string;
  temperature: number;
  traffic_allocation: number;
  metrics: {
    totalUsers: number;
    totalFeedback: number;
    positiveCount: number;
    negativeCount: number;
    acceptanceRate: number;
    avgGenerationTime: number;
    avgSwipes: number;
    avgLikeRatio: number;
    clickThroughRate: number;
    conversionRate: number;
    totalClicks: number;
    totalConversions: number;
    totalRecommendationsShown: number;
  };
}

interface ABTest {
  test_name: string;
  variants: ABTestVariant[];
  winner: string | null;
}

export const ABTestDashboard = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchABTests();
  }, [user]);

  const fetchABTests = async () => {
    if (!user) return;

    try {
      // Fetch all active variants
      const { data: variants, error: variantsError } = await supabase
        .from('ab_test_variants')
        .select('*')
        .eq('is_active', true);

      if (variantsError) throw variantsError;

      if (!variants || variants.length === 0) {
        setTests([]);
        setLoading(false);
        return;
      }

      // Group by test_name
      const testGroups: { [key: string]: any[] } = {};
      variants.forEach(v => {
        if (!testGroups[v.test_name]) {
          testGroups[v.test_name] = [];
        }
        testGroups[v.test_name].push(v);
      });

      // Fetch metrics for each variant
      const testsWithMetrics: ABTest[] = [];
      
      for (const [testName, testVariants] of Object.entries(testGroups)) {
        const variantsWithMetrics = await Promise.all(
          testVariants.map(async (variant) => {
            const { data: metrics } = await supabase
              .from('ab_test_metrics')
              .select('*')
              .eq('variant_id', variant.id);

            const { data: assignments } = await supabase
              .from('ab_test_assignments')
              .select('user_id')
              .eq('variant_id', variant.id);

            const totalFeedback = metrics?.reduce((sum, m) => sum + m.total_feedback_count, 0) || 0;
            const positiveCount = metrics?.reduce((sum, m) => sum + m.positive_feedback_count, 0) || 0;
            const negativeCount = metrics?.reduce((sum, m) => sum + m.negative_feedback_count, 0) || 0;
            const acceptanceRate = totalFeedback > 0 ? (positiveCount / totalFeedback) * 100 : 0;

            const avgGenerationTime = metrics && metrics.length > 0
              ? metrics.reduce((sum, m) => sum + (m.generation_time_ms || 0), 0) / metrics.length
              : 0;

            const avgSwipes = metrics && metrics.length > 0
              ? metrics.reduce((sum, m) => sum + (Number(m.avg_swipes_at_generation) || 0), 0) / metrics.length
              : 0;

            const avgLikeRatio = metrics && metrics.length > 0
              ? metrics.reduce((sum, m) => sum + (Number(m.avg_like_ratio_at_generation) || 0), 0) / metrics.length
              : 0;

            const totalClicks = metrics?.reduce((sum, m) => sum + (m.clicks_count || 0), 0) || 0;
            const totalConversions = metrics?.reduce((sum, m) => sum + (m.conversions_count || 0), 0) || 0;
            const totalRecommendationsShown = metrics?.reduce((sum, m) => sum + (m.recommendations_shown || 0), 0) || 0;
            
            const clickThroughRate = totalRecommendationsShown > 0 ? (totalClicks / totalRecommendationsShown) * 100 : 0;
            const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

            return {
              id: variant.id,
              variant_name: variant.variant_name,
              model: variant.model,
              temperature: variant.temperature,
              traffic_allocation: variant.traffic_allocation,
              metrics: {
                totalUsers: assignments?.length || 0,
                totalFeedback,
                positiveCount,
                negativeCount,
                acceptanceRate,
                avgGenerationTime,
                avgSwipes,
                avgLikeRatio,
                clickThroughRate,
                conversionRate,
                totalClicks,
                totalConversions,
                totalRecommendationsShown,
              },
            };
          })
        );

        // Determine winner (highest acceptance rate with statistical significance)
        let winner = null;
        if (variantsWithMetrics.length > 1) {
          const sortedByAcceptance = [...variantsWithMetrics].sort(
            (a, b) => b.metrics.acceptanceRate - a.metrics.acceptanceRate
          );
          
          // Simple winner selection: highest acceptance rate with at least 10 feedback items
          if (sortedByAcceptance[0].metrics.totalFeedback >= 10) {
            winner = sortedByAcceptance[0].variant_name;
          }
        }

        testsWithMetrics.push({
          test_name: testName,
          variants: variantsWithMetrics,
          winner,
        });
      }

      setTests(testsWithMetrics);
    } catch (error) {
      console.error('Error fetching A/B tests:', error);
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

  if (tests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5" />
            A/B Testing Dashboard
          </CardTitle>
          <CardDescription>
            No active A/B tests found. Tests will appear here when configured.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {tests.map((test) => {
        const comparisonData = test.variants.map(v => ({
          name: v.variant_name,
          acceptanceRate: v.metrics.acceptanceRate,
          totalFeedback: v.metrics.totalFeedback,
          avgGenerationTime: v.metrics.avgGenerationTime,
          clickThroughRate: v.metrics.clickThroughRate,
          conversionRate: v.metrics.conversionRate,
        }));

        // Calculate quality score
        const calculateQualityScore = (metrics: any) => {
          const acceptanceWeight = 0.4;
          const ctrWeight = 0.3;
          const conversionWeight = 0.3;
          
          const acceptanceScore = metrics.acceptanceRate || 0;
          const ctrScore = metrics.clickThroughRate || 0;
          const conversionScore = metrics.conversionRate || 0;
          
          return (acceptanceScore * acceptanceWeight) + 
                 (ctrScore * ctrWeight) + 
                 (conversionScore * conversionWeight);
        };

        return (
          <Card key={test.test_name} className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-primary" />
                    {test.test_name}
                  </CardTitle>
                  <CardDescription>
                    Comparing {test.variants.length} variants
                  </CardDescription>
                </div>
                {test.winner && (
                  <Badge variant="default" className="gap-2">
                    <Trophy className="w-4 h-4" />
                    Winner: {test.winner}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Variant Comparison Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {test.variants.map((variant) => (
                  <Card key={variant.id} className={variant.variant_name === test.winner ? 'border-2 border-secondary' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{variant.variant_name}</CardTitle>
                        {variant.variant_name === test.winner && (
                          <Trophy className="w-5 h-5 text-secondary" />
                        )}
                      </div>
                      <CardDescription className="text-xs">
                        {variant.model} • temp: {variant.temperature}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" /> Users
                          </p>
                          <p className="text-lg font-bold">{variant.metrics.totalUsers}</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Quality
                          </p>
                          <p className="text-lg font-bold text-primary">{calculateQualityScore(variant.metrics).toFixed(1)}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Acceptance Rate</span>
                          <span className="text-sm font-bold text-like">
                            {variant.metrics.acceptanceRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-like to-like/80"
                            style={{ width: `${variant.metrics.acceptanceRate}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Click-Through Rate</p>
                          <p className="font-medium text-secondary">{variant.metrics.clickThroughRate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Conversion Rate</p>
                          <p className="font-medium text-accent">{variant.metrics.conversionRate.toFixed(1)}%</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Avg Time
                        </span>
                        <span className="font-medium">{variant.metrics.avgGenerationTime.toFixed(0)}ms</span>
                      </div>

                      <div className="pt-2 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Recommendations Shown</span>
                          <span className="font-medium">{variant.metrics.totalRecommendationsShown}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Total Clicks</span>
                          <span className="font-medium">{variant.metrics.totalClicks}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Conversions</span>
                          <span className="font-medium">{variant.metrics.totalConversions}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Comparison Charts */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Acceptance Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={comparisonData}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="acceptanceRate" fill="hsl(var(--like))" name="Acceptance (%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Click-Through Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={comparisonData}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="clickThroughRate" fill="hsl(var(--secondary))" name="CTR (%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Conversion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={comparisonData}>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="conversionRate" fill="hsl(var(--accent))" name="Conversion (%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
