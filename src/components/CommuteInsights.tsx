import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, Clock, MapPin, Navigation } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { toast } from 'sonner';

interface CommutePattern {
  dayOfWeek: number;
  hourOfDay: number;
  frequency: number;
  timeLabel: string;
  isWeekday: boolean;
}

interface MealTime {
  type: string;
  hour: number;
  frequency: number;
}

interface CommuteData {
  hasCommutePattern: boolean;
  commutePatterns: CommutePattern[];
  typicalMealTimes: MealTime[];
  dataPoints: number;
}

export const CommuteInsights = () => {
  const { user } = useAuth();
  const [commuteData, setCommuteData] = useState<CommuteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const { location, startTracking } = useLocationTracking(trackingEnabled);

  useEffect(() => {
    if (user) {
      loadCommuteData();
    }
  }, [user]);

  const loadCommuteData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-commute-patterns');

      if (error) throw error;

      if (data.patterns) {
        setCommuteData(data.patterns);
      }
    } catch (error) {
      console.error('Error loading commute data:', error);
    } finally {
      setLoading(false);
    }
  };

  const enableCommuteTracking = () => {
    setTrackingEnabled(true);
    startTracking();
    toast.success('Commute tracking enabled! We\'ll learn your routes and suggest restaurants along the way.');
  };

  const getDayName = (day: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  const formatTime = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Car className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Commute Insights</h3>
        </div>
        <p className="text-sm text-muted-foreground">Analyzing your routes...</p>
      </Card>
    );
  }

  if (!commuteData || !commuteData.hasCommutePattern) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Commute Insights</h3>
          </div>
          <Button
            variant={trackingEnabled ? "default" : "outline"}
            size="sm"
            onClick={enableCommuteTracking}
            disabled={trackingEnabled}
            className="gap-2"
          >
            <Navigation className="w-4 h-4" />
            {trackingEnabled ? 'Tracking Active' : 'Start Tracking'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {trackingEnabled 
            ? 'Building your commute profile... Check back after a few trips!'
            : 'Enable tracking to get smart restaurant suggestions along your regular routes.'}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Commute Insights</h3>
        </div>
        <Badge variant="secondary" className="gap-1">
          <MapPin className="w-3 h-3" />
          {commuteData.dataPoints} locations tracked
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Commute Patterns */}
        {commuteData.commutePatterns.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium">Regular Commute Times</p>
            </div>
            <div className="space-y-2">
              {commuteData.commutePatterns.slice(0, 3).map((pattern, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{pattern.timeLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      Weekdays around {formatTime(pattern.hourOfDay)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {pattern.frequency} trips
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Typical Meal Times */}
        {commuteData.typicalMealTimes && commuteData.typicalMealTimes.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-3">Your Meal Times</p>
            <div className="flex flex-wrap gap-2">
              {commuteData.typicalMealTimes.map((meal, index) => (
                <Badge key={index} variant="secondary" className="text-sm capitalize">
                  {meal.type}: {formatTime(meal.hour)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {trackingEnabled && location.latitude && location.longitude && (
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-xs text-primary font-medium">
              🚗 Smart suggestions enabled - We'll notify you about restaurants along your routes at meal times!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
