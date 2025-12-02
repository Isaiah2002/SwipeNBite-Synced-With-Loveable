import { Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDistanceToNow } from 'date-fns';

interface RestaurantHoursProps {
  hours?: {
    weekday_text?: string[];
    periods?: any[];
  };
  isOpenNow?: boolean;
  status?: string;
  statusLastChecked?: string;
  openingHours?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const RestaurantHours = ({
  hours,
  isOpenNow,
  status,
  statusLastChecked,
  openingHours,
  onRefresh,
  refreshing = false
}: RestaurantHoursProps) => {
  const getStatusColor = () => {
    if (status === 'closed_permanently') return 'destructive';
    if (status === 'closed_temporarily') return 'secondary';
    if (isOpenNow) return 'default';
    return 'secondary';
  };

  const getStatusText = () => {
    if (status === 'closed_permanently') return 'Permanently Closed';
    if (status === 'closed_temporarily') return 'Temporarily Closed';
    if (isOpenNow === true) return 'Open Now';
    if (isOpenNow === false) return 'Closed Now';
    return 'Hours Unknown';
  };

  const getLastUpdatedText = () => {
    if (!statusLastChecked) return null;
    try {
      return `Updated ${formatDistanceToNow(new Date(statusLastChecked), { addSuffix: true })}`;
    } catch {
      return null;
    }
  };

  const displayHours = hours?.weekday_text || (openingHours ? openingHours.split('\n') : []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg">Hours</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor()} className="text-xs">
              {getStatusText()}
            </Badge>
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={refreshing}
                className="h-8 w-8 p-0"
                aria-label="Refresh hours"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>
        {getLastUpdatedText() && (
          <p className="text-xs text-muted-foreground mt-1">
            {getLastUpdatedText()}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {status === 'closed_permanently' && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              This restaurant is permanently closed.
            </AlertDescription>
          </Alert>
        )}

        {status === 'closed_temporarily' && (
          <Alert className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              This restaurant is temporarily closed. Check back later for updates.
            </AlertDescription>
          </Alert>
        )}

        {displayHours.length > 0 ? (
          <div className="space-y-2">
            {displayHours.map((dayHours, idx) => (
              <div
                key={idx}
                className="text-sm text-muted-foreground py-1 border-b border-border/40 last:border-0"
              >
                {dayHours}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Hours information not available
          </div>
        )}
      </CardContent>
    </Card>
  );
};