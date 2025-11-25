import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'json';

    // Fetch all user data
    const [
      { data: profile },
      { data: orders },
      { data: locationHistory },
      { data: swipeEvents },
      { data: likedRestaurants },
      { data: notifications }
    ] = await Promise.all([
      supabaseClient.from('profiles').select('*').eq('user_id', user.id).single(),
      supabaseClient.from('orders').select('*').eq('user_id', user.id),
      supabaseClient.from('location_history').select('*').eq('user_id', user.id),
      supabaseClient.from('swipe_events').select('*').eq('user_id', user.id),
      supabaseClient.from('liked_restaurants').select('*').eq('user_id', user.id),
      supabaseClient.from('notifications').select('*').eq('user_id', user.id)
    ]);

    const userData = {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      profile: profile || {},
      orders: orders || [],
      location_history: locationHistory || [],
      swipe_events: swipeEvents || [],
      liked_restaurants: likedRestaurants || [],
      notifications: notifications || [],
      export_date: new Date().toISOString()
    };

    if (format === 'csv') {
      // Convert to CSV format
      let csv = 'Data Category,Count,Details\n';
      csv += `User,1,${user.email}\n`;
      csv += `Profile,1,"${JSON.stringify(profile).replace(/"/g, '""')}"\n`;
      csv += `Orders,${orders?.length || 0},"${JSON.stringify(orders).replace(/"/g, '""')}"\n`;
      csv += `Location History,${locationHistory?.length || 0},"${JSON.stringify(locationHistory).replace(/"/g, '""')}"\n`;
      csv += `Swipe Events,${swipeEvents?.length || 0},"${JSON.stringify(swipeEvents).replace(/"/g, '""')}"\n`;
      csv += `Liked Restaurants,${likedRestaurants?.length || 0},"${JSON.stringify(likedRestaurants).replace(/"/g, '""')}"\n`;
      csv += `Notifications,${notifications?.length || 0},"${JSON.stringify(notifications).replace(/"/g, '""')}"\n`;

      return new Response(csv, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="user-data-${user.id}.csv"`,
        },
      });
    }

    // Return JSON format
    return new Response(JSON.stringify(userData, null, 2), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="user-data-${user.id}.json"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
