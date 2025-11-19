import { useState, useEffect } from 'react';
import { Restaurant } from '@/types/restaurant';
import { Heart, X, Clock, MapPin, Star, Share2, ExternalLink, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RestaurantDetails } from '@/components/RestaurantDetails';
import { useRestaurantData } from '@/hooks/useRestaurantData';
import { Button } from '@/components/ui/button';

interface SwipeCardProps {
  restaurant: Restaurant;
  onSwipe: (direction: 'left' | 'right') => void;
  onFavorite?: (restaurant: Restaurant) => void;
  onShare?: (restaurant: Restaurant) => void;
  isFavorited?: boolean;
  isActive?: boolean;
  hasLocation?: boolean;
}

export const SwipeCard = ({ restaurant, onSwipe, onFavorite, onShare, isFavorited = false, isActive = true, hasLocation = false }: SwipeCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageSwiping, setIsImageSwiping] = useState(false);
  const { enrichedRestaurant, loading: dataLoading } = useRestaurantData(restaurant);

  // Haptic feedback helper
  const triggerHaptic = (intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 50
      };
      navigator.vibrate(patterns[intensity]);
    }
  };

  // Get all available images (menu items with images)
  const availableImages = restaurant.menu?.filter(item => item.image).map(item => ({
    url: item.image!,
    name: item.name
  })) || [];
  
  // If no menu images, use the restaurant image
  const images = availableImages.length > 0 ? availableImages : [{ url: restaurant.image, name: restaurant.name }];

  // Auto-cycle images every 5 seconds
  useEffect(() => {
    if (!isActive || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isActive, images.length]);

  const handleImageSwipe = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isActive || images.length <= 1) return;
    
    const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const imageContainer = e.currentTarget;
    let moved = false;
    
    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in moveEvent ? (moveEvent as TouchEvent).touches[0].clientX : (moveEvent as MouseEvent).clientX;
      const diff = currentX - startX;
      
      if (Math.abs(diff) > 10) {
        moved = true;
        setIsImageSwiping(true);
      }
    };
    
    const handleEnd = (endEvent: MouseEvent | TouchEvent) => {
      const currentX = 'changedTouches' in endEvent ? (endEvent as TouchEvent).changedTouches[0].clientX : (endEvent as MouseEvent).clientX;
      const diff = currentX - startX;
      
      if (moved && Math.abs(diff) > 50) {
        if (diff > 0 && currentImageIndex > 0) {
          setCurrentImageIndex(prev => prev - 1);
        } else if (diff < 0 && currentImageIndex < images.length - 1) {
          setCurrentImageIndex(prev => prev + 1);
        }
      }
      
      setIsImageSwiping(false);
      document.removeEventListener('mousemove', handleMove as any);
      document.removeEventListener('mouseup', handleEnd as any);
      document.removeEventListener('touchmove', handleMove as any);
      document.removeEventListener('touchend', handleEnd as any);
    };
    
    document.addEventListener('mousemove', handleMove as any);
    document.addEventListener('mouseup', handleEnd as any);
    document.addEventListener('touchmove', handleMove as any);
    document.addEventListener('touchend', handleEnd as any);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isActive || isImageSwiping) return;
    setIsDragging(true);
    triggerHaptic('light');
    const startX = e.clientX;
    let lastFeedbackThreshold = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      const offset = e.clientX - startX;
      setDragOffset(offset);
      
      // Haptic feedback at threshold
      const currentThreshold = Math.floor(Math.abs(offset) / 100);
      if (currentThreshold > lastFeedbackThreshold && currentThreshold === 1) {
        triggerHaptic('medium');
        lastFeedbackThreshold = currentThreshold;
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      if (Math.abs(dragOffset) > 100) {
        triggerHaptic('heavy');
        onSwipe(dragOffset > 0 ? 'right' : 'left');
      }
      setDragOffset(0);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isActive || isImageSwiping) return;
    setIsDragging(true);
    triggerHaptic('light');
    const startX = e.touches[0].clientX;
    let lastFeedbackThreshold = 0;
    
    const handleTouchMove = (e: TouchEvent) => {
      const offset = e.touches[0].clientX - startX;
      setDragOffset(offset);
      
      // Haptic feedback at threshold
      const currentThreshold = Math.floor(Math.abs(offset) / 100);
      if (currentThreshold > lastFeedbackThreshold && currentThreshold === 1) {
        triggerHaptic('medium');
        lastFeedbackThreshold = currentThreshold;
      }
    };
    
    const handleTouchEnd = () => {
      setIsDragging(false);
      if (Math.abs(dragOffset) > 100) {
        triggerHaptic('heavy');
        onSwipe(dragOffset > 0 ? 'right' : 'left');
      }
      setDragOffset(0);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleButtonClick = (direction: 'left' | 'right') => {
    triggerHaptic('medium');
    onSwipe(direction);
  };

  const cardRotation = dragOffset * 0.05;
  const cardScale = isDragging ? 1.02 : 1;
  const swipeProgress = Math.min(Math.abs(dragOffset) / 100, 1);

  return (
    <div className="relative">
      <div 
        className={`swipe-card w-full max-w-sm mx-auto overflow-hidden cursor-grab ${
          isDragging ? 'cursor-grabbing' : ''
        } ${!isActive ? 'pointer-events-none opacity-50' : ''}`}
        style={{
          transform: `translateX(${dragOffset}px) rotate(${cardRotation}deg) scale(${cardScale})`,
          transition: isDragging 
            ? 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)' 
            : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Restaurant Image Carousel */}
        <div 
          className="relative h-64 overflow-hidden"
          onMouseDown={handleImageSwipe}
          onTouchStart={handleImageSwipe}
        >
          <div 
            className="flex transition-transform duration-300 ease-out h-full"
            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
          >
            {images.map((image, index) => (
              <div key={index} className="min-w-full h-full relative">
                <img 
                  src={image.url} 
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          
          <div className="absolute top-4 left-4">
            <span className="price-badge">{restaurant.price}</span>
          </div>
          
          <div className="absolute top-4 right-4 flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic('light');
                  onFavorite?.(restaurant);
                }}
                className={`p-2 rounded-full transition-all duration-200 active:scale-90 ${
                  isFavorited 
                    ? 'bg-yellow-400 text-white shadow-lg' 
                    : 'bg-black/50 text-white hover:bg-yellow-400/80'
                }`}
              >
                <Star className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
              <div className="flex items-center space-x-1 bg-black/50 px-2 py-1 rounded-full">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-white text-xs font-medium">{restaurant.rating}</span>
              </div>
            </div>
            
            {enrichedRestaurant.yelpRating && (
              <div className="flex items-center space-x-1 bg-red-600/90 px-2 py-1 rounded-full">
                <span className="text-white text-xs font-bold">Yelp</span>
                <Star className="w-3 h-3 text-white fill-current" />
                <span className="text-white text-xs font-medium">{enrichedRestaurant.yelpRating}</span>
                {enrichedRestaurant.reviewCount && (
                  <span className="text-white/80 text-xs">({enrichedRestaurant.reviewCount})</span>
                )}
              </div>
            )}
          </div>
          
          {/* Image Navigation Dots */}
          {images.length > 1 && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentImageIndex 
                      ? 'bg-white w-2 h-6 shadow-lg' 
                      : 'bg-white/60 w-2 h-2 hover:bg-white/90 hover:h-3'
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}
          
          {restaurant.deals && (
            <div className="absolute bottom-4 left-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-bold">
              {restaurant.deals}
            </div>
          )}
        </div>

        {/* Restaurant Info */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-card-foreground">{restaurant.name}</h3>
            <p className="text-muted-foreground font-medium">{restaurant.cuisine}</p>
          </div>
          
          <p className="text-sm text-card-foreground leading-relaxed">{restaurant.description}</p>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{restaurant.distance} mi {hasLocation && '(drive)'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{restaurant.estimatedTime} min</span>
            </div>
          </div>
          
          {hasLocation && (
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span className="font-medium">🚶</span>
              <span>{Math.round((restaurant.distance / 3) * 60)} min walk</span>
            </div>
          )}
          
          {restaurant.dietary.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {restaurant.dietary.map((diet) => (
                <span 
                  key={diet}
                  className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium"
                >
                  {diet}
                </span>
              ))}
            </div>
          )}

          {/* Yelp Link */}
          {enrichedRestaurant.yelpUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                window.open(enrichedRestaurant.yelpUrl, '_blank');
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Yelp
              {enrichedRestaurant.reviewCount && (
                <span className="ml-1 text-muted-foreground">({enrichedRestaurant.reviewCount} reviews)</span>
              )}
            </Button>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Info className="w-4 h-4 mr-2" />
                  More Info
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl">{restaurant.name}</DialogTitle>
                </DialogHeader>
                {dataLoading ? (
                  <div className="py-12 text-center">
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading details...</p>
                  </div>
                ) : (
                  <RestaurantDetails restaurant={enrichedRestaurant} />
                )}
              </DialogContent>
            </Dialog>

            {enrichedRestaurant.mapsUrl && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(enrichedRestaurant.mapsUrl, '_blank');
                }}
              >
                <MapPin className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {isActive && (
        <div className="flex justify-center items-center space-x-6 mt-8">
          <button
            onClick={() => handleButtonClick('left')}
            className="pass-button group hover:scale-110 transition-transform duration-200 active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
          {onShare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('light');
                onShare(restaurant);
              }}
              className="action-button bg-secondary text-secondary-foreground group hover:scale-110 transition-transform duration-200 active:scale-95"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => handleButtonClick('right')}
            className="like-button group hover:scale-110 transition-transform duration-200 active:scale-95"
          >
            <Heart className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Swipe Indicators with smooth transitions */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-200"
        style={{ 
          opacity: dragOffset > 50 ? swipeProgress : 0,
        }}
      >
        <div 
          className="bg-green-500 text-white px-8 py-4 rounded-2xl font-bold text-2xl shadow-2xl"
          style={{
            transform: `rotate(12deg) scale(${0.8 + swipeProgress * 0.4})`,
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          LIKE! 💚
        </div>
      </div>
      
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-200"
        style={{ 
          opacity: dragOffset < -50 ? swipeProgress : 0,
        }}
      >
        <div 
          className="bg-red-500 text-white px-8 py-4 rounded-2xl font-bold text-2xl shadow-2xl"
          style={{
            transform: `rotate(-12deg) scale(${0.8 + swipeProgress * 0.4})`,
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          PASS 👋
        </div>
      </div>
    </div>
  );
};