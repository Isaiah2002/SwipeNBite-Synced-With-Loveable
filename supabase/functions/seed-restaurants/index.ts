import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Restaurant data to seed
const restaurants = [
  {
    id: '1',
    name: "Ben's Chili Bowl",
    cuisine: 'American',
    price: '$',
    rating: 4.6,
    distance: 0.8,
    image: '/src/assets/burrito.jpg',
    description: 'DC institution since 1958! Famous chili dogs and half-smokes. A must-try for every Howard student.',
    dietary: ['Vegetarian Options'],
    deals: 'Student discount with Howard ID',
    estimated_time: 12,
    latitude: 38.9170,
    longitude: -77.0281,
  },
  {
    id: '2',
    name: "Minya's Pizza",
    cuisine: 'Italian',
    price: '$',
    rating: 4.3,
    distance: 0.2,
    image: '/src/assets/pizza.jpg',
    description: 'Premium pizza delivery right to Howard campus. Open late for those study sessions!',
    dietary: ['Vegetarian', 'Gluten-Free Options'],
    deals: 'Free delivery to campus',
    estimated_time: 25,
    latitude: 38.9200,
    longitude: -77.0180,
  },
  {
    id: '3',
    name: 'Taco Bamba',
    cuisine: 'Mexican',
    price: '$$',
    rating: 4.7,
    distance: 1.5,
    image: '/src/assets/burrito.jpg',
    description: 'Vibrant Mexican fusion with creative tacos and great vibes. Perfect for a fun night out.',
    dietary: ['Vegetarian', 'Vegan Options', 'Gluten-Free'],
    deals: 'Happy hour 3-6 PM',
    estimated_time: 20,
    latitude: 38.9180,
    longitude: -77.0420,
  },
  {
    id: '4',
    name: 'The Coupe',
    cuisine: 'American',
    price: '$$',
    rating: 4.5,
    distance: 0.5,
    image: '/src/assets/diner.jpg',
    description: 'Cozy neighborhood spot with brunch, comfort food, and great coffee. Local favorite!',
    dietary: ['Vegetarian', 'Vegan Options'],
    estimated_time: 18,
    latitude: 38.9165,
    longitude: -77.0295,
  },
  {
    id: '5',
    name: 'Primero X',
    cuisine: 'Spanish',
    price: '$$',
    rating: 4.6,
    distance: 1.2,
    image: '/src/assets/px-tacos.jpg',
    description: 'Spanish tapas and craft cocktails in a chic setting. Great for date night!',
    dietary: ['Vegetarian Options', 'Gluten-Free'],
    estimated_time: 25,
    latitude: 38.9210,
    longitude: -77.0380,
  },
  {
    id: '6',
    name: 'NuVegan Cafe',
    cuisine: 'Vegan',
    price: '$',
    rating: 4.4,
    distance: 0.9,
    image: '/src/assets/salad.jpg',
    description: 'Delicious plant-based comfort food. Even non-vegans love it!',
    dietary: ['Vegan', 'Vegetarian'],
    deals: '10% student discount',
    estimated_time: 15,
    latitude: 38.9155,
    longitude: -77.0315,
  },
  {
    id: '7',
    name: 'Chick-fil-A',
    cuisine: 'American',
    price: '$',
    rating: 4.5,
    distance: 0.6,
    image: '/src/assets/burrito.jpg',
    description: 'Fast, friendly service with delicious chicken. A reliable choice!',
    dietary: ['Gluten-Free Options'],
    deals: 'Free rewards with app',
    estimated_time: 10,
    latitude: 38.9190,
    longitude: -77.0260,
  },
  {
    id: '8',
    name: 'Heat Da Spot',
    cuisine: 'Ethiopian',
    price: '$$',
    rating: 4.6,
    distance: 1.0,
    image: '/src/assets/indian.jpg',
    description: 'Authentic Ethiopian cuisine meets American breakfast. Unique fusion experience!',
    dietary: ['Vegetarian', 'Vegan Options'],
    estimated_time: 22,
    latitude: 38.9175,
    longitude: -77.0350,
  },
  {
    id: '9',
    name: 'Call Your Mother Deli',
    cuisine: 'Deli',
    price: '$$',
    rating: 4.7,
    distance: 1.8,
    image: '/src/assets/diner.jpg',
    description: 'Jewish deli with amazing bagels and sandwiches. Worth the short trip!',
    dietary: ['Vegetarian Options'],
    deals: 'Bagel of the month special',
    estimated_time: 20,
    latitude: 38.9220,
    longitude: -77.0450,
  }
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting restaurant seeding...');
    
    // Insert restaurants
    const { data: insertedRestaurants, error: restaurantError } = await supabase
      .from('restaurants')
      .upsert(restaurants, { onConflict: 'id' })
      .select();

    if (restaurantError) {
      console.error('Error inserting restaurants:', restaurantError);
      throw restaurantError;
    }

    console.log(`Successfully seeded ${insertedRestaurants?.length || 0} restaurants`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${insertedRestaurants?.length || 0} restaurants`,
        restaurants: insertedRestaurants
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Seed error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
