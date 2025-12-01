import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LikedRestaurants } from '@/components/LikedRestaurants';
import { FriendsPicksTab } from '@/components/FriendsPicksTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Favorites = () => {
  const navigate = useNavigate();
  const [likedRestaurants, setLikedRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLikedRestaurants();
  }, []);

  const fetchLikedRestaurants = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('liked_restaurants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform to Restaurant type
      const transformedData = data?.map(item => ({
        id: item.restaurant_id,
        name: item.restaurant_name,
        cuisine: item.cuisine,
        rating: item.rating,
        price: item.price as '$' | '$$' | '$$$',
        distance: item.distance,
        image: item.image,
        description: item.description,
        dietary: item.dietary,
        estimatedTime: item.estimated_time,
        latitude: item.latitude,
        longitude: item.longitude,
        deals: item.deals
      })) || [];

      setLikedRestaurants(transformedData);
    } catch (error: any) {
      console.error('Error fetching liked restaurants:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (restaurantId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('liked_restaurants')
        .delete()
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId);

      if (error) throw error;

      setLikedRestaurants(prev => prev.filter(r => r.id !== restaurantId));
      toast.success('Removed from favorites');
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-card-foreground">Likes</h1>
          </div>

          {/* Content */}
          <Tabs defaultValue="my-favorites" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="my-favorites">My Likes</TabsTrigger>
              <TabsTrigger value="friends-picks">Friends' Picks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-favorites">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading favorites...</p>
                </div>
              ) : (
                <LikedRestaurants 
                  likedRestaurants={likedRestaurants}
                  onClose={() => navigate('/')}
                  showCloseButton={false}
                  onRemove={handleRemoveFavorite}
                />
              )}
            </TabsContent>
            
            <TabsContent value="friends-picks">
              <FriendsPicksTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Favorites;