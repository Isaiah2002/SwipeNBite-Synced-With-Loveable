import { memo, useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, X } from 'lucide-react';
import { useBudgetTracking } from '@/hooks/useBudgetTracking';
import { Button } from '@/components/ui/button';

export const BudgetAlert = memo(() => {
  const { budgetData, isApproachingLimit, isOverLimit } = useBudgetTracking();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
  }, [budgetData.daily.percentage, budgetData.weekly.percentage, budgetData.monthly.percentage]);

  if (!budgetData.alertsEnabled || dismissed) return null;

  // Check which budget is most concerning
  let alertMessage = '';
  let alertType: 'warning' | 'error' = 'warning';

  if (isOverLimit(budgetData.daily.percentage) && budgetData.daily.budget) {
    alertType = 'error';
    alertMessage = `You've exceeded your daily budget of $${budgetData.daily.budget.toFixed(2)}. Consider more affordable options.`;
  } else if (isOverLimit(budgetData.weekly.percentage) && budgetData.weekly.budget) {
    alertType = 'error';
    alertMessage = `You've exceeded your weekly budget of $${budgetData.weekly.budget.toFixed(2)}. You may want to cook at home more this week.`;
  } else if (isOverLimit(budgetData.monthly.percentage) && budgetData.monthly.budget) {
    alertType = 'error';
    alertMessage = `You've exceeded your monthly budget of $${budgetData.monthly.budget.toFixed(2)}. Consider reviewing your spending habits.`;
  } else if (isApproachingLimit(budgetData.daily.percentage) && budgetData.daily.budget) {
    alertMessage = `You're at ${budgetData.daily.percentage.toFixed(0)}% of your daily budget ($${budgetData.daily.spent.toFixed(2)} / $${budgetData.daily.budget.toFixed(2)})`;
  } else if (isApproachingLimit(budgetData.weekly.percentage) && budgetData.weekly.budget) {
    alertMessage = `You're at ${budgetData.weekly.percentage.toFixed(0)}% of your weekly budget ($${budgetData.weekly.spent.toFixed(2)} / $${budgetData.weekly.budget.toFixed(2)})`;
  } else if (isApproachingLimit(budgetData.monthly.percentage) && budgetData.monthly.budget) {
    alertMessage = `You're at ${budgetData.monthly.percentage.toFixed(0)}% of your monthly budget ($${budgetData.monthly.spent.toFixed(2)} / $${budgetData.monthly.budget.toFixed(2)})`;
  }

  if (!alertMessage) return null;

  return (
    <Alert variant={alertType === 'error' ? 'destructive' : 'default'} className="relative">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Budget Alert</AlertTitle>
      <AlertDescription>{alertMessage}</AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-6 w-6 p-0"
        onClick={() => setDismissed(true)}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
});

BudgetAlert.displayName = 'BudgetAlert';
