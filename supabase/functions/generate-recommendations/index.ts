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
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user's swipe history
    const { data: swipes, error: swipesError } = await supabase
      .from("swipe_events")
      .select("swipe_direction, cuisine, restaurant_name, rating, price")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (swipesError) throw swipesError;

    // Fetch user's liked restaurants
    const { data: liked, error: likedError } = await supabase
      .from("liked_restaurants")
      .select("cuisine, restaurant_name, rating, price")
      .eq("user_id", userId);

    if (likedError) throw likedError;

    // Analyze swipe patterns
    const likedSwipes = swipes?.filter(s => s.swipe_direction === "right") || [];
    const passedSwipes = swipes?.filter(s => s.swipe_direction === "left") || [];

    const likedCuisines = likedSwipes.map(s => s.cuisine).filter(Boolean);
    const likedPrices = likedSwipes.map(s => s.price).filter(Boolean);
    const likedRatings = likedSwipes.map(s => s.rating).filter(Boolean);

    // Calculate metrics for tracking
    const totalSwipes = swipes?.length || 0;
    const likeRatio = totalSwipes > 0 ? (likedSwipes.length / totalSwipes) * 100 : 0;
    const sessionId = crypto.randomUUID();

    // Create analysis prompt
    const analysisPrompt = `Based on this user's restaurant swipe behavior, provide 3-5 personalized restaurant recommendations.

User's Swipe History:
- Total swipes: ${swipes?.length || 0}
- Liked: ${likedSwipes.length}
- Passed: ${passedSwipes.length}
- Like ratio: ${((likedSwipes.length / (swipes?.length || 1)) * 100).toFixed(1)}%

Preferred Cuisines (from likes): ${likedCuisines.slice(0, 10).join(", ") || "None yet"}
Preferred Price Range: ${likedPrices.slice(0, 10).join(", ") || "None yet"}
Average Rating Preference: ${likedRatings.length > 0 ? (likedRatings.reduce((a, b) => a + b, 0) / likedRatings.length).toFixed(1) : "N/A"}

Recently Liked Restaurants: ${likedSwipes.slice(0, 5).map(s => s.restaurant_name).join(", ") || "None yet"}
Recently Passed Restaurants: ${passedSwipes.slice(0, 5).map(s => s.restaurant_name).join(", ") || "None yet"}

Provide recommendations in a JSON array format with the following structure:
{
  "recommendations": [
    {
      "title": "Restaurant or Cuisine Type",
      "reason": "Brief explanation why this matches their preferences",
      "cuisine": "Cuisine type",
      "insight": "Specific insight about their behavior"
    }
  ]
}`;

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a restaurant recommendation expert. Analyze user behavior and provide personalized, actionable recommendations. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        temperature: 0.7,
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

    // Add metadata for tracking
    const responseData = {
      ...recommendations,
      metadata: {
        sessionId,
        totalSwipes,
        likeRatio: likeRatio.toFixed(1),
        modelUsed: "google/gemini-2.5-flash",
        generatedAt: new Date().toISOString()
      }
    };

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
