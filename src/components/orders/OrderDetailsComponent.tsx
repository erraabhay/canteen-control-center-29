
import { useState } from 'react';
import { Order, OrderItem } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface OrderDetailsProps {
  order: Order;
  items: OrderItem[];
  onUpdate?: (status: Order['status']) => void;
  showActions?: boolean;
}

const statusColors = {
  placed: 'bg-blue-500',
  processing: 'bg-amber-500',
  ready: 'bg-green-500',
  delivered: 'bg-emerald-600',
  cancelled: 'bg-red-500',
};

export function OrderDetailsComponent({ order, items, onUpdate, showActions = false }: OrderDetailsProps) {
  const { updateOrder, isPendingUpdate } = useOrders();
  const [showDialog, setShowDialog] = useState(false);
  const [showOTPDetails, setShowOTPDetails] = useState(false);

  const handleStatusUpdate = (status: Order['status']) => {
    if (onUpdate) {
      onUpdate(status);
    } else {
      updateOrder({ orderId: order.id, status });
    }
  };

  const handleCancelOrder = () => {
    setShowDialog(false);
    handleStatusUpdate('cancelled');
  };

  const orderTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const orderDate = new Date(order.placed_at);
  const formattedDate = orderDate.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = orderDate.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                Order #{order.id.substring(0, 8)}
                {order.token && <Badge variant="outline">Token: {order.token}</Badge>}
              </CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                {formattedDate} • {formattedTime}
              </CardDescription>
            </div>
            <Badge className={`${statusColors[order.status]}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Order Items</h4>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">₹{item.price}</TableCell>
                      <TableCell className="text-right">₹{item.price * item.quantity}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} className="font-medium text-right">
                      Total
                    </TableCell>
                    <TableCell className="font-bold text-right">₹{orderTotal}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Order Details</h4>
              <dl className="grid grid-cols-2 gap-1">
                <dt className="text-sm text-muted-foreground">Pickup Time:</dt>
                <dd className="text-sm font-medium">{order.time_slot}</dd>
                
                <dt className="text-sm text-muted-foreground">Status:</dt>
                <dd className="text-sm font-medium">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</dd>
                
                {order.notes && (
                  <>
                    <dt className="text-sm text-muted-foreground">Notes:</dt>
                    <dd className="text-sm font-medium col-span-1">{order.notes}</dd>
                  </>
                )}
              </dl>
            </div>
            
            {/* Token & OTP Section */}
            {order.otp && (
              <div>
                <h4 className="text-sm font-semibold mb-2">
                  Collection Details 
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowOTPDetails(!showOTPDetails)}
                    className="ml-2"
                  >
                    {showOTPDetails ? "Hide" : "Show"}
                  </Button>
                </h4>
                {showOTPDetails ? (
                  <dl className="grid grid-cols-2 gap-1">
                    <dt className="text-sm text-muted-foreground">Token:</dt>
                    <dd className="text-sm font-medium">{order.token}</dd>
                    
                    <dt className="text-sm text-muted-foreground">OTP:</dt>
                    <dd className="text-sm font-medium">{order.otp}</dd>
                    
                    <dt className="text-sm text-muted-foreground">Verified:</dt>
                    <dd className="text-sm font-medium flex items-center">
                      {order.otp_verified ? (
                        <>
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                          Yes
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 text-amber-500 mr-1" />
                          No
                        </>
                      )}
                    </dd>
                  </dl>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Show details to view token and OTP
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
        
        {showActions && order.status !== 'delivered' && order.status !== 'cancelled' && (
          <CardFooter className="flex-col sm:flex-row gap-2 sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {order.status === 'placed' && "Your order has been placed and is pending processing."}
              {order.status === 'processing' && "Your order is being prepared."}
              {order.status === 'ready' && "Your order is ready for pickup. Show your token and OTP to collect."}
            </div>
            <Button 
              variant="destructive"
              size="sm"
              onClick={() => setShowDialog(true)}
              disabled={isPendingUpdate}
            >
              {isPendingUpdate ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Order"
              )}
            </Button>
          </CardFooter>
        )}
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              No, Keep Order
            </Button>
            <Button variant="destructive" onClick={handleCancelOrder}>
              Yes, Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
