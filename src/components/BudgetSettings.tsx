import { memo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Settings, DollarSign } from 'lucide-react';
import { useBudgetTracking } from '@/hooks/useBudgetTracking';
import { toast } from 'sonner';

export const BudgetSettings = memo(() => {
  const { budgetData, updateBudgets, toggleAlerts } = useBudgetTracking();
  const [daily, setDaily] = useState(budgetData.daily.budget?.toString() || '');
  const [weekly, setWeekly] = useState(budgetData.weekly.budget?.toString() || '');
  const [monthly, setMonthly] = useState(budgetData.monthly.budget?.toString() || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const dailyValue = daily ? parseFloat(daily) : null;
      const weeklyValue = weekly ? parseFloat(weekly) : null;
      const monthlyValue = monthly ? parseFloat(monthly) : null;

      // Validation
      if ((dailyValue && dailyValue < 0) || (weeklyValue && weeklyValue < 0) || (monthlyValue && monthlyValue < 0)) {
        toast.error('Budget amounts must be positive');
        return;
      }

      if (dailyValue && weeklyValue && dailyValue * 7 > weeklyValue) {
        toast.error('Daily budget × 7 should not exceed weekly budget');
        return;
      }

      if (dailyValue && monthlyValue && dailyValue * 30 > monthlyValue) {
        toast.error('Daily budget × 30 should not exceed monthly budget');
        return;
      }

      if (weeklyValue && monthlyValue && weeklyValue * 4 > monthlyValue) {
        toast.error('Weekly budget × 4 should not exceed monthly budget');
        return;
      }

      const { error } = await updateBudgets(dailyValue, weeklyValue, monthlyValue);
      
      if (error) {
        toast.error('Failed to save budget settings');
      } else {
        toast.success('Budget settings saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save budget settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAlerts = async (enabled: boolean) => {
    const { error } = await toggleAlerts(enabled);
    if (error) {
      toast.error('Failed to update alert settings');
    } else {
      toast.success(enabled ? 'Budget alerts enabled' : 'Budget alerts disabled');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Budget Settings
        </CardTitle>
        <CardDescription>
          Set your daily, weekly, and monthly food budgets to track spending
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="daily-budget" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Daily Budget
            </Label>
            <Input
              id="daily-budget"
              type="number"
              placeholder="Enter daily budget"
              value={daily}
              onChange={(e) => setDaily(e.target.value)}
              min="0"
              step="0.01"
            />
            <p className="text-xs text-muted-foreground">
              Maximum you want to spend on food per day
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weekly-budget" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Weekly Budget
            </Label>
            <Input
              id="weekly-budget"
              type="number"
              placeholder="Enter weekly budget"
              value={weekly}
              onChange={(e) => setWeekly(e.target.value)}
              min="0"
              step="0.01"
            />
            <p className="text-xs text-muted-foreground">
              Maximum you want to spend on food per week
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly-budget" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Monthly Budget
            </Label>
            <Input
              id="monthly-budget"
              type="number"
              placeholder="Enter monthly budget"
              value={monthly}
              onChange={(e) => setMonthly(e.target.value)}
              min="0"
              step="0.01"
            />
            <p className="text-xs text-muted-foreground">
              Maximum you want to spend on food per month
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="budget-alerts">Budget Alerts</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when approaching or exceeding budgets
            </p>
          </div>
          <Switch
            id="budget-alerts"
            checked={budgetData.alertsEnabled}
            onCheckedChange={handleToggleAlerts}
          />
        </div>

        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full"
        >
          {saving ? 'Saving...' : 'Save Budget Settings'}
        </Button>
      </CardContent>
    </Card>
  );
});

BudgetSettings.displayName = 'BudgetSettings';
