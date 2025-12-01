import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const RestaurantCardSkeleton = () => {
  return (
    <Card className="w-full max-w-md h-[660px] mx-auto overflow-hidden bg-card border-border">
      {/* Image skeleton */}
      <Skeleton className="w-full h-[400px] rounded-t-lg" />
      
      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        {/* Title skeleton */}
        <Skeleton className="h-8 w-3/4" />
        
        {/* Info row skeleton */}
        <div className="flex gap-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        {/* Tags skeleton */}
        <div className="flex gap-2 flex-wrap">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </Card>
  );
};
