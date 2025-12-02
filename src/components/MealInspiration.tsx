import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, ChefHat, ThermometerSun, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MealSuggestion {
  mealType: string;
  reason: string;
  restaurants: any[];
  confidence: number;
}

interface InspirationResponse {
  success: boolean;
  suggestions: MealSuggestion[];
  context: {
    mealType: string;
    weather: string;
    temperature: number;
  };
}

export const MealInspiration = () => {
  const { user } = useAuth();
  const { location } = useLocation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [inspiration, setInspiration] = useState<InspirationResponse | null>(null);

  const loadInspiration = async () => {
    if (!user || !location) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('meal-inspiration', {
        body: { 
          latitude: location.latitude, 
          longitude: location.longitude 
        }
      });

      if (error) throw error;

      setInspiration(data);
    } catch (error) {
      console.error('Error loading inspiration:', error);
      toast({
        title: "Couldn't load inspiration",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInspiration();
  }, [user, location]);

  if (!user || !location) return null;

  if (loading) {
    return (
      <Card className="p-6 mb-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          <h2 className="text-xl font-semibold">Loading Inspiration...</h2>
        </div>
      </Card>
    );
  }

  if (!inspiration?.suggestions || inspiration.suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-4">
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">Meal Inspiration</h2>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {inspiration.context.mealType}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <ThermometerSun className="w-3 h-3" />
            {Math.round(inspiration.context.temperature)}°F - {inspiration.context.weather}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Based on the time, weather, and your preferences, here are some personalized suggestions:
        </p>

        <div className="space-y-4">
          {inspiration.suggestions.slice(0, 3).map((suggestion, idx) => (
            <Card key={idx} className="p-4 bg-background hover:bg-accent/5 transition-colors">
              <div className="flex items-start gap-3">
                <ChefHat className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1">{suggestion.mealType}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{suggestion.reason}</p>
                  
                  {suggestion.restaurants.length > 0 && (
                    <div className="space-y-2">
                      {suggestion.restaurants.slice(0, 2).map((restaurant) => (
                        <div 
                          key={restaurant.id}
                          className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer"
                          onClick={() => navigate(`/order/${restaurant.id}`)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{restaurant.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{restaurant.cuisine}</span>
                              <span>•</span>
                              <span>{restaurant.price}</span>
                              <span>•</span>
                              <span>⭐ {restaurant.rating}</span>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button 
          onClick={loadInspiration} 
          variant="outline" 
          className="w-full mt-4"
          disabled={loading}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Refresh Suggestions
        </Button>
      </Card>
    </div>
  );
};