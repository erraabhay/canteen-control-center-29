
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Clock,
  CheckCircle, 
  MoreVertical,
  RefreshCw,
  Printer,
  Check,
  XCircle,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrders } from "@/hooks/useOrders";
import { Order } from "@/types/database";

interface OrderItemProps {
  order: Order;
  onStatusChange: (id: string, status: Order['status']) => void;
  isPendingUpdate: boolean;
}

export const OrderItem = ({ order, onStatusChange, isPendingUpdate }: OrderItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const { getOrderItems } = useOrders();
  const { data: orderItems = [], isLoading: itemsLoading } = getOrderItems(order.id);
  
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
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy 'at' h:mm a");
  };
  
  const getNextStatusOptions = () => {
    switch (order.status) {
      case "placed":
        return [
          { value: "processing", label: "Mark as Processing" },
          { value: "cancelled", label: "Cancel Order" }
        ];
      case "processing":
        return [
          { value: "ready", label: "Mark as Ready" },
          { value: "cancelled", label: "Cancel Order" }
        ];
      case "ready":
        return [
          { value: "delivered", label: "Mark as Delivered" },
          { value: "cancelled", label: "Cancel Order" }
        ];
      default:
        return [];
    }
  };
  
  const statusOptions = getNextStatusOptions();
  
  return (
    <Card className="mb-4">
      <CardContent className="p-0">
        <div 
          className="p-4 cursor-pointer flex justify-between items-center"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center">
            {expanded ? 
              <ChevronDown className="h-5 w-5 mr-2 text-muted-foreground" /> : 
              <ChevronRight className="h-5 w-5 mr-2 text-muted-foreground" />
            }
            <div>
              <div className="font-medium">Order #{order.id.substring(0, 8)}</div>
              <div className="text-sm text-muted-foreground">
                User ID: {order.user_id.substring(0, 8)} • {formatDate(order.placed_at)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <div className="font-semibold">₹{order.total}</div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                Pickup: {order.time_slot}
              </div>
            </div>
            
            <div className={`px-2 py-1 rounded text-xs ${getStatusClass(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
            
            {statusOptions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {statusOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusChange(order.id, option.value as Order['status']);
                      }}
                      disabled={isPendingUpdate}
                    >
                      {option.value === "processing" && <RefreshCw className="mr-2 h-4 w-4" />}
                      {option.value === "ready" && <CheckCircle className="mr-2 h-4 w-4" />}
                      {option.value === "delivered" && <Check className="mr-2 h-4 w-4" />}
                      {option.value === "cancelled" && <XCircle className="mr-2 h-4 w-4" />}
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Order
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        {expanded && (
          <div className="px-4 pb-4 border-t pt-3">
            {itemsLoading ? (
              <div className="py-4 text-center">
                <div className="animate-spin h-5 w-5 border-2 border-brand border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading items...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Order Items</h3>
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.type === "immediate" ? "Ready to serve" : "Made to order"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div>₹{item.price} x {item.quantity}</div>
                          <div className="font-medium">₹{item.price * item.quantity}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>₹{order.total}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Order Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID</span>
                      <span className="font-medium">{order.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">User ID</span>
                      <span className="font-medium">{order.user_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pickup Time</span>
                      <span className="font-medium">{order.time_slot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Placed</span>
                      <span className="font-medium">{formatDate(order.placed_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className={`font-medium ${
                        order.status === "placed" 
                          ? "text-blue-600" 
                          : order.status === "processing" 
                          ? "text-yellow-600" 
                          : order.status === "ready"
                          ? "text-green-600"
                          : order.status === "delivered"
                          ? "text-gray-600"
                          : "text-red-600"
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  {order.notes && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-1">Special Instructions</h3>
                      <div className="bg-muted/30 p-2 rounded text-sm">
                        {order.notes}
                      </div>
                    </div>
                  )}
                  
                  {["placed", "processing", "ready"].includes(order.status) && (
                    <div className="mt-4 space-y-2">
                      <h3 className="font-medium">Update Status</h3>
                      <div className="flex gap-2">
                        {order.status === "placed" && (
                          <Button 
                            size="sm"
                            className="bg-brand hover:bg-brand/90"
                            onClick={() => onStatusChange(order.id, "processing")}
                            disabled={isPendingUpdate}
                          >
                            <RefreshCw className="mr-1 h-4 w-4" />
                            Start Processing
                          </Button>
                        )}
                        {order.status === "processing" && (
                          <Button 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => onStatusChange(order.id, "ready")}
                            disabled={isPendingUpdate}
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Mark Ready
                          </Button>
                        )}
                        {order.status === "ready" && (
                          <Button 
                            size="sm"
                            className="bg-gray-600 hover:bg-gray-700"
                            onClick={() => onStatusChange(order.id, "delivered")}
                            disabled={isPendingUpdate}
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Mark Delivered
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => onStatusChange(order.id, "cancelled")}
                          disabled={isPendingUpdate}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Cancel Order
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
