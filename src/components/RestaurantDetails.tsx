import { memo } from 'react';
import { Restaurant } from '@/types/restaurant';
import { Star, MapPin, Clock, ExternalLink, Phone, Calendar, Share2, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RestaurantMap } from '@/components/RestaurantMap';
import { RestaurantHours } from '@/components/RestaurantHours';
import { useMealPlanCheck } from '@/hooks/useMealPlanCheck';
import { useRestaurantData } from '@/hooks/useRestaurantData';
import { useRealtimeRestaurantStatus } from '@/hooks/useRealtimeRestaurantStatus';
import { toast } from 'sonner';

interface RestaurantDetailsProps {
  restaurant: Restaurant;
}

export const RestaurantDetails = memo(({ restaurant }: RestaurantDetailsProps) => {
  const { isOnMealPlan } = useMealPlanCheck(restaurant.id);
  const { enrichedRestaurant, loading, apiStatus } = useRestaurantData(restaurant, true);
  const { status: realtimeStatus, refreshStatus, refreshing } = useRealtimeRestaurantStatus(
    restaurant.id,
    enrichedRestaurant.placeId
  );

  const handleReservationClick = () => {
    if (enrichedRestaurant.reservationUrl) {
      window.open(enrichedRestaurant.reservationUrl, '_blank');
    }
  };

  const handleYelpClick = () => {
    if (enrichedRestaurant.yelpUrl) {
      window.open(enrichedRestaurant.yelpUrl, '_blank');
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/?restaurant=${encodeURIComponent(restaurant.id)}`;
    const shareData = {
      title: `Check out ${restaurant.name}!`,
      text: `${restaurant.name} - ${restaurant.cuisine} • ${restaurant.price}\n${restaurant.description}`,
      url: shareUrl
    };

    try {
      // Check if Web Share API is supported
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.name !== 'AbortError') {
        // Fallback to clipboard if share fails
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Link copied to clipboard!');
        } catch (clipboardError) {
          toast.error('Failed to share restaurant');
        }
      }
    }
  };

  return (
    <div className="space-y-6" role="document" aria-label={`Details for ${restaurant.name}`}>
      {/* Meal Plan Badge */}
      {isOnMealPlan && (
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary text-primary-foreground rounded-full">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-card-foreground">Student Meal Plan</div>
                <div className="text-sm text-muted-foreground">This restaurant accepts your university meal plan</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map */}
      {restaurant.latitude && restaurant.longitude && (
        <section className="space-y-2" aria-labelledby="location-heading">
          <div className="flex items-center justify-between">
            <h3 id="location-heading" className="text-lg font-semibold text-card-foreground">Location</h3>
            {enrichedRestaurant.placeId && (
              <Badge variant="outline" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                Verified by Google
              </Badge>
            )}
          </div>
          <RestaurantMap
            latitude={enrichedRestaurant.latitude || restaurant.latitude}
            longitude={enrichedRestaurant.longitude || restaurant.longitude}
            name={restaurant.name}
            address={enrichedRestaurant.address || restaurant.address}
          />
          <div className="flex items-start space-x-3 text-base bg-card border border-border p-4 rounded-lg shadow-sm">
            <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" aria-hidden="true" />
            <address className="not-italic text-card-foreground font-medium">
              {enrichedRestaurant.address || restaurant.address || 'Address not available'}
            </address>
          </div>
          {(enrichedRestaurant.phone || restaurant.phone) && (
            <div className="flex items-start space-x-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <a href={`tel:${enrichedRestaurant.phone || restaurant.phone}`} className="hover:text-primary" aria-label={`Call ${restaurant.name} at ${enrichedRestaurant.phone || restaurant.phone}`}>
                {enrichedRestaurant.phone || restaurant.phone}
              </a>
            </div>
          )}
        </section>
      )}

      {/* Hours and Status */}
      <RestaurantHours
        hours={realtimeStatus.hours}
        isOpenNow={realtimeStatus.is_open_now}
        status={realtimeStatus.status}
        statusLastChecked={realtimeStatus.status_last_checked}
        openingHours={realtimeStatus.opening_hours}
        onRefresh={refreshStatus}
        refreshing={refreshing}
      />

      {/* Photos Gallery */}
      {restaurant.photos && restaurant.photos.length > 0 && (
        <section className="space-y-2" aria-labelledby="photos-heading">
          <h3 id="photos-heading" className="text-lg font-semibold text-card-foreground">Photos</h3>
          <div className="grid grid-cols-3 gap-2" role="list" aria-label={`Photo gallery for ${restaurant.name}`}>
            {restaurant.photos.slice(0, 6).map((photo, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden" role="listitem">
                <img 
                  src={photo} 
                  alt={`${restaurant.name} interior and food, photo ${index + 1} of ${Math.min(restaurant.photos!.length, 6)}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ratings */}
      <section className="space-y-3" aria-labelledby="ratings-heading">
        <Card>
          <CardContent className="pt-6 space-y-3">
            <h3 id="ratings-heading" className="text-lg font-semibold text-card-foreground mb-4">Ratings</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="font-medium">App Rating</span>
            </div>
            <span className="font-bold text-lg">{restaurant.rating}</span>
          </div>

          {restaurant.googleRating && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Google</span>
                </div>
                <span className="font-bold text-lg">{restaurant.googleRating}</span>
              </div>
            </>
          )}

          {enrichedRestaurant.yelpRating && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-red-500 fill-current" />
                  <span className="font-medium">Yelp</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{enrichedRestaurant.yelpRating}</div>
                  {enrichedRestaurant.reviewCount && (
                    <div className="text-xs text-muted-foreground">{enrichedRestaurant.reviewCount} reviews</div>
                  )}
                </div>
              </div>
            </>
          )}

          {!loading && apiStatus?.yelp === 'failed' && !enrichedRestaurant.yelpRating && (
            <>
              <Separator />
              <div className="text-sm text-muted-foreground text-center py-2">
                Yelp rating currently unavailable
              </div>
            </>
          )}
        </CardContent>
      </Card>
      </section>

      {/* Reviews */}
      {enrichedRestaurant.reviews && enrichedRestaurant.reviews.length > 0 && (
        <section className="space-y-3" aria-labelledby="reviews-heading">
          <div className="flex items-center justify-between">
            <h3 id="reviews-heading" className="text-lg font-semibold text-card-foreground">Recent Reviews</h3>
            {enrichedRestaurant.yelpUrl && (
              <Button variant="ghost" size="sm" onClick={handleYelpClick} aria-label="View all reviews on Yelp">
                View all <ExternalLink className="w-3 h-3 ml-1" aria-hidden="true" />
              </Button>
            )}
          </div>
          
          <div role="list" aria-label="Customer reviews">
          {enrichedRestaurant.reviews.map((review) => (
            <Card key={review.id} role="listitem">
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8" aria-hidden="true">
                      <AvatarFallback>{review.user[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{review.user}</span>
                  </div>
                  <div className="flex items-center space-x-1" aria-label={`${review.rating} out of 5 stars`}>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" aria-hidden="true" />
                    <span className="font-medium">{review.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">{review.text}</p>
                <time className="text-xs text-muted-foreground" dateTime={review.timeCreated}>
                  {new Date(review.timeCreated).toLocaleDateString()}
                </time>
              </CardContent>
            </Card>
          ))}
          </div>
        </section>
      )}

      {/* API Status Alerts */}
      {!loading && apiStatus && (
        <>
          {apiStatus.openTable === 'rate_limited' && (
            <Alert>
              <AlertDescription>
                Reservation data temporarily unavailable due to high demand. Please try again later.
              </AlertDescription>
            </Alert>
          )}
          {apiStatus.yelp === 'rate_limited' && (
            <Alert>
              <AlertDescription>
                Reviews temporarily unavailable due to service limits.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {/* Location Verification Info */}
      {!loading && !enrichedRestaurant.placeId && restaurant.latitude && restaurant.longitude && (
        <Alert>
          <AlertDescription>
            Location shown based on provided coordinates. Google verification unavailable.
          </AlertDescription>
        </Alert>
      )}

      {/* Reserve Table CTA - Prominent when available */}
      {enrichedRestaurant.openTableAvailable && enrichedRestaurant.reservationUrl && (
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary text-primary-foreground rounded-full">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-card-foreground">Reserve a Table</div>
                  <div className="text-sm text-muted-foreground">Book through OpenTable</div>
                </div>
              </div>
              <Button 
                className="gradient-primary text-primary-foreground border-0"
                onClick={handleReservationClick}
                aria-label={`Reserve a table at ${restaurant.name} via OpenTable`}
              >
                Reserve Table
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!loading && apiStatus?.openTable === 'failed' && !enrichedRestaurant.reservationUrl && (
        <Alert>
          <AlertDescription>
            Reservation information currently unavailable for this restaurant.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <section className="space-y-3" aria-labelledby="actions-heading">
        <h3 id="actions-heading" className="text-lg font-semibold text-card-foreground">Quick Actions</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleShare}
            aria-label={`Share ${restaurant.name}`}
          >
            <Share2 className="w-4 h-4 mr-2" aria-hidden="true" />
            Share
          </Button>

          {enrichedRestaurant.yelpUrl && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleYelpClick}
              aria-label={`View ${restaurant.name} on Yelp`}
            >
              <ExternalLink className="w-4 h-4 mr-2" aria-hidden="true" />
              View on Yelp
            </Button>
          )}
        </div>
      </section>

      {/* Info */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="font-medium">Estimated Delivery</div>
              <div className="text-sm text-muted-foreground">{restaurant.estimatedTime} min</div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="font-medium">Distance</div>
              <div className="text-sm text-muted-foreground">{restaurant.distance} mi away</div>
            </div>
          </div>

          {restaurant.deals && (
            <>
              <Separator />
              <div className="bg-secondary/20 p-3 rounded-lg">
                <div className="font-medium text-secondary-foreground">🎉 {restaurant.deals}</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Menu - Shows menu items from Supabase if available */}
      {enrichedRestaurant.menuAvailable && enrichedRestaurant.menuItems && enrichedRestaurant.menuItems.length > 0 && (
        <section className="space-y-4" aria-labelledby="menu-heading">
          <h3 id="menu-heading" className="text-lg font-semibold text-card-foreground">Menu</h3>
          
          {enrichedRestaurant.menuItems.map((section, sectionIndex) => (
            <Card key={sectionIndex}>
              <CardContent className="pt-6 space-y-4">
                <h4 className="text-base font-semibold text-card-foreground">
                  {section.section_name}
                </h4>
                
                <div className="space-y-3">
                  {section.menu_items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {item.description}
                          </div>
                        )}
                      </div>
                      {item.price && (
                        <div className="font-medium text-sm whitespace-nowrap">
                          {item.price}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {enrichedRestaurant.restaurantWebsite && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => window.open(enrichedRestaurant.restaurantWebsite, '_blank')}
              aria-label={`View full menu for ${restaurant.name} on their website`}
            >
              <ExternalLink className="w-4 h-4 mr-2" aria-hidden="true" />
              View Full Menu
            </Button>
          )}
        </section>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.restaurant.id === nextProps.restaurant.id;
});
