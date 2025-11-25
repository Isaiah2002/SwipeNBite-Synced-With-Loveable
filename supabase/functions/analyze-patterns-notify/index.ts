import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderPattern {
  userId: string;
  totalOrders: number;
  avgOrderValue: number;
  favoriteRestaurants: { id: string; name: string; count: number }[];
  lastOrderDate: string;
  typicalOrderTimes: number[];
}

interface SwipePattern {
  userId: string;
  favoriteCuisines: string[];
  pricePreference: string;
  lastSwipeDate: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting pattern analysis for notifications...');

    // Get all users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    console.log(`Analyzing patterns for ${profiles.length} users`);

    for (const profile of profiles) {
      const userId = profile.user_id;
      
      // Analyze order patterns
      const orderPattern = await analyzeOrderPattern(supabase, userId);
      
      // Analyze swipe patterns
      const swipePattern = await analyzeSwipePattern(supabase, userId);
      
      // Generate notifications based on patterns
      await generateNotifications(supabase, userId, orderPattern, swipePattern);
    }

    console.log('Pattern analysis completed');

    return new Response(
      JSON.stringify({ success: true, message: 'Notifications generated' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-patterns-notify:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function analyzeOrderPattern(supabase: any, userId: string): Promise<OrderPattern | null> {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !orders || orders.length === 0) {
    return null;
  }

  const totalOrders = orders.length;
  const avgOrderValue = orders.reduce((sum: number, o: any) => sum + o.total, 0) / totalOrders;
  
  const restaurantCounts: Record<string, { name: string; count: number }> = {};
  orders.forEach((order: any) => {
    if (!restaurantCounts[order.restaurant_id]) {
      restaurantCounts[order.restaurant_id] = { name: order.restaurant_name, count: 0 };
    }
    restaurantCounts[order.restaurant_id].count++;
  });

  const favoriteRestaurants = Object.entries(restaurantCounts)
    .map(([id, data]) => ({ id, name: data.name, count: data.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const orderTimes = orders.map((o: any) => new Date(o.created_at).getHours());
  
  return {
    userId,
    totalOrders,
    avgOrderValue,
    favoriteRestaurants,
    lastOrderDate: orders[0].created_at,
    typicalOrderTimes: orderTimes,
  };
}

async function analyzeSwipePattern(supabase: any, userId: string): Promise<SwipePattern | null> {
  const { data: swipes, error } = await supabase
    .from('swipe_events')
    .select('*')
    .eq('user_id', userId)
    .eq('swipe_direction', 'right')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !swipes || swipes.length === 0) {
    return null;
  }

  const cuisineCounts: Record<string, number> = {};
  const priceCounts: Record<string, number> = {};

  swipes.forEach((swipe: any) => {
    if (swipe.cuisine) {
      cuisineCounts[swipe.cuisine] = (cuisineCounts[swipe.cuisine] || 0) + 1;
    }
    if (swipe.price) {
      priceCounts[swipe.price] = (priceCounts[swipe.price] || 0) + 1;
    }
  });

  const favoriteCuisines = Object.entries(cuisineCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cuisine]) => cuisine);

  const pricePreference = Object.entries(priceCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || '$';

  return {
    userId,
    favoriteCuisines,
    pricePreference,
    lastSwipeDate: swipes[0].created_at,
  };
}

async function generateNotifications(
  supabase: any,
  userId: string,
  orderPattern: OrderPattern | null,
  swipePattern: SwipePattern | null
) {
  const notifications = [];
  const now = new Date();

  // Reminder for favorite restaurants (if haven't ordered in 7+ days)
  if (orderPattern && orderPattern.favoriteRestaurants.length > 0) {
    const daysSinceLastOrder = Math.floor(
      (now.getTime() - new Date(orderPattern.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastOrder >= 7) {
      const topRestaurant = orderPattern.favoriteRestaurants[0];
      notifications.push({
        user_id: userId,
        title: 'Missing your favorite?',
        message: `It's been a week since your last order. Craving ${topRestaurant.name}?`,
        type: 'reminder',
        restaurant_id: topRestaurant.id,
        restaurant_name: topRestaurant.name,
      });
    }
  }

  // Meal time suggestion based on typical ordering patterns
  if (orderPattern && orderPattern.typicalOrderTimes.length > 0) {
    const currentHour = now.getHours();
    const avgOrderHour = Math.round(
      orderPattern.typicalOrderTimes.reduce((a, b) => a + b, 0) / orderPattern.typicalOrderTimes.length
    );

    if (Math.abs(currentHour - avgOrderHour) <= 1) {
      notifications.push({
        user_id: userId,
        title: 'Time for a bite?',
        message: "It's around your usual dining time. Browse new restaurants!",
        type: 'reminder',
      });
    }
  }

  // Re-engagement for inactive users
  if (swipePattern) {
    const daysSinceLastSwipe = Math.floor(
      (now.getTime() - new Date(swipePattern.lastSwipeDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastSwipe >= 3) {
      const cuisineText = swipePattern.favoriteCuisines.length > 0
        ? swipePattern.favoriteCuisines[0]
        : 'delicious';
      
      notifications.push({
        user_id: userId,
        title: 'We miss you!',
        message: `New ${cuisineText} restaurants are waiting for you. Start swiping!`,
        type: 'recommendation',
      });
    }
  }

  // Insert notifications
  for (const notification of notifications) {
    const { error } = await supabase
      .from('notifications')
      .insert(notification);

    if (error) {
      console.error('Error inserting notification:', error);
    } else {
      console.log(`Notification created for user ${userId}: ${notification.title}`);
    }
  }
}
