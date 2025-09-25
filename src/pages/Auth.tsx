import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Mail, Lock, User, Phone, MapPin } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'reset';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Enhanced signup fields
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [pricePreference, setPricePreference] = useState<'$' | '$$' | '$$$'>('$$');
  const [maxDistancePreference, setMaxDistancePreference] = useState(10);
  const [favoriteCuisines, setFavoriteCuisines] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Handle URL params for different modes
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'reset') {
      setMode('reset');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else if (mode === 'signup') {
        const profileData = {
          address,
          city,
          state,
          zipCode,
          pricePreference,
          maxDistancePreference,
          favoriteCuisines,
          dietaryRestrictions
        };
        await signUp(email, password, fullName, phoneNumber, profileData);
      } else if (mode === 'reset') {
        await resetPassword(email);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhoneNumber('');
    setAddress('');
    setCity('');
    setState('');
    setZipCode('');
    setPricePreference('$$');
    setMaxDistancePreference(10);
    setFavoriteCuisines([]);
    setDietaryRestrictions([]);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent">
            SwipEats
          </h1>
          <p className="text-muted-foreground">
            {mode === 'login' && 'Welcome back! Sign in to continue swiping.'}
            {mode === 'signup' && 'Join SwipEats and discover your next favorite meal!'}
            {mode === 'reset' && 'Enter your email to reset your password.'}
          </p>
        </div>

        {/* Auth Card */}
        <Card className="swipe-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {mode === 'login' && 'Sign In'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'reset' && 'Reset Password'}
            </CardTitle>
            <CardDescription className="text-center">
              {mode === 'login' && 'Enter your email and password to continue'}
              {mode === 'signup' && 'Fill in your details to get started'}
              {mode === 'reset' && 'We\'ll send you a link to reset your password'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name - Signup only */}
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Phone Number - Signup only */}
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Address Fields - Signup only */}
              {mode === 'signup' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        type="text"
                        placeholder="123 Main St"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        type="text"
                        placeholder="New York"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        type="text"
                        placeholder="10001"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select value={state} onValueChange={setState} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="FL">Florida</SelectItem>
                        <SelectItem value="IL">Illinois</SelectItem>
                        <SelectItem value="PA">Pennsylvania</SelectItem>
                        <SelectItem value="OH">Ohio</SelectItem>
                        <SelectItem value="GA">Georgia</SelectItem>
                        <SelectItem value="NC">North Carolina</SelectItem>
                        <SelectItem value="MI">Michigan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pricePreference">Price Preference</Label>
                    <Select value={pricePreference} onValueChange={(value: '$' | '$$' | '$$$') => setPricePreference(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="$">$ - Budget Friendly</SelectItem>
                        <SelectItem value="$$">$$ - Moderate</SelectItem>
                        <SelectItem value="$$$">$$$ - Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxDistance">Maximum Distance (miles)</Label>
                    <Select value={maxDistancePreference.toString()} onValueChange={(value) => setMaxDistancePreference(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 miles</SelectItem>
                        <SelectItem value="10">10 miles</SelectItem>
                        <SelectItem value="15">15 miles</SelectItem>
                        <SelectItem value="25">25 miles</SelectItem>
                        <SelectItem value="50">50 miles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Favorite Cuisines (select all that apply)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Italian', 'Mexican', 'Asian', 'American', 'Indian', 'Thai', 'Mediterranean', 'Japanese'].map((cuisine) => (
                        <div key={cuisine} className="flex items-center space-x-2">
                          <Checkbox
                            id={cuisine}
                            checked={favoriteCuisines.includes(cuisine)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFavoriteCuisines([...favoriteCuisines, cuisine]);
                              } else {
                                setFavoriteCuisines(favoriteCuisines.filter(c => c !== cuisine));
                              }
                            }}
                          />
                          <Label htmlFor={cuisine} className="text-sm">{cuisine}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Dietary Restrictions (optional)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Keto', 'Halal', 'Kosher'].map((restriction) => (
                        <div key={restriction} className="flex items-center space-x-2">
                          <Checkbox
                            id={restriction}
                            checked={dietaryRestrictions.includes(restriction)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setDietaryRestrictions([...dietaryRestrictions, restriction]);
                              } else {
                                setDietaryRestrictions(dietaryRestrictions.filter(r => r !== restriction));
                              }
                            }}
                          />
                          <Label htmlFor={restriction} className="text-sm">{restriction}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Password - Not for reset */}
              {mode !== 'reset' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full gradient-primary text-primary-foreground border-0"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Please wait...</span>
                  </div>
                ) : (
                  <>
                    {mode === 'login' && 'Sign In'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'reset' && 'Send Reset Link'}
                  </>
                )}
              </Button>
            </form>

            {/* Navigation Links */}
            <div className="mt-6 space-y-3">
              {mode === 'login' && (
                <>
                  <button
                    type="button"
                    onClick={() => switchMode('reset')}
                    className="w-full text-sm text-primary hover:underline"
                  >
                    Forgot your password?
                  </button>
                  <div className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign up
                    </button>
                  </div>
                </>
              )}

              {mode === 'signup' && (
                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </div>
              )}

              {mode === 'reset' && (
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="w-full flex items-center justify-center space-x-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to sign in</span>
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          By continuing, you agree to SwipEats' Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
};

export default Auth;