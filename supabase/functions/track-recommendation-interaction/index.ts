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
    const { sessionId, variantId, recommendations, interactionType, restaurantData } = await req.json();
    
    if (!sessionId || !interactionType) {
      return new Response(JSON.stringify({ error: "sessionId and interactionType are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // Track the interaction
    if (interactionType === 'view' && recommendations) {
      // Track view - record all recommendations shown
      for (const rec of recommendations) {
        await supabase
          .from("recommendation_interactions")
          .insert({
            session_id: sessionId,
            user_id: user.id,
            variant_id: variantId,
            recommendation_title: rec.title,
            recommendation_cuisine: rec.cuisine,
            interaction_type: 'view'
          });
      }

      // Update metrics: increment recommendations_shown
      const { data: metric } = await supabase
        .from("ab_test_metrics")
        .select("*")
        .eq("session_id", sessionId)
        .maybeSingle();

      if (metric) {
        const newRecommendationsShown = metric.recommendations_shown + recommendations.length;
        await supabase
          .from("ab_test_metrics")
          .update({
            recommendations_shown: newRecommendationsShown
          })
          .eq("session_id", sessionId);
      }
    } else if (interactionType === 'click' && restaurantData) {
      // Track click on a specific recommendation
      await supabase
        .from("recommendation_interactions")
        .insert({
          session_id: sessionId,
          user_id: user.id,
          variant_id: variantId,
          recommendation_title: restaurantData.title,
          recommendation_cuisine: restaurantData.cuisine,
          interaction_type: 'click'
        });

      // Update metrics: increment clicks_count and recalculate CTR
      const { data: metric } = await supabase
        .from("ab_test_metrics")
        .select("*")
        .eq("session_id", sessionId)
        .maybeSingle();

      if (metric) {
        const newClicksCount = metric.clicks_count + 1;
        const clickThroughRate = metric.recommendations_shown > 0 
          ? (newClicksCount / metric.recommendations_shown) * 100 
          : 0;

        await supabase
          .from("ab_test_metrics")
          .update({
            clicks_count: newClicksCount,
            click_through_rate: clickThroughRate
          })
          .eq("session_id", sessionId);
      }
    } else if ((interactionType === 'like' || interactionType === 'order') && restaurantData) {
      // Track conversion
      await supabase
        .from("recommendation_interactions")
        .insert({
          session_id: sessionId,
          user_id: user.id,
          variant_id: variantId,
          recommendation_title: restaurantData.title,
          recommendation_cuisine: restaurantData.cuisine,
          interaction_type: interactionType
        });

      // Update metrics: increment conversions_count and recalculate conversion rate
      const { data: metric } = await supabase
        .from("ab_test_metrics")
        .select("*")
        .eq("session_id", sessionId)
        .maybeSingle();

      if (metric) {
        const newConversionsCount = metric.conversions_count + 1;
        const conversionRate = metric.clicks_count > 0 
          ? (newConversionsCount / metric.clicks_count) * 100 
          : 0;

        await supabase
          .from("ab_test_metrics")
          .update({
            conversions_count: newConversionsCount,
            conversion_rate: conversionRate
          })
          .eq("session_id", sessionId);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error tracking interaction:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
