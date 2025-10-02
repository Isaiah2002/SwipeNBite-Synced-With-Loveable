import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, UserPlus, Check, X } from 'lucide-react';
import { Restaurant } from '@/types/restaurant';

interface Friend {
  id: string;
  email: string;
  full_name?: string;
  status: string;
}

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: Restaurant;
}

export const ShareDialog = ({ open, onOpenChange, restaurant }: ShareDialogProps) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sharingTo, setSharingTo] = useState<string | null>(null);
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [addingFriend, setAddingFriend] = useState(false);

  useEffect(() => {
    if (open) {
      fetchFriends();
    }
  }, [open]);

  const fetchFriends = async () => {
    setLoading(true);
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
        setFriends([]);
        return;
      }

      // Get friend profiles with emails
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', friendIds);

      if (profilesError) throw profilesError;

      const friendsList: Friend[] = friendIds.map(id => {
        const profile = profilesData?.find(p => p.user_id === id);
        return {
          id,
          email: profile?.full_name || 'Friend',
          full_name: profile?.full_name,
          status: 'accepted'
        };
      });

      setFriends(friendsList);
    } catch (error: any) {
      console.error('Error fetching friends:', error);
      toast.error('Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    if (!newFriendEmail.trim()) return;

    setAddingFriend(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Find profile by full name (using it as a username/identifier)
      const { data: profileData, error: searchError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .eq('full_name', newFriendEmail.trim())
        .single();

      if (searchError || !profileData) {
        toast.error('User not found. Ask them for their username from their profile.');
        return;
      }

      if (profileData.user_id === user.id) {
        toast.error("You can't add yourself as a friend");
        return;
      }

      const friendUserId = profileData.user_id;

      // Create friendship
      const { error: friendshipError } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: friendUserId,
          status: 'accepted' // Auto-accept for now
        });

      if (friendshipError) {
        if (friendshipError.code === '23505') {
          toast.error('Already friends with this user');
        } else {
          throw friendshipError;
        }
        return;
      }

      toast.success('Friend added!');
      setNewFriendEmail('');
      fetchFriends();
    } catch (error: any) {
      console.error('Error adding friend:', error);
      toast.error('Failed to add friend');
    } finally {
      setAddingFriend(false);
    }
  };

  const handleShare = async (friendId: string) => {
    setSharingTo(friendId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('shared_restaurants')
        .insert({
          sender_id: user.id,
          recipient_id: friendId,
          restaurant_id: restaurant.id,
          restaurant_name: restaurant.name,
          cuisine: restaurant.cuisine,
          price: restaurant.price,
          rating: restaurant.rating,
          distance: restaurant.distance,
          image: restaurant.image,
          description: restaurant.description,
          dietary: restaurant.dietary,
          estimated_time: restaurant.estimatedTime,
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
          deals: restaurant.deals
        });

      if (error) throw error;

      const friend = friends.find(f => f.id === friendId);
      toast.success(`Shared ${restaurant.name} with ${friend?.full_name || friend?.email}!`);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error sharing restaurant:', error);
      toast.error('Failed to share restaurant');
    } finally {
      setSharingTo(null);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share {restaurant.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Friend Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Add a friend</label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Friend's username..."
                value={newFriendEmail}
                onChange={(e) => setNewFriendEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
                className="flex-1"
              />
              <Button 
                onClick={handleAddFriend} 
                disabled={addingFriend || !newFriendEmail.trim()}
                size="sm"
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Ask your friend for their username from their profile</p>
          </div>

          {/* Search Friends */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Friends List */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading friends...
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No friends found' : 'No friends yet. Add some friends to share restaurants!'}
              </div>
            ) : (
              filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                        {(friend.full_name || friend.email).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-card-foreground">
                        {friend.full_name || 'Friend'}
                      </div>
                      <div className="text-sm text-muted-foreground">@{friend.full_name || friend.id.substring(0, 8)}</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleShare(friend.id)}
                    disabled={sharingTo === friend.id}
                    className="gradient-primary text-primary-foreground border-0"
                  >
                    {sharingTo === friend.id ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
