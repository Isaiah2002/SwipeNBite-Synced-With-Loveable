import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MapPin, DollarSign, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FriendRestaurant {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  cuisine: string;
  price: string;
  rating: number;
  distance: number;
  image: string;
  description: string;
  deals?: string;
  user_id: string;
  friend_name?: string;
  friend_email?: string;
}

export const FriendsPicksTab = () => {
  const navigate = useNavigate();
  const [friendsLikes, setFriendsLikes] = useState<FriendRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriendsLikes();
  }, []);

  const fetchFriendsLikes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get accepted friendships
      const { data: friendshipsData, error: friendshipsError } = await supabase
        .from('friendships')
        .select('*')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (friendshipsError) throw friendshipsError;

      // Get friend user IDs
      const friendIds = friendshipsData?.map(f => 
        f.user_id === user.id ? f.friend_id : f.user_id
      ) || [];

      if (friendIds.length === 0) {
        setFriendsLikes([]);
        setLoading(false);
        return;
      }

      // Get friends' liked restaurants
      const { data: likesData, error: likesError } = await supabase
        .from('liked_restaurants')
        .select('*')
        .in('user_id', friendIds)
        .order('created_at', { ascending: false });

      if (likesError) throw likesError;

      // Get friend profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', friendIds);

      // Combine data
      const enrichedLikes: FriendRestaurant[] = likesData?.map(like => {
        const profile = profilesData?.find(p => p.user_id === like.user_id);
        return {
          ...like,
          friend_name: profile?.full_name || 'Friend',
          friend_email: profile?.full_name || like.user_id.substring(0, 8)
        };
      }) || [];

      setFriendsLikes(enrichedLikes);
    } catch (error: any) {
      console.error('Error fetching friends likes:', error);
      toast.error('Failed to load friends\' favorites');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading friends' picks...</p>
      </div>
    );
  }

  if (friendsLikes.length === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-lg font-semibold text-card-foreground">No friends' picks yet</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Add friends and see their favorite restaurants here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {friendsLikes.map((like) => (
        <div
          key={like.id}
          className="bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer"
          onClick={() => navigate(`/restaurant/${like.restaurant_id}`)}
        >
          <div className="flex gap-4 p-4">
            {/* Restaurant Image */}
            <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
              <img 
                src={like.image} 
                alt={like.restaurant_name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Restaurant Info */}
            <div className="flex-1 min-w-0">
              <div className="space-y-2">
                {/* Header */}
                <div>
                  <h3 className="font-bold text-card-foreground truncate">
                    {like.restaurant_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {like.cuisine}
                  </p>
                </div>

                {/* Details */}
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{like.distance.toFixed(1)} mi</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span className="font-medium">{like.price}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
                    <span className="font-medium text-card-foreground">{like.rating}</span>
                  </div>
                </div>

                {/* Friend Info */}
                <div className="text-xs text-muted-foreground pt-1 border-t border-border/30">
                  Liked by {like.friend_name || like.friend_email}
                </div>

                {/* Deal Badge */}
                {like.deals && (
                  <div className="inline-block px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded-md">
                    {like.deals}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
