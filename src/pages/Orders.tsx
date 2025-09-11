import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';

const Orders = () => {
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
            <h1 className="text-2xl font-bold text-card-foreground">Orders</h1>
          </div>

          {/* Empty State */}
          <div className="text-center space-y-6 mt-20">
            <div className="text-8xl">🍽️</div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-card-foreground">
                No orders yet
              </h3>
              <p className="text-muted-foreground">
                Once you start ordering from your matched restaurants, they'll appear here
              </p>
            </div>
            <Button 
              onClick={() => navigate('/')}
              className="gradient-primary text-primary-foreground border-0"
            >
              Start Swiping
            </Button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Orders;