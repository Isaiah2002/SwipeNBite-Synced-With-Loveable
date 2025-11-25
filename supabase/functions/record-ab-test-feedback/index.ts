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
    const { sessionId, feedbackType } = await req.json();
    
    if (!sessionId || !feedbackType) {
      return new Response(JSON.stringify({ error: "sessionId and feedbackType are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find the existing metric record for this session
    const { data: existingMetric } = await supabase
      .from("ab_test_metrics")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (!existingMetric) {
      return new Response(JSON.stringify({ error: "No metric found for this session" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update feedback counts
    const positiveFeedbackCount = feedbackType === 'positive' 
      ? existingMetric.positive_feedback_count + 1 
      : existingMetric.positive_feedback_count;
    
    const negativeFeedbackCount = feedbackType === 'negative' 
      ? existingMetric.negative_feedback_count + 1 
      : existingMetric.negative_feedback_count;

    const totalFeedbackCount = positiveFeedbackCount + negativeFeedbackCount;
    const acceptanceRate = totalFeedbackCount > 0 
      ? (positiveFeedbackCount / totalFeedbackCount) * 100 
      : 0;

    // Update the metric record
    const { error } = await supabase
      .from("ab_test_metrics")
      .update({
        positive_feedback_count: positiveFeedbackCount,
        negative_feedback_count: negativeFeedbackCount,
        total_feedback_count: totalFeedbackCount,
        acceptance_rate: acceptanceRate
      })
      .eq("session_id", sessionId);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in record-ab-test-feedback:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
