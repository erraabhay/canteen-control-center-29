
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useOrders() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  
  const fetchOrders = async (): Promise<Order[]> => {
    if (!user) return [];
    
    try {
      let query = supabase
        .from('orders')
        .select('*');
      
      // If not admin, only fetch user's own orders
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query.order('placed_at', { ascending: false });
      
      if (error) {
        console.error('Error loading orders:', error);
        throw new Error('Failed to load orders');
      }
      
      return data as Order[];
    } catch (error) {
      console.error('Unexpected error fetching orders:', error);
      toast.error('Could not load orders. Please try again.');
      return [];
    }
  };

  const fetchOrderItems = async (orderId: string): Promise<OrderItem[]> => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      
      if (error) {
        console.error('Error loading order items:', error);
        throw new Error('Failed to load order items');
      }
      
      return data as OrderItem[];
    } catch (error) {
      console.error('Unexpected error fetching order items:', error);
      toast.error('Could not load order items. Please try again.');
      return [];
    }
  };

  const updateOrderStatus = async ({ orderId, status }: { orderId: string, status: Order['status'] }) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating order status:', error);
        throw new Error('Failed to update order status');
      }
      
      return data;
    } catch (error) {
      console.error('Unexpected error updating order:', error);
      throw error;
    }
  };

  const createOrder = async ({ 
    items, 
    total, 
    timeSlot, 
    notes 
  }: { 
    items: { menuItemId: string; name: string; price: number; quantity: number; type: "immediate" | "made-to-order" }[];
    total: number;
    timeSlot: string;
    notes?: string;
  }) => {
    if (!user) throw new Error('User must be logged in to place an order');
    
    try {
      // Insert order first
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total,
          time_slot: timeSlot,
          notes: notes || null,
          status: 'placed'
        })
        .select()
        .single();
      
      if (orderError) {
        console.error('Error creating order:', orderError);
        throw new Error('Failed to create order');
      }
      
      // Then insert order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        type: item.type
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // Try to delete the order since items failed
        await supabase.from('orders').delete().eq('id', order.id);
        throw new Error('Failed to create order items');
      }
      
      return order;
    } catch (error) {
      console.error('Unexpected error creating order:', error);
      throw error;
    }
  };

  const ordersQuery = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    enabled: !!user,
    retry: 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true
  });

  const orderItemsQuery = (orderId: string) => useQuery({
    queryKey: ['orderItems', orderId],
    queryFn: () => fetchOrderItems(orderId),
    enabled: !!orderId,
    retry: 2,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const updateOrderMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update order: ${error.message}`);
    }
  });

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order placed successfully');
    },
    onError: (error) => {
      toast.error(`Failed to place order: ${error.message}`);
    }
  });

  return {
    orders: ordersQuery.data || [],
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    error: ordersQuery.error,
    getOrderItems: orderItemsQuery,
    updateOrder: updateOrderMutation.mutate,
    createOrder: createOrderMutation.mutate,
    isPendingUpdate: updateOrderMutation.isPending,
    isPendingCreate: createOrderMutation.isPending,
    refetch: ordersQuery.refetch
  };
}
