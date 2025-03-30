
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, Calendar, Clock } from "lucide-react";
import { format, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { FullPageLoading } from "@/components/ui/loading";
import { Navigate } from "react-router-dom";

const OrderHistoryPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { orders, isLoading: ordersLoading, getOrderItems } = useOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [tab, setTab] = useState("all");
  
  // Show loading when authentication or orders are loading
  if (authLoading || ordersLoading) {
    return <FullPageLoading />;
  }
  
  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Filter orders based on search term and date range
  const filteredOrders = orders
    .filter(order => {
      // First apply tab filter
      if (tab === "active" && (order.status === "delivered" || order.status === "cancelled")) {
        return false;
      }
      if (tab === "completed" && order.status !== "delivered") {
        return false;
      }
      if (tab === "cancelled" && order.status !== "cancelled") {
        return false;
      }
      
      // Then apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const orderIdMatch = order.id.toLowerCase().includes(searchLower);
        
        // Since we can't search items directly, we'll just check the order ID
        if (!orderIdMatch) {
          return false;
        }
      }
      
      // Then apply date filter
      if (dateFilter !== "all") {
        const orderDate = new Date(order.placed_at);
        const today = new Date();
        
        if (dateFilter === "today") {
          return (
            isAfter(orderDate, startOfDay(today)) && 
            isBefore(orderDate, endOfDay(today))
          );
        } else if (dateFilter === "week") {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return isAfter(orderDate, weekAgo);
        } else if (dateFilter === "month") {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return isAfter(orderDate, monthAgo);
        }
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.placed_at).getTime() - new Date(a.placed_at).getTime());
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case "placed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMMM dd, yyyy 'at' h:mm a");
  };

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Order History</h1>
        <p className="text-muted-foreground mt-1">
          View and track your past orders.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            className="pl-9"
            placeholder="Search by order ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={dateFilter === "all" ? "default" : "outline"}
            onClick={() => setDateFilter("all")}
            className={dateFilter === "all" ? "bg-brand hover:bg-brand/90" : ""}
          >
            All
          </Button>
          <Button
            variant={dateFilter === "today" ? "default" : "outline"}
            onClick={() => setDateFilter("today")}
            className={dateFilter === "today" ? "bg-brand hover:bg-brand/90" : ""}
          >
            Today
          </Button>
          <Button
            variant={dateFilter === "week" ? "default" : "outline"}
            onClick={() => setDateFilter("week")}
            className={dateFilter === "week" ? "bg-brand hover:bg-brand/90" : ""}
          >
            This Week
          </Button>
          <Button
            variant={dateFilter === "month" ? "default" : "outline"}
            onClick={() => setDateFilter("month")}
            className={dateFilter === "month" ? "bg-brand hover:bg-brand/90" : ""}
          >
            This Month
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const { data: orderItems = [], isLoading: itemsLoading } = getOrderItems(order.id);
            
            return (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30 py-3">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Order #{order.id.substring(0, 8)}</div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(order.placed_at)}</span>
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0 flex items-center space-x-2">
                      <div className={`px-2 py-1 rounded text-xs ${getStatusClass(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>Pickup: {order.time_slot}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {itemsLoading ? (
                    <div className="py-4 text-center">
                      <div className="animate-spin h-5 w-5 border-2 border-brand border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Loading items...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.type === "immediate" ? "Ready to serve" : "Made to order"}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">₹{item.price} x {item.quantity}</div>
                            <div className="text-sm font-semibold">₹{item.price * item.quantity}</div>
                          </div>
                        </div>
                      ))}
                      
                      {order.notes && (
                        <div className="mt-2 text-sm bg-muted/30 p-2 rounded">
                          <span className="font-medium">Notes: </span>
                          {order.notes}
                        </div>
                      )}
                      
                      <div className="pt-3 border-t flex justify-between items-center">
                        <div className="font-medium">Total</div>
                        <div className="text-lg font-semibold">₹{order.total}</div>
                      </div>
                      
                      <div className="flex justify-end pt-2">
                        {["delivered", "cancelled"].includes(order.status) ? (
                          <Button variant="outline" className="text-brand" asChild>
                            <a href="/orders">
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Order Again
                            </a>
                          </Button>
                        ) : (
                          <Button variant="outline" className="text-muted-foreground cursor-not-allowed" disabled>
                            {order.status === "placed" ? "Processing..." : 
                             order.status === "processing" ? "Preparing..." : "Ready for pickup"}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
            <h3 className="mt-4 text-lg font-medium">No orders found</h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? "Try a different search term" 
                : "You haven't placed any orders yet"}
            </p>
            <Button className="mt-4 bg-brand hover:bg-brand/90" asChild>
              <a href="/orders">Place Your First Order</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
