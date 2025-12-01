import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, LogOut, Edit3, Settings, Trash2, UserPlus, Users, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { ProfileAnalytics } from '@/components/ProfileAnalytics';
import { NotificationCenter } from '@/components/NotificationCenter';
import { BudgetTracker } from '@/components/BudgetTracker';
import { BudgetSettings } from '@/components/BudgetSettings';
import { BudgetAnalytics } from '@/components/BudgetAnalytics';
import { PrivacyDashboard } from '@/components/PrivacyDashboard';
import { ConsentManagement } from '@/components/ConsentManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

const addressSchema = z.object({
  address: z.string().trim().min(1, "Street address is required").max(200, "Address is too long"),
  city: z.string().trim().min(1, "City is required").max(100, "City is too long"),
  state: z.string().trim().min(2, "State is required").max(2, "State must be 2 characters").toUpperCase(),
  zipCode: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format (e.g., 12345 or 12345-6789)")
});

const emailSchema = z.string().trim().email("Invalid email address").max(255, "Email is too long");

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('Food Lover');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [addressErrors, setAddressErrors] = useState<{ [key: string]: string }>({});
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [friendsDialogOpen, setFriendsDialogOpen] = useState(false);
  const [addFriendEmail, setAddFriendEmail] = useState('');
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);

  const cuisineOptions = [
    'Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai', 'Indian', 
    'American', 'Mediterranean', 'Korean', 'Vietnamese', 'Greek',
    'French', 'Spanish', 'Ethiopian', 'Caribbean', 'Middle Eastern',
    'Pizza', 'Burgers', 'Seafood', 'Steakhouse', 'Vegan', 'Vegetarian'
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('address, city, state, zip_code, favorite_cuisines, daily_budget, weekly_budget, monthly_budget')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setAddress(data.address || '');
          setCity(data.city || '');
          setState(data.state || '');
          setZipCode(data.zip_code || '');
          setSelectedCuisines(data.favorite_cuisines || []);
          setProfile(data);
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
      }
    };

    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('created_at, total')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (error: any) {
        console.error('Error fetching orders:', error);
      }
    };

    const fetchFriendships = async () => {
      if (!user) return;
      
      try {
        // Fetch pending friend requests (where user is recipient)
        const { data: requests, error: reqError } = await supabase
          .from('friendships')
          .select('*, profiles!friendships_user_id_fkey(full_name)')
          .eq('friend_id', user.id)
          .eq('status', 'pending');

        if (reqError) throw reqError;
        setFriendRequests(requests || []);

        // Fetch accepted friends
        const { data: acceptedFriends, error: friendsError } = await supabase
          .from('friendships')
          .select('*, profiles!friendships_friend_id_fkey(full_name)')
          .eq('user_id', user.id)
          .eq('status', 'accepted');

        const { data: acceptedFriendsReverse, error: friendsReverseError } = await supabase
          .from('friendships')
          .select('*, profiles!friendships_user_id_fkey(full_name)')
          .eq('friend_id', user.id)
          .eq('status', 'accepted');

        if (friendsError || friendsReverseError) throw friendsError || friendsReverseError;
        
        setFriends([...(acceptedFriends || []), ...(acceptedFriendsReverse || [])]);
      } catch (error: any) {
        console.error('Error fetching friendships:', error);
      }
    };

    fetchProfile();
    fetchOrders();
    fetchFriendships();
  }, [user]);

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleSaveAddress = async () => {
    if (!user) return;
    
    // Validate form
    try {
      addressSchema.parse({ address, city, state, zipCode });
      setAddressErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setAddressErrors(errors);
        toast.error('Please fix the errors in the form');
        return;
      }
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          address: address.trim(),
          city: city.trim(),
          state: state.trim().toUpperCase(),
          zip_code: zipCode.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Delivery address saved!');
      setSettingsOpen(false);
    } catch (error: any) {
      console.error('Error updating address:', error);
      toast.error('Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          favorite_cuisines: selectedCuisines,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Preferences saved!');
      setPreferencesOpen(false);
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines(prev =>
      prev.includes(cuisine)
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const handleAddFriend = async () => {
    if (!user) return;
    
    // Validate email
    try {
      emailSchema.parse(addFriendEmail);
    } catch (error) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (addFriendEmail === user.email) {
      toast.error("You can't add yourself as a friend");
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('add-friend-by-email', {
        body: { friendEmail: addFriendEmail }
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success('Friend request sent!');
      setAddFriendEmail('');
      setFriendsDialogOpen(false);
      
      // Refresh page to update friend lists
      window.location.reload();
    } catch (error: any) {
      console.error('Error adding friend:', error);
      toast.error('Failed to send friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptFriend = async (friendshipId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success('Friend request accepted!');
      
      // Refresh friendships
      setFriendRequests(prev => prev.filter(f => f.id !== friendshipId));
      window.location.reload();
    } catch (error: any) {
      console.error('Error accepting friend:', error);
      toast.error('Failed to accept friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectFriend = async (friendshipId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success('Friend request rejected');
      setFriendRequests(prev => prev.filter(f => f.id !== friendshipId));
    } catch (error: any) {
      console.error('Error rejecting friend:', error);
      toast.error('Failed to reject friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Delete user data from all tables
      const deletePromises = [
        supabase.from('swipe_events').delete().eq('user_id', user.id),
        supabase.from('liked_restaurants').delete().eq('user_id', user.id),
        supabase.from('orders').delete().eq('user_id', user.id),
        supabase.from('location_history').delete().eq('user_id', user.id),
        supabase.from('recommendation_feedback').delete().eq('user_id', user.id),
        supabase.from('recommendation_interactions').delete().eq('user_id', user.id),
        supabase.from('ab_test_assignments').delete().eq('user_id', user.id),
        supabase.from('shared_restaurants').delete().eq('sender_id', user.id),
        supabase.from('shared_restaurants').delete().eq('recipient_id', user.id),
        supabase.from('friendships').delete().eq('user_id', user.id),
        supabase.from('friendships').delete().eq('friend_id', user.id),
        supabase.from('profiles').delete().eq('user_id', user.id),
      ];

      await Promise.all(deletePromises);

      // Delete the auth user - this will trigger cascade delete for remaining references
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (authError) {
        // If admin delete fails, try user delete
        await supabase.auth.signOut();
      }

      toast.success('Account deleted successfully');
      navigate('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasAddress = address && city && state && zipCode;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold text-card-foreground">Profile</h1>
            </div>
            <div className="flex items-center space-x-2">
              <NotificationCenter />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="p-2"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-card rounded-2xl p-6 border border-border/50 space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-primary-foreground" />
              </div>
              {isEditing ? (
                <div className="space-y-2 w-full">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="text-center"
                  />
                </div>
              ) : (
                <h2 className="text-xl font-semibold text-card-foreground">{displayName}</h2>
              )}
            </div>

            {/* User Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-xl">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span className="text-card-foreground">{user?.email}</span>
              </div>
            </div>

            {/* Delivery Address Section */}
            {hasAddress && !isEditing && (
              <div className="p-3 bg-muted/50 rounded-xl">
                <h3 className="text-sm font-semibold text-card-foreground mb-2">Delivery Address</h3>
                <p className="text-sm text-muted-foreground">
                  {address}, {city}, {state} {zipCode}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {isEditing ? (
                <div className="flex space-x-3">
                  <Button
                    onClick={handleSave}
                    className="gradient-primary text-primary-foreground border-0 flex-1"
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full flex items-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>{hasAddress ? 'Change Address' : 'Set Address'}</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Delivery Address</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="address">Street Address</Label>
                          <Input
                            id="address"
                            value={address}
                            onChange={(e) => {
                              setAddress(e.target.value);
                              if (addressErrors.address) {
                                setAddressErrors({ ...addressErrors, address: '' });
                              }
                            }}
                            placeholder="123 Main St"
                            className={addressErrors.address ? 'border-destructive' : ''}
                          />
                          {addressErrors.address && (
                            <p className="text-sm text-destructive">{addressErrors.address}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={city}
                            onChange={(e) => {
                              setCity(e.target.value);
                              if (addressErrors.city) {
                                setAddressErrors({ ...addressErrors, city: '' });
                              }
                            }}
                            placeholder="Washington"
                            className={addressErrors.city ? 'border-destructive' : ''}
                          />
                          {addressErrors.city && (
                            <p className="text-sm text-destructive">{addressErrors.city}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              value={state}
                              onChange={(e) => {
                                setState(e.target.value.toUpperCase());
                                if (addressErrors.state) {
                                  setAddressErrors({ ...addressErrors, state: '' });
                                }
                              }}
                              placeholder="DC"
                              maxLength={2}
                              className={addressErrors.state ? 'border-destructive' : ''}
                            />
                            {addressErrors.state && (
                              <p className="text-sm text-destructive">{addressErrors.state}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zipCode">ZIP Code</Label>
                            <Input
                              id="zipCode"
                              value={zipCode}
                              onChange={(e) => {
                                setZipCode(e.target.value);
                                if (addressErrors.zipCode) {
                                  setAddressErrors({ ...addressErrors, zipCode: '' });
                                }
                              }}
                              placeholder="20001"
                              maxLength={10}
                              className={addressErrors.zipCode ? 'border-destructive' : ''}
                            />
                            {addressErrors.zipCode && (
                              <p className="text-sm text-destructive">{addressErrors.zipCode}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={handleSaveAddress}
                          disabled={loading}
                          className="w-full gradient-primary text-primary-foreground border-0"
                        >
                          {loading ? 'Saving...' : 'Save Address'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full flex items-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Preferences</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Food Preferences</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <p className="text-sm text-muted-foreground">
                          Select your favorite cuisines to personalize your restaurant recommendations
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {cuisineOptions.map(cuisine => (
                            <button
                              key={cuisine}
                              onClick={() => toggleCuisine(cuisine)}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                selectedCuisines.includes(cuisine)
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border bg-background text-foreground hover:border-primary/50'
                              }`}
                            >
                              <span className="text-sm font-medium">{cuisine}</span>
                            </button>
                          ))}
                        </div>
                        <Button
                          onClick={handleSavePreferences}
                          disabled={loading}
                          className="w-full gradient-primary text-primary-foreground border-0"
                        >
                          {loading ? 'Saving...' : 'Save Preferences'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={friendsDialogOpen} onOpenChange={setFriendsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full flex items-center space-x-2"
                      >
                        <Users className="w-4 h-4" />
                        <span>Friends ({friends.length})</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Friends</DialogTitle>
                        <DialogDescription>
                          Manage your friends and send friend requests
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 pt-4">
                        {/* Add Friend Section */}
                        <div className="space-y-3">
                          <Label htmlFor="friendEmail">Add Friend by Email</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="friendEmail"
                              type="email"
                              placeholder="friend@example.com"
                              value={addFriendEmail}
                              onChange={(e) => setAddFriendEmail(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
                            />
                            <Button
                              onClick={handleAddFriend}
                              disabled={loading}
                              size="icon"
                            >
                              <UserPlus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Pending Requests */}
                        {friendRequests.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-card-foreground">
                              Pending Requests ({friendRequests.length})
                            </h3>
                            <div className="space-y-2">
                              {friendRequests.map((request) => (
                                <Card key={request.id} className="p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-muted-foreground" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm text-card-foreground">
                                          {request.profiles?.full_name || 'Friend'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          wants to be friends
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex space-x-1">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                        onClick={() => handleAcceptFriend(request.id)}
                                        disabled={loading}
                                      >
                                        <Check className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleRejectFriend(request.id)}
                                        disabled={loading}
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Friends List */}
                        <div className="space-y-3">
                          <h3 className="text-sm font-semibold text-card-foreground">
                            Your Friends ({friends.length})
                          </h3>
                          {friends.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No friends yet. Add friends by email to get started!
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {friends.map((friend) => (
                                <Card key={friend.id} className="p-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                                      <User className="w-5 h-5 text-primary-foreground" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm text-card-foreground">
                                        {friend.profiles?.full_name || 'Friend'}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Friends since {new Date(friend.created_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    onClick={signOut}
                    variant="outline"
                    className="w-full flex items-center space-x-2 text-destructive border-destructive/20 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Budget & Analytics Dashboard */}
          <div className="mt-6 space-y-6">
            <h2 className="text-xl font-bold text-card-foreground">Budget & Spending</h2>
            <Tabs defaultValue="tracker" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tracker">Current</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="tracker" className="space-y-4 mt-4">
                <BudgetTracker />
              </TabsContent>
              <TabsContent value="analytics" className="space-y-4 mt-4">
                <BudgetAnalytics 
                  orders={orders}
                  dailyBudget={profile?.daily_budget}
                  weeklyBudget={profile?.weekly_budget}
                  monthlyBudget={profile?.monthly_budget}
                />
              </TabsContent>
              <TabsContent value="settings" className="space-y-4 mt-4">
                <BudgetSettings />
              </TabsContent>
            </Tabs>
            
            <h2 className="text-xl font-bold text-card-foreground mt-8">Your Analytics</h2>
            <ProfileAnalytics />
            
            <h2 className="text-xl font-bold text-card-foreground mt-8">Privacy & Data</h2>
            <PrivacyDashboard />
            <ConsentManagement />
            
            {/* Delete Account Section */}
            <div className="mt-8 p-6 bg-card rounded-2xl border border-destructive/20">
              <h2 className="text-xl font-bold text-destructive mb-2">Danger Zone</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete your account, there is no going back. All your data will be permanently removed.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive"
                    className="w-full flex items-center space-x-2"
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Profile information</li>
                        <li>Order history</li>
                        <li>Liked restaurants</li>
                        <li>Swipe history</li>
                        <li>Location data</li>
                        <li>All other personal data</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete My Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;