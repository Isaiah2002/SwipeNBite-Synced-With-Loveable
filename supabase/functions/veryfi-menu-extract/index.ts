import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VeryfiMenuItem {
  name: string;
  price?: number;
  description?: string;
  category?: string;
}

interface VeryfiMenuSection {
  category: string;
  items: VeryfiMenuItem[];
}

interface MenuExtractionRequest {
  restaurant_id: string;
  restaurant_name: string;
  website_url?: string;
  maps_url?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { restaurant_id, restaurant_name, website_url, maps_url } = await req.json() as MenuExtractionRequest;

    console.log(`Veryfi menu extraction for: ${restaurant_name}`);
    
    const VERYFI_CLIENT_ID = Deno.env.get('VERYFI_CLIENT_ID');
    const VERYFI_USERNAME = Deno.env.get('VERYFI_USERNAME');
    const VERYFI_API_KEY = Deno.env.get('VERYFI_API_KEY');
    const VERYFI_CLIENT_SECRET = Deno.env.get('VERYFI_CLIENT_SECRET');

    if (!VERYFI_CLIENT_ID || !VERYFI_USERNAME || !VERYFI_API_KEY || !VERYFI_CLIENT_SECRET) {
      throw new Error('Veryfi credentials not configured');
    }

    // Determine the URL to scrape
    const urlToScrape = website_url || maps_url;
    if (!urlToScrape) {
      console.log('No URL available for menu extraction');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No website or maps URL available' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Extracting menu from URL: ${urlToScrape}`);

    // Call Veryfi API for web scraping
    const veryfiResponse = await fetch('https://api.veryfi.com/api/v8/partner/documents/', {
      method: 'POST',
      headers: {
        'CLIENT-ID': VERYFI_CLIENT_ID,
        'AUTHORIZATION': `apikey ${VERYFI_USERNAME}:${VERYFI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_url: urlToScrape,
        categories: ['menu', 'food'],
        auto_delete: true, // Auto-delete after processing to save storage
      }),
    });

    if (!veryfiResponse.ok) {
      const errorText = await veryfiResponse.text();
      console.error(`Veryfi API error (${veryfiResponse.status}):`, errorText);
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Veryfi API returned ${veryfiResponse.status}`,
        details: errorText
      }), {
        status: veryfiResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const veryfiData = await veryfiResponse.json();
    console.log('Veryfi extraction successful');

    // Transform Veryfi response to menu format
    const menuSections: VeryfiMenuSection[] = [];
    
    // Veryfi returns line items which we need to parse into menu structure
    if (veryfiData.line_items && Array.isArray(veryfiData.line_items)) {
      const categoryMap = new Map<string, VeryfiMenuItem[]>();
      
      for (const item of veryfiData.line_items) {
        const category = item.category || 'Menu Items';
        const menuItem: VeryfiMenuItem = {
          name: item.description || item.text || 'Unknown Item',
          price: item.price || item.total,
          description: item.notes || undefined,
          category,
        };
        
        if (!categoryMap.has(category)) {
          categoryMap.set(category, []);
        }
        categoryMap.get(category)!.push(menuItem);
      }
      
      // Convert map to sections array
      for (const [category, items] of categoryMap.entries()) {
        menuSections.push({ category, items });
      }
    }

    console.log(`Extracted ${menuSections.length} menu sections with ${menuSections.reduce((sum, s) => sum + s.items.length, 0)} items`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update restaurant with extracted menu
    const { error: updateError } = await supabase
      .from('restaurants')
      .update({
        menu: menuSections.length > 0 ? menuSections : null,
        last_synced_at: new Date().toISOString(),
      })
      .eq('id', restaurant_id);

    if (updateError) {
      console.error('Error updating restaurant menu:', updateError);
      throw updateError;
    }

    console.log(`Menu successfully stored for restaurant ${restaurant_id}`);

    return new Response(JSON.stringify({
      success: true,
      restaurant_id,
      menu_sections: menuSections.length,
      total_items: menuSections.reduce((sum, s) => sum + s.items.length, 0),
      source: 'veryfi',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in veryfi-menu-extract:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
