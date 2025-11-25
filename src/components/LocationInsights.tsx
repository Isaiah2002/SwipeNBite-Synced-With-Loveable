import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, TrendingUp, Navigation } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { toast } from 'sonner';

interface LocationInsights {
  topNeighborhoods: { area: string; count: number; avgDistance: number }[];
  avgOrderDistance: number;
  preferredDistanceRange: string;
  locationPatterns: { cuisine: string; avgDistance: number }[];
}

export const LocationInsights = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<LocationInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [proximityEnabled, setProximityEnabled] = useState(false);
  const { location, requestLocation, startTracking } = useLocationTracking(proximityEnabled);

  useEffect(() => {
    if (user) {
      loadInsights();
    }
  }, [user]);

  const loadInsights = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-location-patterns');

      if (error) throw error;

      setInsights(data.insights);
    } catch (error) {
      console.error('Error loading location insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const enableProximityAlerts = async () => {
    await requestLocation();
    
    if (location.permissionGranted) {
      setProximityEnabled(true);
      startTracking();
      toast.success('Real-time geofencing enabled! You\'ll be notified when near favorites or new places.');
    } else {
      toast.error('Location permission required for proximity alerts');
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Location Insights</h3>
        </div>
        <p className="text-sm text-muted-foreground">Loading location data...</p>
      </Card>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Location Insights</h3>
          </div>
          <Button
            variant={proximityEnabled ? "default" : "outline"}
            size="sm"
            onClick={enableProximityAlerts}
            disabled={proximityEnabled}
            className="gap-2"
          >
            <Navigation className="w-4 h-4" />
            {proximityEnabled ? 'Alerts Active' : 'Enable Alerts'}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Distance Preferences */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium">Distance Preferences</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm">
                Avg: {insights.avgOrderDistance} mi
              </Badge>
              <Badge variant="outline" className="text-sm">
                {insights.preferredDistanceRange}
              </Badge>
            </div>
          </div>

          {/* Top Neighborhoods */}
          {insights.topNeighborhoods.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Top Neighborhoods</p>
              <div className="space-y-2">
                {insights.topNeighborhoods.slice(0, 3).map((neighborhood, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                  >
                    <span className="text-sm">{neighborhood.area}</span>
                    <Badge variant="secondary" className="text-xs">
                      {neighborhood.count} {neighborhood.count === 1 ? 'order' : 'orders'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cuisine-Distance Patterns */}
          {insights.locationPatterns.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Cuisine by Distance</p>
              <div className="space-y-2">
                {insights.locationPatterns.slice(0, 3).map((pattern, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                  >
                    <span className="text-sm">{pattern.cuisine}</span>
                    <span className="text-xs text-muted-foreground">
                      ~{pattern.avgDistance.toFixed(1)} mi
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {proximityEnabled && location.latitude && location.longitude && (
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-xs text-primary font-medium">
                📍 Tracking enabled - You'll get alerts when near your favorites!
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
