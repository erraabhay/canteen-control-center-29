
import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle, Plus, Minus, ShoppingCart, Info } from "lucide-react";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useTimeSlots } from "@/hooks/useTimeSlots";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
  type: "immediate" | "made-to-order";
}

const OrdersPage = () => {
  const { user } = useAuth();
  const { data: menuItems, isLoading: menuLoading } = useMenuItems();
  const { data: timeSlots, isLoading: slotsLoading } = useTimeSlots();
  const { createOrder, isPendingCreate } = useOrders();
  
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [availableSlots, setAvailableSlots] = useState(timeSlots || []);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [notes, setNotes] = useState("");
  
  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Calculate cart total whenever cart changes
  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCartTotal(total);
  }, [cart]);
  
  // Filter suitable time slots based on made-to-order items in cart
  useEffect(() => {
    if (!timeSlots) return;
    
    const madeToOrderCount = cart.reduce(
      (count, item) => count + (item.type === "made-to-order" ? item.quantity : 0),
      0
    );
    
    // Filter slots that have capacity for made-to-order items
    const filtered = timeSlots.filter(slot => {
      // For simplicity, assume 50% of the slots are available since we can't track actual order counts yet
      const estimatedOrdersCount = Math.floor(slot.max_orders * 0.5);
      return estimatedOrdersCount + madeToOrderCount <= slot.max_orders;
    });
    
    setAvailableSlots(filtered);
    
    // Clear selected time slot if it's no longer available
    if (selectedTimeSlot && !filtered.find(slot => slot.time === selectedTimeSlot)) {
      setSelectedTimeSlot("");
    }
  }, [cart, timeSlots]);
  
  const addToCart = (item: typeof menuItems[0]) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        return prevCart.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 } 
            : cartItem
        );
      } else {
        return [...prevCart, { 
          id: item.id, 
          name: item.name, 
          price: item.price, 
          quantity: 1,
          isVeg: item.is_veg,
          type: item.type 
        }];
      }
    });
  };
  
  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemId);
      
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item => 
          item.id === itemId 
            ? { ...item, quantity: item.quantity - 1 } 
            : item
        );
      } else {
        return prevCart.filter(item => item.id !== itemId);
      }
    });
  };
  
  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    if (!selectedTimeSlot) {
      toast.error("Please select a pickup time");
      return;
    }
    
    const orderItems = cart.map(item => ({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      type: item.type
    }));
    
    createOrder({
      items: orderItems,
      total: cartTotal,
      timeSlot: selectedTimeSlot,
      notes: notes || undefined
    });
    
    setShowOrderSuccess(true);
    
    // Reset cart after order placement
    setTimeout(() => {
      setCart([]);
      setSelectedTimeSlot("");
      setNotes("");
      setShowOrderSuccess(false);
    }, 3000);
  };
  
  // Group menu items by category
  const groupedMenuItems = menuItems?.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>) || {};
  
  if (menuLoading || slotsLoading) {
    return (
      <div className="container flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-brand border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }
  
  if (showOrderSuccess) {
    return (
      <div className="container max-w-2xl mx-auto py-12">
        <Card className="animate-fade-in">
          <CardContent className="pt-6 text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Order Placed Successfully!</h2>
            <p className="text-muted-foreground mb-6">
              Your order has been placed and will be ready for pickup at {selectedTimeSlot}.
            </p>
            <Button className="bg-brand hover:bg-brand/90" asChild>
              <a href="/history">View Order Status</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-6xl py-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Menu Section */}
        <div className="flex-1 space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Place Your Order</h1>
            <p className="text-muted-foreground mt-1">
              Select items from our menu and choose your preferred pickup time.
            </p>
          </div>
          
          {Object.entries(groupedMenuItems).map(([category, items]) => (
            <section key={category} className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">{category}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                  <Card key={item.id} className="flex overflow-hidden">
                    <div className="w-24 h-24 flex-shrink-0">
                      <img 
                        src={item.image || '/placeholder.svg'} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 p-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <h3 className="font-medium">{item.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-semibold">₹{item.price}</span>
                        <div className="flex items-center text-xs">
                          {item.type === "immediate" ? (
                            <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs mr-2">
                              Ready
                            </span>
                          ) : (
                            <span className="bg-brand/10 text-brand px-2 py-0.5 rounded text-xs mr-2">
                              Made to order
                            </span>
                          )}
                          <Button 
                            size="sm" 
                            className="h-7 w-7 rounded-full p-0 bg-brand hover:bg-brand/90"
                            onClick={() => addToCart(item)}
                            disabled={!item.available}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
        
        {/* Cart Section */}
        <div className="w-full lg:w-96 space-y-4">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Your Order
              </CardTitle>
              <CardDescription>
                {cart.length === 0 
                  ? "Your cart is empty" 
                  : `${cart.length} item${cart.length > 1 ? "s" : ""} in cart`}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {cart.length > 0 ? (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.type === "immediate" ? "Ready to serve" : "Made to order"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold">₹{item.price * item.quantity}</div>
                        <div className="flex items-center border rounded">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-none p-0"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-none p-0"
                            onClick={() => addToCart(menuItems.find(i => i.id === item.id)!)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <ShoppingCart className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>Add items from the menu to start your order</p>
                </div>
              )}
              
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{cartTotal}</span>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time-slot">Select Pickup Time</Label>
                  <Select 
                    value={selectedTimeSlot} 
                    onValueChange={setSelectedTimeSlot}
                  >
                    <SelectTrigger id="time-slot">
                      <SelectValue placeholder="Choose a time" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.length > 0 ? (
                        availableSlots.map((slot) => (
                          <SelectItem key={slot.id} value={slot.time}>
                            {slot.time}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          No available slots with current order selection
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  
                  {cart.some(item => item.type === "made-to-order") && (
                    <div className="flex items-start gap-2 text-xs bg-amber-50 text-amber-800 p-2 rounded">
                      <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <p>Made-to-order items affect available time slots due to kitchen capacity.</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Any special requests or allergies"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full bg-brand hover:bg-brand/90" 
                onClick={handlePlaceOrder}
                disabled={cart.length === 0 || !selectedTimeSlot || isPendingCreate}
              >
                {isPendingCreate ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>Place Order (₹{cartTotal})</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
