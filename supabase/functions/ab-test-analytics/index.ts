import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { testName = "default_recommendations", timeframe = 7 } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Fetching A/B test analytics for test: ${testName}, timeframe: ${timeframe} days`);

    // Calculate date threshold
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);

    // Fetch active variants for this test
    const { data: variants, error: variantsError } = await supabase
      .from("ab_test_variants")
      .select("id, variant_name, model, is_active")
      .eq("test_name", testName);

    if (variantsError) {
      console.error("Error fetching variants:", variantsError);
      throw variantsError;
    }

    if (!variants || variants.length === 0) {
      return new Response(JSON.stringify({ 
        error: "No variants found for this test",
        testName 
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${variants.length} variants for test ${testName}`);

    // Analyze each variant
    const variantAnalytics = [];

    for (const variant of variants) {
      // Fetch all metrics for this variant within timeframe
      const { data: metrics, error: metricsError } = await supabase
        .from("ab_test_metrics")
        .select("*")
        .eq("variant_id", variant.id)
        .gte("recorded_at", startDate.toISOString());

      if (metricsError) {
        console.error(`Error fetching metrics for variant ${variant.id}:`, metricsError);
        continue;
      }

      if (!metrics || metrics.length === 0) {
        variantAnalytics.push({
          variantId: variant.id,
          variantName: variant.variant_name,
          model: variant.model,
          isActive: variant.is_active,
          totalSessions: 0,
          metrics: {
            avgCTR: 0,
            avgConversionRate: 0,
            totalClicks: 0,
            totalConversions: 0,
            totalRecommendations: 0,
            avgGenerationTime: 0,
            engagementScore: 0
          }
        });
        continue;
      }

      // Calculate aggregate metrics
      const totalSessions = metrics.length;
      const totalClicks = metrics.reduce((sum, m) => sum + (m.clicks_count || 0), 0);
      const totalConversions = metrics.reduce((sum, m) => sum + (m.conversions_count || 0), 0);
      const totalRecommendations = metrics.reduce((sum, m) => sum + (m.recommendations_shown || 0), 0);
      const totalGenerationTime = metrics.reduce((sum, m) => sum + (m.generation_time_ms || 0), 0);

      // Calculate average CTR and conversion rate
      const ctrValues = metrics.map(m => m.click_through_rate || 0).filter(v => v > 0);
      const avgCTR = ctrValues.length > 0 ? ctrValues.reduce((a, b) => a + b, 0) / ctrValues.length : 0;

      const conversionValues = metrics.map(m => m.conversion_rate || 0).filter(v => v > 0);
      const avgConversionRate = conversionValues.length > 0 
        ? conversionValues.reduce((a, b) => a + b, 0) / conversionValues.length 
        : 0;

      const avgGenerationTime = totalSessions > 0 ? totalGenerationTime / totalSessions : 0;

      // Calculate engagement score (weighted combination of CTR and conversion rate)
      const engagementScore = (avgCTR * 0.4) + (avgConversionRate * 0.6);

      // Fetch interaction details for deeper analysis
      const { data: interactions } = await supabase
        .from("recommendation_interactions")
        .select("interaction_type, created_at")
        .eq("variant_id", variant.id)
        .gte("created_at", startDate.toISOString());

      const interactionBreakdown = {
        views: interactions?.filter(i => i.interaction_type === 'view').length || 0,
        clicks: interactions?.filter(i => i.interaction_type === 'click').length || 0,
        likes: interactions?.filter(i => i.interaction_type === 'like').length || 0,
        orders: interactions?.filter(i => i.interaction_type === 'order').length || 0,
      };

      console.log(`Variant ${variant.variant_name}: ${totalSessions} sessions, CTR: ${avgCTR.toFixed(2)}%, Conv: ${avgConversionRate.toFixed(2)}%`);

      variantAnalytics.push({
        variantId: variant.id,
        variantName: variant.variant_name,
        model: variant.model,
        isActive: variant.is_active,
        totalSessions,
        metrics: {
          avgCTR: parseFloat(avgCTR.toFixed(2)),
          avgConversionRate: parseFloat(avgConversionRate.toFixed(2)),
          totalClicks,
          totalConversions,
          totalRecommendations,
          avgGenerationTime: parseFloat(avgGenerationTime.toFixed(2)),
          engagementScore: parseFloat(engagementScore.toFixed(2))
        },
        interactionBreakdown
      });
    }

    // Determine winning variant (highest engagement score)
    const winner = variantAnalytics.reduce((best, current) => 
      current.metrics.engagementScore > best.metrics.engagementScore ? current : best
    , variantAnalytics[0]);

    console.log(`Winner: ${winner?.variantName} with engagement score ${winner?.metrics.engagementScore}`);

    return new Response(JSON.stringify({
      testName,
      timeframeDays: timeframe,
      analyzedAt: new Date().toISOString(),
      variants: variantAnalytics,
      winner: {
        variantName: winner?.variantName,
        model: winner?.model,
        engagementScore: winner?.metrics.engagementScore
      },
      summary: {
        totalVariants: variants.length,
        activeVariants: variants.filter(v => v.is_active).length,
        totalSessions: variantAnalytics.reduce((sum, v) => sum + v.totalSessions, 0),
        totalInteractions: variantAnalytics.reduce((sum, v) => 
          sum + (v.interactionBreakdown?.clicks || 0) + 
          (v.interactionBreakdown?.likes || 0) + 
          (v.interactionBreakdown?.orders || 0), 0
        )
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ab-test-analytics:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
