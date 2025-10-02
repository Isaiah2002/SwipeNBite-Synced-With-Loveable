import { useState } from 'react';
import { Restaurant } from '@/types/restaurant';
import { Heart, X, Clock, MapPin, Star, Share2 } from 'lucide-react';

interface SwipeCardProps {
  restaurant: Restaurant;
  onSwipe: (direction: 'left' | 'right') => void;
  onFavorite?: (restaurant: Restaurant) => void;
  onShare?: (restaurant: Restaurant) => void;
  isFavorited?: boolean;
  isActive?: boolean;
}

export const SwipeCard = ({ restaurant, onSwipe, onFavorite, onShare, isFavorited = false, isActive = true }: SwipeCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isActive) return;
    setIsDragging(true);
    const startX = e.clientX;
    
    const handleMouseMove = (e: MouseEvent) => {
      const offset = e.clientX - startX;
      setDragOffset(offset);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      if (Math.abs(dragOffset) > 100) {
        onSwipe(dragOffset > 0 ? 'right' : 'left');
      }
      setDragOffset(0);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleButtonClick = (direction: 'left' | 'right') => {
    onSwipe(direction);
  };

  const cardRotation = dragOffset * 0.1;
  const cardOpacity = 1 - Math.abs(dragOffset) * 0.003;

  return (
    <div className="relative">
      <div 
        className={`swipe-card w-full max-w-sm mx-auto overflow-hidden cursor-grab ${
          isDragging ? 'cursor-grabbing' : ''
        } ${!isActive ? 'pointer-events-none opacity-50' : ''}`}
        style={{
          transform: `translateX(${dragOffset}px) rotate(${cardRotation}deg)`,
          opacity: cardOpacity
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Restaurant Image */}
        <div className="relative h-64 overflow-hidden">
          <img 
            src={restaurant.image} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className="price-badge">{restaurant.price}</span>
          </div>
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavorite?.(restaurant);
              }}
              className={`p-2 rounded-full transition-all duration-200 ${
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
              <span>{restaurant.distance} mi</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{restaurant.estimatedTime} min</span>
            </div>
          </div>
          
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
        </div>
      </div>

      {/* Action Buttons */}
      {isActive && (
        <div className="flex justify-center items-center space-x-6 mt-8">
          <button
            onClick={() => handleButtonClick('left')}
            className="pass-button group hover:scale-110"
          >
            <X className="w-6 h-6" />
          </button>
          {onShare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare(restaurant);
              }}
              className="action-button bg-gradient-primary text-primary-foreground group hover:scale-110"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => handleButtonClick('right')}
            className="like-button group hover:scale-110"
          >
            <Heart className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Swipe Indicators */}
      {isDragging && (
        <>
          {dragOffset > 50 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="bg-accent text-accent-foreground px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                LIKE! 💚
              </div>
            </div>
          )}
          {dragOffset < -50 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="bg-pass text-pass-foreground px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                PASS 👋
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};