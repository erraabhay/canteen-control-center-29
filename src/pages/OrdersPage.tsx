
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle, Plus, Minus, ShoppingCart, Info, Check } from "lucide-react";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useTimeSlots } from "@/hooks/useTimeSlots";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { TimeSlotSelector } from "@/components/TimeSlotSelector";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileCart } from "@/components/orders/MobileCart";
import { MenuItemCard } from "@/components/orders/MenuItemCard";
import { CategorySelector } from "@/components/orders/CategorySelector";
import { CartItem, CartItemComponent } from "@/components/orders/CartItemComponent";
import { OrderSuccessView } from "@/components/orders/OrderSuccessView";
import { LoadingView } from "@/components/orders/LoadingView";

const OrdersPage = () => {
  const { user } = useAuth();
  const { data: menuItems, isLoading: menuLoading } = useMenuItems();
  const { data: timeSlots, isLoading: slotsLoading } = useTimeSlots();
  const { createOrder, isPendingCreate } = useOrders();
  const isMobile = useIsMobile();
  
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [availableSlots, setAvailableSlots] = useState(timeSlots || []);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [notes, setNotes] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  
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

  // Set initial active category
  useEffect(() => {
    if (menuItems && menuItems.length > 0) {
      const categories = [...new Set(menuItems.map(item => item.category))];
      if (categories.length > 0) {
        setActiveCategory(categories[0]);
      }
    }
  }, [menuItems]);
  
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
    
    // Show checkmark confirmation
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    
    // Reset checkmark after 1.5 seconds
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [item.id]: false }));
    }, 1500);
    
    // Show toast notification
    toast.success(`${item.name} added to cart`);
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
  
  // Get unique categories
  const categories = Object.keys(groupedMenuItems);
  
  const cartHasMadeToOrder = cart.some(item => item.type === "made-to-order");
  
  if (menuLoading || slotsLoading) {
    return <LoadingView />;
  }
  
  if (showOrderSuccess) {
    return <OrderSuccessView selectedTimeSlot={selectedTimeSlot} />;
  }
  
  return (
    <div className="container max-w-6xl py-2 px-2 md:py-4 md:px-4">
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        {/* Menu Section */}
        <div className="flex-1 space-y-4 md:space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Place Your Order</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Select items and choose your pickup time
            </p>
          </div>
          
          {/* Category tabs - horizontal scrolling on mobile */}
          <CategorySelector 
            categories={categories} 
            activeCategory={activeCategory} 
            onCategoryChange={setActiveCategory} 
          />

          {/* Show only the active category */}
          {activeCategory && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">{activeCategory}</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {groupedMenuItems[activeCategory]?.map((item) => (
                  <MenuItemCard 
                    key={item.id} 
                    item={item} 
                    onAddToCart={() => addToCart(item)} 
                    isAdded={!!addedItems[item.id]} 
                  />
                ))}
              </div>
            </section>
          )}
        </div>
        
        {/* Cart Section - fixed at bottom on mobile */}
        <div className={`${isMobile ? "fixed bottom-0 left-0 right-0 z-50 bg-background border-t p-4" : "w-full lg:w-96"}`}>
          {/* Mobile Cart Summary Button */}
          {isMobile && cart.length > 0 && (
            <MobileCart 
              cartItemCount={cart.length} 
              cartTotal={cartTotal} 
            />
          )}
          
          <Card id="cart-details" className={isMobile ? "" : "sticky top-20"}>
            <CardHeader className={isMobile ? "py-3 px-4" : ""}>
              <CardTitle className="flex items-center text-lg">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Your Order
              </CardTitle>
              <CardDescription>
                {cart.length === 0 
                  ? "Your cart is empty" 
                  : `${cart.length} item${cart.length > 1 ? "s" : ""} in cart`}
              </CardDescription>
            </CardHeader>
            
            <CardContent className={`space-y-4 ${isMobile ? "px-4 py-2" : ""}`}>
              {cart.length > 0 ? (
                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <CartItemComponent 
                      key={item.id} 
                      item={item} 
                      onRemove={() => removeFromCart(item.id)} 
                      onAdd={() => addToCart(menuItems.find(i => i.id === item.id)!)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <ShoppingCart className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>Add items from the menu to start your order</p>
                </div>
              )}
              
              {cart.length > 0 && (
                <div className="pt-2 space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium">₹{cartTotal}</span>
                  </div>
                  
                  <TimeSlotSelector
                    value={selectedTimeSlot}
                    onChange={setSelectedTimeSlot}
                    availableSlots={availableSlots}
                    cartHasMadeToOrder={cartHasMadeToOrder}
                  />
                  
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
              )}
            </CardContent>
            
            <CardFooter className={isMobile ? "px-4 py-3" : ""}>
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
          
          {/* Add padding at the bottom when on mobile to prevent content being hidden behind the cart */}
          {isMobile && <div className="h-28"></div>}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
