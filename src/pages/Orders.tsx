import { ArrowLeft, Clock, MapPin, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface Order {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_image: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category: string;
  }>;
  total: number;
  status: string;
  delivery_address: string | null;
  created_at: string;
  updated_at: string;
}

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setOrders((data || []) as unknown as Order[]);
      } catch (error: any) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Set up realtime subscription for order updates
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchOrders(); // Refresh orders when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: '⏳ Pending', variant: 'secondary' },
      confirmed: { label: '✅ Confirmed', variant: 'default' },
      preparing: { label: '👨‍🍳 Preparing', variant: 'default' },
      out_for_delivery: { label: '🚗 Out for Delivery', variant: 'default' },
      delivered: { label: '✨ Delivered', variant: 'outline' },
      cancelled: { label: '❌ Cancelled', variant: 'destructive' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

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

          {orders.length === 0 ? (
            /* Empty State */
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
          ) : (
            /* Orders List */
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="swipe-card overflow-hidden">
                  <div className="flex gap-4">
                    <img 
                      src={order.restaurant_image}
                      alt={order.restaurant_name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-card-foreground">
                            {order.restaurant_name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      
                      <div className="space-y-1 mb-3">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground">
                            {item.quantity}x {item.name}
                          </p>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-sm text-muted-foreground">
                            +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg text-card-foreground">
                          ${order.total.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Package className="w-3 h-3" />
                          <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</span>
                        </div>
                      </div>

                      {order.delivery_address && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{order.delivery_address}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Orders;