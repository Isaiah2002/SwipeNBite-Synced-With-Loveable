import { ArrowLeft, Star, MapPin, Clock, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { restaurants } from '@/data/restaurants';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MenuItem, Restaurant } from '@/types/restaurant';
import { supabase } from '@/integrations/supabase/client';
import { useRestaurantData } from '@/hooks/useRestaurantData';

const RestaurantOrder = () => {
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const { toast } = useToast();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch restaurant data - try liked_restaurants first, but always merge with static menu data
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        // First, get the static restaurant data (contains menu)
        const staticRestaurant = restaurants.find(r => r.id === restaurantId);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from('liked_restaurants')
            .select('*')
            .eq('user_id', user.id)
            .eq('restaurant_id', restaurantId)
            .single();

          if (data && !error) {
            // Merge liked restaurant data with static menu
            setRestaurant({
              id: data.restaurant_id,
              name: data.restaurant_name,
              cuisine: data.cuisine,
              rating: data.rating,
              price: data.price as '$' | '$$' | '$$$',
              distance: data.distance,
              image: data.image,
              description: data.description,
              dietary: data.dietary,
              estimatedTime: data.estimated_time,
              latitude: data.latitude,
              longitude: data.longitude,
              deals: data.deals,
              menu: staticRestaurant?.menu || [] // Include menu from static data
            });
            setLoading(false);
            return;
          }
        }

        // Fallback to static data
        setRestaurant(staticRestaurant || null);
      } catch (error) {
        console.error('Error fetching restaurant:', error);
        const staticRestaurant = restaurants.find(r => r.id === restaurantId);
        setRestaurant(staticRestaurant || null);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId]);

  // Fetch enriched data including Documenu menu
  const { enrichedRestaurant, loading: menuLoading } = useRestaurantData(
    restaurant || { id: '', name: '', cuisine: '', price: '$', rating: 0, distance: 0, image: '', description: '', dietary: [], estimatedTime: 0 },
    !!restaurant
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold text-card-foreground">Restaurant not found</h2>
          <Button onClick={() => navigate('/favorites')}>
            Back to Favorites
          </Button>
        </div>
      </div>
    );
  }

  // Convert Documenu menu items to MenuItem format or use restaurant's static menu
  let menuItems: MenuItem[] = [];
  
  if (enrichedRestaurant.menuItems && enrichedRestaurant.menuItems.length > 0) {
    // Use Documenu data if available
    enrichedRestaurant.menuItems.forEach((section) => {
      section.menu_items.forEach((item, index) => {
        const priceNum = item.price ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : undefined;
        menuItems.push({
          id: `${section.section_name}-${index}`,
          name: item.name,
          description: item.description || '',
          price: priceNum,
          category: section.section_name
        });
      });
    });
  } else if (restaurant.menu && restaurant.menu.length > 0) {
    // Use restaurant's static menu data
    menuItems = restaurant.menu;
  }

  const addToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = menuItems.find(i => i.id === itemId);
      return total + (item?.price || 0) * quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const handleCheckout = () => {
    toast({
      title: "Order placed!",
      description: `Your order from ${restaurant.name} has been placed successfully.`,
    });
    navigate('/orders');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative">
        <img 
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/favorites')}
          className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h1 className="text-2xl font-bold">{restaurant.name}</h1>
          <p className="text-sm opacity-90">{restaurant.description}</p>
          
          <div className="flex items-center space-x-4 mt-2 text-sm">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>{restaurant.rating}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{restaurant.distance} mi</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{restaurant.estimatedTime} min</span>
            </div>
          </div>

          {restaurant.deals && (
            <div className="mt-2 text-sm font-medium bg-secondary/20 px-3 py-1 rounded-full inline-block">
              🎯 {restaurant.deals}
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="p-4 pb-32">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold text-card-foreground mb-6">Menu</h2>
          
          {menuLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading menu from Documenu...</p>
            </div>
          ) : menuItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No menu available for this restaurant</p>
            </div>
          ) : (
            <div className="space-y-4">
            {menuItems.map((item) => (
              <div key={item.id} className="swipe-card p-0 overflow-hidden">
                {item.image && (
                  <img 
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-card-foreground">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      )}
                      {item.price && (
                        <p className="text-lg font-bold text-card-foreground mt-2">
                          ${item.price.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">
                      {item.category}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      {cart[item.id] > 0 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {cart[item.id]}
                          </span>
                        </>
                      )}
                      <Button
                        size="sm"
                        onClick={() => addToCart(item.id)}
                        className="gradient-primary text-primary-foreground border-0 w-8 h-8 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>

      {/* Cart Footer */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''}
              </span>
              <span className="text-xl font-bold text-card-foreground">
                ${getCartTotal().toFixed(2)}
              </span>
            </div>
            <Button 
              onClick={handleCheckout}
              className="w-full gradient-primary text-primary-foreground border-0"
              size="lg"
            >
              Place Order
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantOrder;