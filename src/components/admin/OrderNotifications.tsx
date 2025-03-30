
import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const OrderNotifications = () => {
  const [newOrderCount, setNewOrderCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio('/notification.mp3');
    
    // Subscribe to real-time order notifications
    const channel = supabase
      .channel('order-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('New order received:', payload);
          
          // Play notification sound
          try {
            audioRef.current?.play().catch(error => {
              console.error('Error playing notification sound:', error);
            });
          } catch (error) {
            console.error('Error playing notification sound:', error);
          }
          
          // Increment the new order counter
          setNewOrderCount(prev => prev + 1);
          
          // Show toast notification
          toast.success('New Order Received!', {
            description: 'Click to view order details',
            action: {
              label: 'View',
              onClick: () => {
                navigate('/admin/orders');
                setNewOrderCount(0);
              }
            },
          });
        }
      )
      .subscribe();
    
    return () => {
      // Cleanup channel subscription
      supabase.removeChannel(channel);
      
      // Cleanup audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [navigate]);
  
  const handleClick = () => {
    navigate('/admin/orders');
    setNewOrderCount(0);
  };
  
  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={handleClick}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {newOrderCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {newOrderCount}
          </span>
        )}
      </Button>
    </div>
  );
};
