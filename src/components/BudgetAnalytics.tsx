import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, TrendingUp, AlertCircle, Lightbulb, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMemo } from "react";
import { format, getDay } from "date-fns";

interface Order {
  created_at: string;
  total: number;
}

interface BudgetAnalyticsProps {
  orders: Order[];
  dailyBudget?: number;
  weeklyBudget?: number;
  monthlyBudget?: number;
}

export const BudgetAnalytics = ({ orders, dailyBudget, weeklyBudget, monthlyBudget }: BudgetAnalyticsProps) => {
  const analytics = useMemo(() => {
    const now = new Date();
    const last30Days = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      const daysAgo = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysAgo <= 30;
    });

    // Day of week analysis
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeekData = dayNames.map((day, index) => {
      const daySpending = last30Days
        .filter(order => getDay(new Date(order.created_at)) === index)
        .reduce((sum, order) => sum + Number(order.total), 0);
      
      return {
        day: day.slice(0, 3), // Abbreviated day name
        spending: daySpending,
        isWeekend: index === 0 || index === 6
      };
    });

    // Weekday vs Weekend comparison
    const weekdaySpending = dayOfWeekData
      .filter(d => !d.isWeekend)
      .reduce((sum, d) => sum + d.spending, 0);
    const weekendSpending = dayOfWeekData
      .filter(d => d.isWeekend)
      .reduce((sum, d) => sum + d.spending, 0);
    
    const weekdayAvg = weekdaySpending / 5;
    const weekendAvg = weekendSpending / 2;

    // Daily spending data for chart
    const dailyData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (29 - i));
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const spending = last30Days
        .filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.toDateString() === date.toDateString();
        })
        .reduce((sum, order) => sum + Number(order.total), 0);
      return { date: dateStr, spending };
    });

    // Calculate trends
    const firstHalf = dailyData.slice(0, 15).reduce((sum, d) => sum + d.spending, 0) / 15;
    const secondHalf = dailyData.slice(15).reduce((sum, d) => sum + d.spending, 0) / 15;
    const trend = secondHalf > firstHalf ? 'up' : 'down';
    const trendPercent = Math.abs(((secondHalf - firstHalf) / (firstHalf || 1)) * 100);

    // Budget adherence
    const todaySpent = dailyData[dailyData.length - 1].spending;
    const weekSpent = dailyData.slice(-7).reduce((sum, d) => sum + d.spending, 0);
    const monthSpent = dailyData.reduce((sum, d) => sum + d.spending, 0);

    // Cost-saving suggestions
    const suggestions = [];
    const avgDailySpending = monthSpent / 30;
    
    if (dailyBudget && avgDailySpending > dailyBudget * 0.9) {
      suggestions.push({
        icon: AlertCircle,
        text: `You're spending $${avgDailySpending.toFixed(2)}/day on average. Consider reducing to meet your $${dailyBudget}/day budget.`
      });
    }

    if (orders.length > 10) {
      const avgOrderValue = orders.reduce((sum, o) => sum + Number(o.total), 0) / orders.length;
      if (avgOrderValue > 15) {
        suggestions.push({
          icon: TrendingDown,
          text: `Your average order is $${avgOrderValue.toFixed(2)}. Try ordering from budget-friendly restaurants to save 20-30%.`
        });
      }
    }

    const expensiveDays = dailyData.filter(d => dailyBudget && d.spending > dailyBudget * 1.5).length;
    if (expensiveDays > 5) {
      suggestions.push({
        icon: Lightbulb,
        text: `You exceeded your daily budget on ${expensiveDays} days. Plan meals ahead to avoid impulse orders.`
      });
    }

    if (weeklyBudget && weekSpent < weeklyBudget * 0.7) {
      suggestions.push({
        icon: TrendingUp,
        text: `Great job! You're under budget this week. You have $${(weeklyBudget - weekSpent).toFixed(2)} to spare.`
      });
    }

    return {
      dailyData,
      trend,
      trendPercent,
      todaySpent,
      weekSpent,
      monthSpent,
      suggestions,
      avgDailySpending,
      dayOfWeekData,
      weekdayAvg,
      weekendAvg,
      weekdaySpending,
      weekendSpending
    };
  }, [orders, dailyBudget, weeklyBudget, monthlyBudget]);

  return (
    <div className="space-y-4">
      {/* Spending Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>30-Day Spending Trends</span>
            <div className={`flex items-center gap-1 text-sm ${analytics.trend === 'up' ? 'text-destructive' : 'text-green-500'}`}>
              {analytics.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {analytics.trendPercent.toFixed(1)}%
            </div>
          </CardTitle>
          <CardDescription>
            Daily spending over the last 30 days • Average: ${analytics.avgDailySpending.toFixed(2)}/day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={analytics.dailyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                interval={4}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="spending" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Day of Week Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Day of Week Spending
          </CardTitle>
          <CardDescription>
            Which days you spend the most • {analytics.weekendAvg > analytics.weekdayAvg ? 'Higher on weekends' : 'Higher on weekdays'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.dayOfWeekData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']}
              />
              <Bar dataKey="spending" radius={[4, 4, 0, 0]}>
                {analytics.dayOfWeekData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={entry.isWeekend ? 'hsl(var(--chart-2))' : 'hsl(var(--primary))'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Weekday vs Weekend Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <div className="text-sm text-muted-foreground mb-1">Weekday Average</div>
              <div className="text-2xl font-bold">${analytics.weekdayAvg.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                ${analytics.weekdaySpending.toFixed(2)} total
              </div>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="text-sm text-muted-foreground mb-1">Weekend Average</div>
              <div className="text-2xl font-bold">${analytics.weekendAvg.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                ${analytics.weekendSpending.toFixed(2)} total
              </div>
            </div>
          </div>

          {/* Insights */}
          {analytics.weekendAvg > analytics.weekdayAvg * 1.3 && (
            <Alert className="border-l-4 border-l-chart-2">
              <TrendingUp className="h-4 w-4" />
              <AlertDescription className="text-sm">
                You spend {((analytics.weekendAvg / analytics.weekdayAvg - 1) * 100).toFixed(0)}% more on weekends than weekdays. 
                Planning weekend meals could help reduce costs.
              </AlertDescription>
            </Alert>
          )}
          
          {analytics.weekdayAvg > analytics.weekendAvg * 1.3 && (
            <Alert className="border-l-4 border-l-primary">
              <TrendingUp className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Your weekday spending is {((analytics.weekdayAvg / analytics.weekendAvg - 1) * 100).toFixed(0)}% higher. 
                Meal prepping on weekends might help cut weekday costs.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Budget Adherence */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Adherence</CardTitle>
          <CardDescription>How well you're staying within budget limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {dailyBudget && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Today</span>
                <span className="font-medium">
                  ${analytics.todaySpent.toFixed(2)} / ${dailyBudget}
                </span>
              </div>
              <Progress 
                value={(analytics.todaySpent / dailyBudget) * 100} 
                className="h-2"
              />
            </div>
          )}

          {weeklyBudget && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">This Week</span>
                <span className="font-medium">
                  ${analytics.weekSpent.toFixed(2)} / ${weeklyBudget}
                </span>
              </div>
              <Progress 
                value={(analytics.weekSpent / weeklyBudget) * 100} 
                className="h-2"
              />
            </div>
          )}

          {monthlyBudget && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">This Month</span>
                <span className="font-medium">
                  ${analytics.monthSpent.toFixed(2)} / ${monthlyBudget}
                </span>
              </div>
              <Progress 
                value={(analytics.monthSpent / monthlyBudget) * 100} 
                className="h-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost-Saving Suggestions */}
      {analytics.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Smart Savings Tips
            </CardTitle>
            <CardDescription>Personalized suggestions based on your spending patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.suggestions.map((suggestion, index) => (
              <Alert key={index} className="border-l-4 border-l-primary">
                <suggestion.icon className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {suggestion.text}
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
