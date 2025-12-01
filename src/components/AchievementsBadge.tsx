import { useState } from 'react';
import { Award, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAchievements } from '@/hooks/useAchievements';
import { supabase } from '@/integrations/supabase/client';
import * as Icons from 'lucide-react';

export const AchievementsBadge = () => {
  const { achievements, loading, checkForNewAchievements, checking } = useAchievements();
  const [allAchievements, setAllAchievements] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadAllAchievements = async () => {
    const { data } = await supabase.from('achievements').select('*').order('criteria_threshold');
    setAllAchievements(data || []);
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (open) {
      loadAllAchievements();
      checkForNewAchievements();
    }
  };

  const unlockedIds = new Set(achievements.map(a => a.achievement_id));

  const getIconComponent = (iconName: string) => {
    const Icon = (Icons as any)[iconName];
    return Icon || Icons.Award;
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Award className="w-4 h-4 mr-2" />
          Achievements
          {achievements.length > 0 && (
            <Badge variant="secondary" className="ml-2 rounded-full h-5 min-w-5 flex items-center justify-center p-0 px-1.5">
              {achievements.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Your Achievements
          </DialogTitle>
          <DialogDescription>
            Earn badges by exploring restaurants, sharing with friends, and being an active member of the community.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allAchievements.map((achievement) => {
                const isUnlocked = unlockedIds.has(achievement.id);
                const Icon = getIconComponent(achievement.badge_icon);
                const userAchievement = achievements.find(a => a.achievement_id === achievement.id);
                
                return (
                  <Card 
                    key={achievement.id} 
                    className={`transition-all ${isUnlocked ? 'border-primary/50 bg-primary/5' : 'opacity-60'}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-2 rounded-full"
                            style={{ 
                              backgroundColor: isUnlocked ? achievement.badge_color : 'hsl(var(--muted))',
                              opacity: isUnlocked ? 0.15 : 0.1
                            }}
                          >
                            {isUnlocked ? (
                              <Icon 
                                className="w-6 h-6" 
                                style={{ color: achievement.badge_color }}
                              />
                            ) : (
                              <Lock className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-base">{achievement.name}</CardTitle>
                            {isUnlocked && userAchievement && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Unlocked {new Date(userAchievement.unlocked_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        {isUnlocked && (
                          <Badge variant="secondary" className="ml-2">
                            ✓
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {achievement.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {achievements.length} of {allAchievements.length} achievements unlocked
          </p>
          <Button 
            onClick={checkForNewAchievements} 
            disabled={checking}
            size="sm"
            variant="outline"
          >
            {checking ? 'Checking...' : 'Check Progress'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};