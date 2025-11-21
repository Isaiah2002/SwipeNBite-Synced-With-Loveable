import { Filters } from '@/types/restaurant';
import { Sliders, DollarSign, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export const FilterBar = ({ filters, onFiltersChange }: FilterBarProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const priceOptions = ['$', '$$', '$$$'] as const;
  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Vegan Options', 'Vegetarian Options'];
  const distanceOptions = [1, 5, 10];

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
          SwipeN'Bite 🍽️
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <Sliders className="w-4 h-4" />
          <span>Filters</span>
        </Button>
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="bg-card rounded-2xl p-4 border border-border/50 space-y-4 animate-bounce-in">
          
          {/* Max Price */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-card-foreground">
              <DollarSign className="w-4 h-4" />
              <span>Max Price</span>
            </div>
            <div className="flex space-x-2">
              {priceOptions.map((price) => (
                <button
                  key={price}
                  onClick={() => onFiltersChange({ ...filters, maxPrice: price })}
                  className={`filter-chip ${filters.maxPrice === price ? 'active' : ''}`}
                >
                  {price}
                </button>
              ))}
            </div>
          </div>

          {/* Max Distance */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-card-foreground">
              <MapPin className="w-4 h-4" />
              <span>Max Distance</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {distanceOptions.map((distance) => (
                <button
                  key={distance}
                  onClick={() => onFiltersChange({ ...filters, maxDistance: distance })}
                  className={`filter-chip ${filters.maxDistance === distance ? 'active' : ''}`}
                >
                  {distance} mi
                </button>
              ))}
            </div>
          </div>

          {/* Min Rating */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-card-foreground">
              <Star className="w-4 h-4" />
              <span>Min Rating</span>
            </div>
            <div className="flex space-x-2">
              {[3.5, 4.0, 4.5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => onFiltersChange({ ...filters, minRating: rating })}
                  className={`filter-chip ${filters.minRating === rating ? 'active' : ''}`}
                >
                  {rating}+ ⭐
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Preferences */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-card-foreground">Dietary Preferences</div>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map((diet) => (
                <button
                  key={diet}
                  onClick={() => {
                    const newDietary = filters.dietary.includes(diet)
                      ? filters.dietary.filter(d => d !== diet)
                      : [...filters.dietary, diet];
                    onFiltersChange({ ...filters, dietary: newDietary });
                  }}
                  className={`filter-chip ${filters.dietary.includes(diet) ? 'active' : ''}`}
                >
                  {diet}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};