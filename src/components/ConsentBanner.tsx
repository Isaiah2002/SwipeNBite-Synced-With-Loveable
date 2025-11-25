import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const ConsentBanner = () => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkConsentStatus();
  }, [user]);

  const checkConsentStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('consent_given_at')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      // Show banner if user hasn't given consent yet
      setShow(!data?.consent_given_at);
    } catch (error: any) {
      console.error('Error checking consent:', error);
    }
  };

  const handleAcceptAll = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('profiles')
        .update({
          location_tracking_consent: true,
          analytics_consent: true,
          notifications_consent: true,
          consent_given_at: now,
          consent_updated_at: now
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Consent preferences saved');
      setShow(false);
    } catch (error: any) {
      console.error('Error saving consent:', error);
      toast.error('Failed to save consent');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAll = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('profiles')
        .update({
          location_tracking_consent: false,
          analytics_consent: false,
          notifications_consent: false,
          consent_given_at: now,
          consent_updated_at: now
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.info('All consent rejected. Some features may be limited.');
      setShow(false);
    } catch (error: any) {
      console.error('Error saving consent:', error);
      toast.error('Failed to save consent');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 mx-4 md:mx-auto md:max-w-2xl">
      <Card className="border-2 shadow-2xl">
        <CardHeader className="relative pb-3">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-6 w-6 p-0"
            onClick={() => setShow(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5" />
            Privacy & Consent
          </CardTitle>
          <CardDescription className="text-sm">
            We value your privacy. Choose how we use your data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            SwipeN'Bite uses location tracking for personalized restaurant suggestions, 
            analytics to improve your experience, and notifications to keep you updated. 
            You can customize these settings anytime in your profile.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleAcceptAll}
              disabled={loading}
              className="flex-1 gradient-primary text-primary-foreground border-0"
            >
              Accept All
            </Button>
            <Button
              onClick={handleRejectAll}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              Reject All
            </Button>
            <Button
              onClick={() => {
                setShow(false);
                // User can go to profile to customize
                toast.info('Customize consent in your Profile → Privacy & Data section');
              }}
              disabled={loading}
              variant="ghost"
              className="flex-1"
            >
              Customize
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
