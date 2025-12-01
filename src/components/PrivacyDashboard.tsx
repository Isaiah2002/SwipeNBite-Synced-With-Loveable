import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Shield, Download, Trash2, Database, MapPin, Heart, ShoppingCart, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { clearPreferencesCache } from "@/hooks/useInferredPreferences";

interface DataCounts {
  orders: number;
  locationHistory: number;
  swipeEvents: number;
  likedRestaurants: number;
  notifications: number;
}

export const PrivacyDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [personalizationEnabled, setPersonalizationEnabled] = useState(true);
  const [dataCounts, setDataCounts] = useState<DataCounts>({
    orders: 0,
    locationHistory: 0,
    swipeEvents: 0,
    likedRestaurants: 0,
    notifications: 0
  });

  useEffect(() => {
    fetchDataCounts();
    fetchPersonalizationSetting();
  }, [user]);

  const fetchPersonalizationSetting = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('personalization_enabled')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setPersonalizationEnabled(data.personalization_enabled !== false);
      }
    } catch (error: any) {
      console.error('Error fetching personalization setting:', error);
    }
  };

  const updatePersonalization = async (enabled: boolean) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ personalization_enabled: enabled })
        .eq('user_id', user.id);

      if (error) throw error;

      setPersonalizationEnabled(enabled);
      
      // Clear preferences cache when personalization is disabled
      if (!enabled) {
        clearPreferencesCache();
        toast.info('Feed will no longer use behavioral data for personalization');
      } else {
        toast.success('AI personalization enabled');
      }
    } catch (error: any) {
      console.error('Error updating personalization:', error);
      toast.error('Failed to update personalization setting');
    } finally {
      setLoading(false);
    }
  };

  const fetchDataCounts = async () => {
    if (!user) return;

    try {
      const [orders, locationHistory, swipeEvents, likedRestaurants, notifications] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('location_history').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('swipe_events').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('liked_restaurants').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
      ]);

      setDataCounts({
        orders: orders.count || 0,
        locationHistory: locationHistory.count || 0,
        swipeEvents: swipeEvents.count || 0,
        likedRestaurants: likedRestaurants.count || 0,
        notifications: notifications.count || 0
      });
    } catch (error) {
      console.error('Error fetching data counts:', error);
    }
  };

  const exportData = async (format: 'json' | 'csv') => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch(
        `https://otjtbhrwoxhdsxfvoigr.supabase.co/functions/v1/export-user-data?format=${format}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `swipenbite-data-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const deleteData = async (dataType: 'orders' | 'location_history' | 'swipe_events' | 'all') => {
    if (!user) return;

    setDeleting(dataType);
    try {
      if (dataType === 'all') {
        await Promise.all([
          supabase.from('orders').delete().eq('user_id', user.id),
          supabase.from('location_history').delete().eq('user_id', user.id),
          supabase.from('swipe_events').delete().eq('user_id', user.id)
        ]);
        toast.success('All activity data deleted');
      } else {
        await supabase.from(dataType).delete().eq('user_id', user.id);
        toast.success(`${dataType.replace('_', ' ')} deleted`);
      }

      await fetchDataCounts();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Failed to delete data');
    } finally {
      setDeleting(null);
    }
  };

  const dataCategories = [
    {
      icon: ShoppingCart,
      title: "Order History",
      description: "Your past food orders and spending",
      count: dataCounts.orders,
      deleteKey: 'orders' as const,
      color: "text-blue-500"
    },
    {
      icon: MapPin,
      title: "Location History",
      description: "Tracked locations and movement patterns",
      count: dataCounts.locationHistory,
      deleteKey: 'location_history' as const,
      color: "text-green-500"
    },
    {
      icon: Heart,
      title: "Swipe History",
      description: "Your restaurant likes and passes",
      count: dataCounts.swipeEvents,
      deleteKey: 'swipe_events' as const,
      color: "text-pink-500"
    },
    {
      icon: Database,
      title: "Liked Restaurants",
      description: "Saved favorite restaurants",
      count: dataCounts.likedRestaurants,
      deleteKey: null,
      color: "text-purple-500"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Data Control
          </CardTitle>
          <CardDescription>
            View, export, and delete your personal data. See our{" "}
            <a href="/privacy" className="text-primary underline">Privacy Policy</a> and{" "}
            <a href="/terms" className="text-primary underline">Terms of Service</a>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Personalization Toggle */}
          <Card className="border-2">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Sparkles className="w-5 h-5 mt-1 text-purple-500" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="personalization" className="text-base font-semibold cursor-pointer">
                        AI-Based Personalization
                      </Label>
                      <Switch
                        id="personalization"
                        checked={personalizationEnabled}
                        onCheckedChange={updatePersonalization}
                        disabled={loading}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Use your location history, favorites, and browsing behavior to automatically identify preferred cuisines and personalize your restaurant feed
                    </p>
                    {!personalizationEnabled && (
                      <Alert className="mt-2 border-amber-500/50 bg-amber-500/10">
                        <AlertDescription className="text-xs text-amber-700 dark:text-amber-400">
                          Your feed will only use explicit preferences from your filter settings. Behavioral insights and automatic cuisine detection will be disabled.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Export */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Export Your Data</h3>
            <p className="text-sm text-muted-foreground">
              Download all your data in JSON or CSV format
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => exportData('json')}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                {loading ? 'Exporting...' : 'Export as JSON'}
              </Button>
              <Button
                onClick={() => exportData('csv')}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                {loading ? 'Exporting...' : 'Export as CSV'}
              </Button>
            </div>
          </div>

          {/* Data Categories */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Your Data</h3>
            <div className="space-y-3">
              {dataCategories.map((category) => (
                <Card key={category.title}>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <category.icon className={`w-5 h-5 mt-0.5 ${category.color}`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{category.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {category.description}
                          </p>
                          <p className="text-xs font-medium mt-1">
                            {category.count} {category.count === 1 ? 'record' : 'records'}
                          </p>
                        </div>
                      </div>
                      {category.deleteKey && category.count > 0 && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={deleting !== null}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete {category.title}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete all {category.count} records. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteData(category.deleteKey!)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Delete All Data */}
          {(dataCounts.orders > 0 || dataCounts.locationHistory > 0 || dataCounts.swipeEvents > 0) && (
            <Alert className="border-destructive/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm">
                    Delete all activity data at once
                  </span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deleting !== null}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete All Activity Data?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all orders, location history, and swipe events. 
                          Your profile and liked restaurants will remain. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteData('all')}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete All Data
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
