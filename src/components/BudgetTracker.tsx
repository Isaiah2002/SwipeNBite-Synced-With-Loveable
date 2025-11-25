import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useBudgetTracking } from '@/hooks/useBudgetTracking';
import { Skeleton } from '@/components/ui/skeleton';

export const BudgetTracker = memo(() => {
  const { budgetData, loading, isApproachingLimit, isOverLimit } = useBudgetTracking();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasBudgets = budgetData.daily.budget || budgetData.weekly.budget || budgetData.monthly.budget;

  if (!hasBudgets) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Budget Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Set your budgets in the settings below to start tracking your spending.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const renderBudgetPeriod = (
    label: string,
    data: { budget: number | null; spent: number; remaining: number; percentage: number }
  ) => {
    if (!data.budget) return null;

    const isNearLimit = isApproachingLimit(data.percentage);
    const isOver = isOverLimit(data.percentage);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">{label}</span>
          <span className="text-sm text-muted-foreground">
            ${data.spent.toFixed(2)} / ${data.budget.toFixed(2)}
          </span>
        </div>
        
        <Progress 
          value={Math.min(data.percentage, 100)} 
          className={`h-2 ${
            isOver ? 'bg-destructive/20' : isNearLimit ? 'bg-yellow-500/20' : ''
          }`}
        />
        
        <div className="flex items-center justify-between text-xs">
          <span className={
            isOver ? 'text-destructive font-semibold' : 
            isNearLimit ? 'text-yellow-600 dark:text-yellow-500 font-semibold' : 
            'text-muted-foreground'
          }>
            {isOver ? (
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Over budget by ${(data.spent - data.budget).toFixed(2)}
              </span>
            ) : isNearLimit ? (
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {data.percentage.toFixed(0)}% used
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {data.percentage.toFixed(0)}% used
              </span>
            )}
          </span>
          <span className="text-muted-foreground">
            ${data.remaining.toFixed(2)} remaining
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Budget Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderBudgetPeriod('Daily Budget', budgetData.daily)}
        {renderBudgetPeriod('Weekly Budget', budgetData.weekly)}
        {renderBudgetPeriod('Monthly Budget', budgetData.monthly)}

        {budgetData.alertsEnabled && (
          <>
            {isOverLimit(budgetData.daily.percentage) && budgetData.daily.budget && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You've exceeded your daily budget! Consider choosing more affordable options.
                </AlertDescription>
              </Alert>
            )}
            
            {isOverLimit(budgetData.weekly.percentage) && budgetData.weekly.budget && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You've exceeded your weekly budget! You may want to cook at home more this week.
                </AlertDescription>
              </Alert>
            )}

            {isOverLimit(budgetData.monthly.percentage) && budgetData.monthly.budget && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You've exceeded your monthly budget! Consider reviewing your spending habits.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
});

BudgetTracker.displayName = 'BudgetTracker';
