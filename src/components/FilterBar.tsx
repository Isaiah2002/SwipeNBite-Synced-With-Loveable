import { Filters } from '@/types/restaurant';
import { Sliders, DollarSign, MapPin, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  filterPerformance?: { timeMs: number; resultCount: number } | null;
}

export const FilterBar = ({ filters, onFiltersChange, filterPerformance }: FilterBarProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const filterTimeoutRef = useRef<NodeJS.Timeout>();

  const priceOptions = ['$', '$$', '$$$'] as const;
  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Vegan Options', 'Vegetarian Options'];
  const distanceOptions: (number | null)[] = [1, 5, 10, null];

  // Debounced filter change handler
  const handleFilterChange = (newFilters: Filters) => {
    setIsFiltering(true);
    
    // Clear previous timeout
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    // Apply filter with debounce
    filterTimeoutRef.current = setTimeout(() => {
      onFiltersChange(newFilters);
      setIsFiltering(false);
    }, 150);
  };

  // Show performance warning if filtering is slow
  useEffect(() => {
    if (filterPerformance && filterPerformance.timeMs > 500) {
      toast.warning(`Filter took ${filterPerformance.timeMs}ms (${filterPerformance.resultCount} results)`, {
        duration: 3000,
      });
    }
  }, [filterPerformance]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
          SwipeN'Bite 🍽️
        </h1>
        <div className="flex items-center gap-2">
          {filterPerformance && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{filterPerformance.timeMs}ms</span>
            </div>
          )}
          {isFiltering && (
            <div className="text-xs text-muted-foreground animate-pulse">
              Filtering...
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
            aria-expanded={showFilters}
            aria-controls="restaurant-filters"
            aria-label={showFilters ? "Hide restaurant filters" : "Show restaurant filters"}
          >
            <Sliders className="w-4 h-4" aria-hidden="true" />
            <span>Filters</span>
          </Button>
        </div>
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <section 
          id="restaurant-filters"
          className="bg-card rounded-2xl p-4 border border-border/50 space-y-4 animate-bounce-in"
          role="region"
          aria-label="Restaurant filter options"
        >
          
          {/* Max Price */}
          <fieldset className="space-y-2">
            <legend className="flex items-center space-x-2 text-sm font-medium text-card-foreground">
              <DollarSign className="w-4 h-4" aria-hidden="true" />
              <span>Max Price</span>
            </legend>
            <div className="flex space-x-2" role="group" aria-label="Price range options">
              {priceOptions.map((price) => (
                <button
                  key={price}
                  onClick={() => handleFilterChange({ ...filters, maxPrice: price })}
                  className={`filter-chip ${filters.maxPrice === price ? 'active' : ''}`}
                  aria-pressed={filters.maxPrice === price}
                  aria-label={`Set maximum price to ${price}`}
                >
                  {price}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Max Distance */}
          <fieldset className="space-y-2">
            <legend className="flex items-center space-x-2 text-sm font-medium text-card-foreground">
              <MapPin className="w-4 h-4" aria-hidden="true" />
              <span>Max Distance</span>
            </legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Distance range options">
              {distanceOptions.map((distance) => (
                <button
                  key={distance ?? 'no-limit'}
                  onClick={() => handleFilterChange({ ...filters, maxDistance: distance })}
                  className={`filter-chip ${filters.maxDistance === distance ? 'active' : ''}`}
                  aria-pressed={filters.maxDistance === distance}
                  aria-label={distance ? `Set maximum distance to ${distance} miles` : 'No distance limit'}
                >
                  {distance ? `${distance} mi` : 'No limit'}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Min Rating */}
          <fieldset className="space-y-2">
            <legend className="flex items-center space-x-2 text-sm font-medium text-card-foreground">
              <Star className="w-4 h-4" aria-hidden="true" />
              <span>Min Rating</span>
            </legend>
            <div className="flex space-x-2" role="group" aria-label="Minimum rating options">
              {[3.5, 4.0, 4.5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleFilterChange({ ...filters, minRating: rating })}
                  className={`filter-chip ${filters.minRating === rating ? 'active' : ''}`}
                  aria-pressed={filters.minRating === rating}
                  aria-label={`Set minimum rating to ${rating} stars or higher`}
                >
                  {rating}+ ⭐
                </button>
              ))}
            </div>
          </fieldset>

          {/* Dietary Preferences */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-card-foreground">Dietary Preferences</legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Dietary preference options">
              {dietaryOptions.map((diet) => (
                <button
                  key={diet}
                  onClick={() => {
                    const newDietary = filters.dietary.includes(diet)
                      ? filters.dietary.filter(d => d !== diet)
                      : [...filters.dietary, diet];
                    handleFilterChange({ ...filters, dietary: newDietary });
                  }}
                  className={`filter-chip ${filters.dietary.includes(diet) ? 'active' : ''}`}
                  aria-pressed={filters.dietary.includes(diet)}
                  aria-label={`${filters.dietary.includes(diet) ? 'Remove' : 'Add'} ${diet} filter`}
                >
                  {diet}
                </button>
              ))}
            </div>
          </fieldset>
        </section>
      )}
    </div>
  );
};