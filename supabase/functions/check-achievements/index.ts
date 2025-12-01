import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user statistics
    const [swipeCount, shareCount, friendCount, orderCount, likeCount] = await Promise.all([
      supabaseClient.from('swipe_events').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabaseClient.from('shared_restaurants').select('id', { count: 'exact', head: true }).eq('sender_id', user.id),
      supabaseClient.from('friendships').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'accepted'),
      supabaseClient.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabaseClient.from('liked_restaurants').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ]);

    const stats = {
      swipe_count: swipeCount.count || 0,
      share_count: shareCount.count || 0,
      friend_count: friendCount.count || 0,
      order_count: orderCount.count || 0,
      like_count: likeCount.count || 0,
    };

    console.log('User stats:', stats);

    // Get all achievements
    const { data: achievements, error: achievementsError } = await supabaseClient
      .from('achievements')
      .select('*');

    if (achievementsError) {
      throw achievementsError;
    }

    // Get already unlocked achievements
    const { data: unlockedAchievements, error: unlockedError } = await supabaseClient
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id);

    if (unlockedError) {
      throw unlockedError;
    }

    const unlockedIds = new Set(unlockedAchievements?.map(ua => ua.achievement_id) || []);
    const newlyUnlocked = [];

    // Check each achievement
    for (const achievement of achievements || []) {
      if (unlockedIds.has(achievement.id)) {
        continue; // Already unlocked
      }

      const criteriaValue = stats[achievement.criteria_type as keyof typeof stats];
      
      if (criteriaValue >= achievement.criteria_threshold) {
        // Award achievement
        const { error: insertError } = await supabaseClient
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_id: achievement.id,
          });

        if (!insertError) {
          newlyUnlocked.push(achievement);
          console.log('Awarded achievement:', achievement.name);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        newlyUnlocked,
        stats 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error checking achievements:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});