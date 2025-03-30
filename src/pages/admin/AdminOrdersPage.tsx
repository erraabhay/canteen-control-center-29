
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { FullPageLoading } from "@/components/ui/loading";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types/database";
import { OrderItem } from "@/components/admin/OrderItem";
import { OrderStats } from "@/components/admin/OrderStats";
import { OrderFilters } from "@/components/admin/OrderFilters";
import { EmptyOrdersState } from "@/components/admin/EmptyOrdersState";

const AdminOrdersPage = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { orders, updateOrder, isPendingUpdate, isLoading: ordersLoading, refetch } = useOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("all");
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);

  // Subscribe to real-time order updates
  useEffect(() => {
    const channel = supabase
      .channel('admin-order-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Real-time: New order received:', payload);
          const newOrder = payload.new as Order;
          
          // Highlight the new order
          setHighlightedOrderId(newOrder.id);
          
          // Clear highlight after 5 seconds
          setTimeout(() => {
            setHighlightedOrderId(null);
          }, 5000);
          
          // Refresh orders list
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  if (authLoading || ordersLoading) {
    return <FullPageLoading />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    updateOrder({ orderId, status: newStatus });
  };
  
  const filteredOrders = orders.filter(order => {
    if (activeTab === "active" && (order.status === "delivered" || order.status === "cancelled")) {
      return false;
    }
    if (activeTab === "today") {
      const orderDate = new Date(order.placed_at);
      const today = new Date();
      if (orderDate.getDate() !== today.getDate() || 
          orderDate.getMonth() !== today.getMonth() || 
          orderDate.getFullYear() !== today.getFullYear()) {
        return false;
      }
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const orderIdMatch = order.id.toLowerCase().includes(searchLower);
      const userIdMatch = order.user_id.toLowerCase().includes(searchLower);
      if (!orderIdMatch && !userIdMatch) {
        return false;
      }
    }
    
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.placed_at).getTime() - new Date(a.placed_at).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.placed_at).getTime() - new Date(b.placed_at).getTime();
    } else if (sortBy === "highest") {
      return b.total - a.total;
    } else {
      return a.total - b.total;
    }
  });
  
  const activeOrdersCount = orders.filter(
    order => ["placed", "processing", "ready"].includes(order.status)
  ).length;
  
  const completedOrdersCount = orders.filter(
    order => order.status === "delivered"
  ).length;
  
  const cancelledOrdersCount = orders.filter(
    order => order.status === "cancelled"
  ).length;
  
  const today = new Date();
  const todayOrdersCount = orders.filter(order => {
    const orderDate = new Date(order.placed_at);
    return orderDate.getDate() === today.getDate() &&
           orderDate.getMonth() === today.getMonth() &&
           orderDate.getFullYear() === today.getFullYear();
  }).length;

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Order Management</h1>
        <p className="text-muted-foreground mt-1">
          View and manage customer orders
        </p>
      </div>
      
      <OrderStats 
        activeOrdersCount={activeOrdersCount}
        todayOrdersCount={todayOrdersCount}
        completedOrdersCount={completedOrdersCount}
        cancelledOrdersCount={cancelledOrdersCount}
      />
      
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="active">Active Orders</TabsTrigger>
          <TabsTrigger value="today">Today's Orders</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <OrderFilters 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />
      
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className={highlightedOrderId === order.id ? "animate-pulse" : ""}>
              <OrderItem 
                order={order} 
                onStatusChange={handleStatusChange}
                isPendingUpdate={isPendingUpdate}
              />
            </div>
          ))
        ) : (
          <EmptyOrdersState searchTerm={searchTerm} statusFilter={statusFilter} />
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
