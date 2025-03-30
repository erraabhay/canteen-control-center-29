
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/database';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useOrders } from '@/hooks/useOrders';

interface OrderNotification {
  id: string;
  timeAgo: string;
  viewed: boolean;
}

export const OrderNotifications = () => {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const navigate = useNavigate();
  const { refetch } = useOrders();

  useEffect(() => {
    // Subscribe to real-time updates for the orders table
    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('New order received:', payload);
          const newOrder = payload.new as Order;
          
          // Display an immediate toast notification
          toast.success('New order received!', {
            description: `Order #${newOrder.id.substring(0, 8)} has been placed.`,
            action: {
              label: 'View',
              onClick: () => navigate('/admin/orders'),
            },
            duration: 10000, // Keep notification visible for 10 seconds
          });
          
          // Add to notifications dropdown
          setNotifications((prev) => [
            {
              id: newOrder.id,
              timeAgo: 'just now',
              viewed: false,
            },
            ...prev,
          ]);
          
          // Play notification sound
          const audio = new Audio('/notification.mp3');
          audio.play().catch(e => console.log('Error playing notification sound:', e));
          
          // Refresh orders list
          refetch();
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate, refetch]);

  const markAsViewed = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, viewed: true } : notif
      )
    );
  };

  const viewOrder = (id: string) => {
    markAsViewed(id);
    navigate('/admin/orders');
  };

  const unreadCount = notifications.filter((n) => !n.viewed).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-1 px-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="flex justify-between items-center p-2 border-b">
          <span className="font-medium">Recent Orders</span>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setNotifications([])}
            >
              Clear all
            </Button>
          )}
        </div>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex justify-between cursor-pointer p-2 ${
                !notification.viewed ? 'bg-muted/50' : ''
              }`}
              onClick={() => viewOrder(notification.id)}
            >
              <div>
                <div className="font-medium">
                  New Order #{notification.id.substring(0, 8)}
                </div>
                <div className="text-xs text-muted-foreground">{notification.timeAgo}</div>
              </div>
              {!notification.viewed && (
                <Badge className="bg-blue-500">New</Badge>
              )}
            </DropdownMenuItem>
          ))
        ) : (
          <div className="p-3 text-center text-sm text-muted-foreground">
            No new notifications
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
