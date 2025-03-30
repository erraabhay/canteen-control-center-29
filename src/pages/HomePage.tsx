
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { menuItems, mockOrders } from "@/data/mockData";
import { ShoppingCart, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const { user, profile } = useAuth();
  
  // Get user's active orders
  const activeOrders = mockOrders
    .filter(
      (order) => 
        order.userId === "user-1" && 
        ["placed", "processing", "ready"].includes(order.status)
    )
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
  
  // Get featured menu items
  const featuredItems = menuItems.slice(0, 4);
  
  return (
    <div className="container max-w-6xl py-6 space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome, {profile?.full_name || 'User'}</h1>
        <p className="text-muted-foreground">
          Order your favorite food from our canteen with just a few clicks.
        </p>
      </section>
      
      {activeOrders.length > 0 && (
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Active Orders</h2>
            <Link to="/orders">
              <Button variant="ghost" className="text-brand">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrders.map((order) => (
              <Link to="/orders" key={order.id}>
                <Card className="hover:border-brand/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-semibold">Order #{order.id.substring(6)}</div>
                        <div className="text-muted-foreground text-sm mt-1">
                          Pickup Time: {order.timeSlot}
                        </div>
                        <div className="mt-2">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="text-sm">
                              {item.quantity}x {item.name}
                              {order.items.length > 2 && idx === 1 && (
                                <span className="text-muted-foreground">
                                  {" "}+ {order.items.length - 2} more
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="font-medium">₹{order.total}</div>
                        <div className={`mt-auto px-2 py-1 rounded text-xs ${
                          order.status === "placed" 
                            ? "bg-blue-100 text-blue-800" 
                            : order.status === "processing" 
                            ? "bg-yellow-100 text-yellow-800" 
                            : "bg-green-100 text-green-800"
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
      
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Popular Items</h2>
          <Link to="/menu">
            <Button variant="ghost" className="text-brand">
              View Full Menu <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {featuredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden group hover-scale">
              <div className="h-40 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                />
              </div>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <span className={`w-3 h-3 rounded-full ${item.isVeg ? 'bg-food-veg' : 'bg-food-nonveg'}`}></span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-semibold">₹{item.price}</span>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    {item.type === "immediate" ? (
                      <span className="flex items-center bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs">
                        Ready to serve
                      </span>
                    ) : (
                      <span className="flex items-center bg-brand/10 text-brand px-2 py-0.5 rounded text-xs">
                        <Clock className="mr-1 h-3 w-3" />
                        Made to order
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      
      <section className="pt-4">
        <Link to="/orders">
          <Button className="w-full md:w-auto bg-brand hover:bg-brand/90">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Place New Order
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
