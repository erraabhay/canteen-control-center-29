
import { useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { FullPageLoading } from "@/components/ui/loading";
import { Navigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ValidationFormData {
  otp: string;
}

const OrderValidationPage = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { orders, validateOTP, isPendingValidate } = useOrders();
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<ValidationFormData>({
    defaultValues: {
      otp: ""
    }
  });

  if (authLoading) {
    return <FullPageLoading />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Get active orders that need validation
  const activeOrders = orders.filter(order => 
    ['placed', 'processing', 'ready'].includes(order.status) && 
    !order.otp_verified
  );

  // Find selected order
  const selectedOrder = orderId 
    ? activeOrders.find(order => order.id === orderId) 
    : null;

  const onSelectOrder = (id: string) => {
    setOrderId(id);
    reset(); // Reset form when changing orders
  };

  const onSubmit = (data: ValidationFormData) => {
    if (!orderId) return;
    
    validateOTP({ 
      orderId, 
      otp: data.otp 
    }, {
      onSuccess: () => {
        reset();
        setOrderId(null);
        toast.success("Order validated and marked as delivered");
      }
    });
  };

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Order Validation</h1>
        <p className="text-muted-foreground mt-1">
          Validate customer orders using OTP
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Order List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Orders</CardTitle>
            <CardDescription>
              Select an order to validate
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeOrders.length > 0 ? (
              <div className="space-y-3">
                {activeOrders.map(order => (
                  <Card 
                    key={order.id} 
                    className={`cursor-pointer transition-all hover:border-brand ${order.id === orderId ? 'border-brand bg-accent/30' : ''}`}
                    onClick={() => onSelectOrder(order.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">Token #{order.token}</div>
                          <div className="text-sm text-muted-foreground">
                            Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₹{order.total}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(order.placed_at).toLocaleTimeString()} • {new Date(order.placed_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No active orders requiring validation
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Validation Form */}
        <Card>
          <CardHeader>
            <CardTitle>OTP Validation</CardTitle>
            <CardDescription>
              Enter the OTP provided by the customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedOrder ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Order Details:</div>
                  <div className="p-3 bg-accent/30 rounded-md">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Token:</span> #{selectedOrder.token}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Time:</span> {selectedOrder.time_slot}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Status:</span> {selectedOrder.status}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Total:</span> ₹{selectedOrder.total}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-medium">
                    Enter OTP
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="6-digit OTP"
                    {...register("otp", { 
                      required: "OTP is required",
                      pattern: { 
                        value: /^\d{6}$/, 
                        message: "OTP must be 6 digits" 
                      }
                    })}
                  />
                  {errors.otp && (
                    <p className="text-sm text-destructive">{errors.otp.message}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={isPendingValidate}>
                  {isPendingValidate ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      Validate Order
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                Select an order to validate
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderValidationPage;
