import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AddFriendRequest {
  friendEmail: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { friendEmail }: AddFriendRequest = await req.json();

    if (!friendEmail || typeof friendEmail !== 'string') {
      return new Response(
        JSON.stringify({ error: "Friend email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (friendEmail === user.email) {
      return new Response(
        JSON.stringify({ error: "You cannot add yourself as a friend" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role client to look up user by email
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find user by email
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error("Error listing users:", usersError);
      return new Response(
        JSON.stringify({ error: "Failed to find user" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const friendUser = users.users.find((u) => u.email === friendEmail);

    if (!friendUser) {
      return new Response(
        JSON.stringify({ error: "User not found with this email" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if friendship already exists
    const { data: existingFriendship, error: checkError } = await supabaseClient
      .from("friendships")
      .select("*")
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friendUser.id}),and(user_id.eq.${friendUser.id},friend_id.eq.${user.id})`)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking friendship:", checkError);
      return new Response(
        JSON.stringify({ error: "Failed to check friendship status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (existingFriendship) {
      return new Response(
        JSON.stringify({ error: "Friendship already exists" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create friend request
    const { data: friendship, error: insertError } = await supabaseClient
      .from("friendships")
      .insert({
        user_id: user.id,
        friend_id: friendUser.id,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating friendship:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to send friend request" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, friendship }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in add-friend-by-email function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
