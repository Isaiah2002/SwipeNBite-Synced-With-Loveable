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
    const { userId, testName = "default_recommendations" } = await req.json();
    
    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const startTime = Date.now();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // A/B Testing: Get or assign variant for this user
    let variantConfig = { model: "google/gemini-2.5-flash", systemPrompt: "You are a restaurant recommendation expert. Analyze user behavior and provide personalized, actionable recommendations. Always respond with valid JSON only.", temperature: 0.7, variantId: null };
    
    // Check if user has an assignment for this test
    const { data: assignment } = await supabase
      .from("ab_test_assignments")
      .select("variant_id, ab_test_variants(id, model, system_prompt, temperature)")
      .eq("user_id", userId)
      .eq("test_name", testName)
      .maybeSingle();

    if (assignment && assignment.ab_test_variants) {
      const variant = assignment.ab_test_variants as any;
      variantConfig = {
        model: variant.model,
        systemPrompt: variant.system_prompt,
        temperature: variant.temperature,
        variantId: variant.id
      };
    } else {
      // Get active variants for this test
      const { data: variants } = await supabase
        .from("ab_test_variants")
        .select("*")
        .eq("test_name", testName)
        .eq("is_active", true);

      if (variants && variants.length > 0) {
        // Weighted random selection based on traffic_allocation
        const totalWeight = variants.reduce((sum, v) => sum + Number(v.traffic_allocation), 0);
        let random = Math.random() * totalWeight;
        let selectedVariant = variants[0];
        
        for (const variant of variants) {
          random -= Number(variant.traffic_allocation);
          if (random <= 0) {
            selectedVariant = variant;
            break;
          }
        }

        variantConfig = {
          model: selectedVariant.model,
          systemPrompt: selectedVariant.system_prompt,
          temperature: selectedVariant.temperature,
          variantId: selectedVariant.id
        };

        // Assign user to variant
        await supabase
          .from("ab_test_assignments")
          .insert({
            user_id: userId,
            test_name: testName,
            variant_id: selectedVariant.id
          })
          .select()
          .single();
      }
    }

    // Fetch user's swipe history
    const { data: swipes, error: swipesError } = await supabase
      .from("swipe_events")
      .select("swipe_direction, cuisine, restaurant_name, rating, price")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (swipesError) throw swipesError;

    // Fetch user's liked restaurants (favorites)
    const { data: liked, error: likedError } = await supabase
      .from("liked_restaurants")
      .select("cuisine, restaurant_name, rating, price, dietary")
      .eq("user_id", userId);

    if (likedError) throw likedError;

    // Analyze swipe patterns
    const likedSwipes = swipes?.filter(s => s.swipe_direction === "right") || [];
    const passedSwipes = swipes?.filter(s => s.swipe_direction === "left") || [];

    // Prioritize favorited restaurants for analysis
    const favoritedCuisines = liked?.map(l => l.cuisine).filter(Boolean) || [];
    const favoritedPrices = liked?.map(l => l.price).filter(Boolean) || [];
    const favoritedRatings = liked?.map(l => l.rating).filter(Boolean) || [];
    const favoritedDietary = liked?.flatMap(l => l.dietary || []).filter(Boolean) || [];
    
    // Combine with swipe data (favorites have higher weight)
    const allLikedCuisines = [...favoritedCuisines, ...favoritedCuisines, ...likedSwipes.map(s => s.cuisine).filter(Boolean)];
    const allLikedPrices = [...favoritedPrices, ...favoritedPrices, ...likedSwipes.map(s => s.price).filter(Boolean)];
    const allLikedRatings = [...favoritedRatings, ...favoritedRatings, ...likedSwipes.map(s => s.rating).filter(Boolean)];

    // Calculate frequency for top preferences
    const cuisineFrequency = allLikedCuisines.reduce((acc, c) => {
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const priceFrequency = allLikedPrices.reduce((acc, p) => {
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCuisines = Object.entries(cuisineFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cuisine]) => cuisine);
    
    const topPrices = Object.entries(priceFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([price]) => price);

    // Calculate metrics for tracking
    const totalSwipes = swipes?.length || 0;
    const likeRatio = totalSwipes > 0 ? (likedSwipes.length / totalSwipes) * 100 : 0;
    const sessionId = crypto.randomUUID();

    // Create analysis prompt with strong emphasis on favorited restaurants
    const analysisPrompt = `Based on this user's restaurant preferences, provide 3-5 personalized restaurant recommendations that PRIORITIZE their favorited restaurants' patterns.

FAVORITED RESTAURANTS (HIGHEST PRIORITY):
- Count: ${liked?.length || 0}
- Top Cuisines: ${topCuisines.join(", ") || "None yet"}
- Preferred Price Points: ${topPrices.join(", ") || "None yet"}
- Average Rating: ${favoritedRatings.length > 0 ? (favoritedRatings.reduce((a, b) => a + b, 0) / favoritedRatings.length).toFixed(1) : "N/A"}
- Dietary Preferences: ${[...new Set(favoritedDietary)].join(", ") || "None"}
- Favorite Restaurants: ${liked?.map(l => l.restaurant_name).slice(0, 5).join(", ") || "None yet"}

Swipe History (Secondary Context):
- Total swipes: ${swipes?.length || 0}
- Liked: ${likedSwipes.length}
- Passed: ${passedSwipes.length}
- Like ratio: ${((likedSwipes.length / (swipes?.length || 1)) * 100).toFixed(1)}%

Recently Passed: ${passedSwipes.slice(0, 3).map(s => s.restaurant_name).join(", ") || "None"}

INSTRUCTIONS:
1. Recommendations MUST match the top cuisines from favorited restaurants
2. Recommendations MUST match the preferred price points from favorites
3. Consider dietary preferences from favorites
4. Suggest similar restaurants or complementary cuisines
5. Explain how each recommendation relates to their favorites

Provide recommendations in a JSON array format with the following structure:
{
  "recommendations": [
    {
      "title": "Restaurant or Cuisine Type",
      "reason": "How this matches their favorited restaurants",
      "cuisine": "Cuisine type (should match top cuisines)",
      "insight": "Specific connection to their favorites"
    }
  ]
}`;

    // Call Lovable AI Gateway with A/B test variant config
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: variantConfig.model,
        messages: [
          {
            role: "system",
            content: variantConfig.systemPrompt,
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        temperature: variantConfig.temperature,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    
    // Extract JSON from response (handle potential markdown code blocks)
    let jsonContent = content.trim();
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.replace(/```\n?/g, "");
    }
    
    const recommendations = JSON.parse(jsonContent);
    
    const generationTime = Date.now() - startTime;

    // Add metadata for tracking
    const responseData = {
      ...recommendations,
      metadata: {
        sessionId,
        totalSwipes,
        likeRatio: likeRatio.toFixed(1),
        modelUsed: variantConfig.model,
        variantId: variantConfig.variantId,
        testName,
        generationTime,
        generatedAt: new Date().toISOString()
      }
    };

    // Record initial metrics for A/B testing
    const recommendationsCount = recommendations?.recommendations?.length || 0;
    
    if (variantConfig.variantId) {
      await supabase
        .from("ab_test_metrics")
        .insert({
          variant_id: variantConfig.variantId,
          session_id: sessionId,
          user_id: userId,
          total_feedback_count: 0,
          avg_swipes_at_generation: totalSwipes,
          avg_like_ratio_at_generation: likeRatio,
          generation_time_ms: generationTime,
          recommendations_shown: recommendationsCount,
          clicks_count: 0,
          conversions_count: 0
        });
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-recommendations:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
