import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LikedRestaurants } from '@/components/LikedRestaurants';
import BottomNav from '@/components/BottomNav';

// Mock data for now - in a real app this would come from state management or API
const mockLikedRestaurants = [
  {
    id: '1',
    name: 'Mama Mia\'s Pizza',
    cuisine: 'Italian',
    rating: 4.8,
    price: '$$' as const,
    distance: 0.3,
    image: '/src/assets/pizza.jpg',
    description: 'Authentic Italian pizza with fresh ingredients',
    dietary: ['vegetarian'],
    estimatedTime: 25
  }
];

const Favorites = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-card-foreground">Favorites</h1>
          </div>

          {/* Content */}
          <LikedRestaurants 
            likedRestaurants={mockLikedRestaurants}
            onClose={() => navigate('/')}
            showCloseButton={false}
          />
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Favorites;