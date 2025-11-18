import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, LogOut, Edit3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const addressSchema = z.object({
  address: z.string().trim().min(1, "Street address is required").max(200, "Address is too long"),
  city: z.string().trim().min(1, "City is required").max(100, "City is too long"),
  state: z.string().trim().min(2, "State is required").max(2, "State must be 2 characters").toUpperCase(),
  zipCode: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format (e.g., 12345 or 12345-6789)")
});

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
          .select('address, city, state, zip_code, favorite_cuisines')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setAddress(data.address || '');
          setCity(data.city || '');
          setState(data.state || '');
          setZipCode(data.zip_code || '');
          setSelectedCuisines(data.favorite_cuisines || []);
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="p-2"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
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

            {/* Cuisine Preferences Section */}
            {!isEditing && selectedCuisines.length > 0 && (
              <div className="p-3 bg-muted/50 rounded-xl">
                <h3 className="text-sm font-semibold text-card-foreground mb-2">Cuisine Preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCuisines.map(cuisine => (
                    <span key={cuisine} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {cuisine}
                    </span>
                  ))}
                </div>
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
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;