import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, MapPin, BarChart3, Bell, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConsentSettings {
  location_tracking_consent: boolean;
  analytics_consent: boolean;
  notifications_consent: boolean;
}

export const ConsentManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [consents, setConsents] = useState<ConsentSettings>({
    location_tracking_consent: false,
    analytics_consent: false,
    notifications_consent: false
  });

  useEffect(() => {
    fetchConsents();
  }, [user]);

  const fetchConsents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('location_tracking_consent, analytics_consent, notifications_consent')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setConsents({
          location_tracking_consent: data.location_tracking_consent || false,
          analytics_consent: data.analytics_consent || false,
          notifications_consent: data.notifications_consent || false
        });
      }
    } catch (error: any) {
      console.error('Error fetching consents:', error);
    }
  };

  const updateConsent = async (key: keyof ConsentSettings, value: boolean) => {
    if (!user) return;

    setLoading(true);
    try {
      const updateData: any = {
        [key]: value,
        consent_updated_at: new Date().toISOString()
      };

      // If this is the first consent being given, set consent_given_at
      if (value && !consents.location_tracking_consent && !consents.analytics_consent && !consents.notifications_consent) {
        updateData.consent_given_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;

      setConsents(prev => ({ ...prev, [key]: value }));
      
      const consentName = key.replace('_consent', '').replace(/_/g, ' ');
      toast.success(`${consentName} ${value ? 'enabled' : 'disabled'}`);

      // If disabling location tracking, offer to delete history
      if (key === 'location_tracking_consent' && !value) {
        toast.info('Location history will no longer be collected. Visit Privacy Dashboard to delete existing data.');
      }
    } catch (error: any) {
      console.error('Error updating consent:', error);
      toast.error('Failed to update consent');
    } finally {
      setLoading(false);
    }
  };

  const consentOptions = [
    {
      id: 'location_tracking_consent' as keyof ConsentSettings,
      icon: MapPin,
      title: 'Location Tracking',
      description: 'Allow us to track your location for commute suggestions and proximity alerts',
      warning: 'Required for location-based features like commute patterns and nearby restaurant notifications',
      color: 'text-green-500'
    },
    {
      id: 'analytics_consent' as keyof ConsentSettings,
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Collect data about your ordering patterns to provide personalized insights',
      warning: 'Required for budget analytics, spending trends, and AI-powered recommendations',
      color: 'text-blue-500'
    },
    {
      id: 'notifications_consent' as keyof ConsentSettings,
      icon: Bell,
      title: 'Notifications',
      description: 'Receive notifications about deals, order updates, and personalized suggestions',
      warning: 'Required for proximity alerts, budget warnings, and deal notifications',
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Consent & Permissions
          </CardTitle>
          <CardDescription>
            Control what data we collect and how we use it
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              We respect your privacy. You can change these settings anytime. Disabling a feature will stop
              future data collection but won't delete existing data—use the Privacy Dashboard for that.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {consentOptions.map((option) => (
              <Card key={option.id} className="border-2">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <option.icon className={`w-5 h-5 mt-1 ${option.color}`} />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={option.id} className="text-base font-semibold cursor-pointer">
                            {option.title}
                          </Label>
                          <Switch
                            id={option.id}
                            checked={consents[option.id]}
                            onCheckedChange={(checked) => updateConsent(option.id, checked)}
                            disabled={loading}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                        {!consents[option.id] && (
                          <Alert className="mt-2 border-amber-500/50 bg-amber-500/10">
                            <AlertDescription className="text-xs text-amber-700 dark:text-amber-400">
                              {option.warning}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
