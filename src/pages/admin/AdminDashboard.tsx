
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { generateDashboardStats, getRecentOrders } from "@/data/mockData";
import { 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Clock, 
  BarChart3,
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { format } from "date-fns";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

const AdminDashboard = () => {
  const stats = generateDashboardStats();
  const recentOrders = getRecentOrders();
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy 'at' h:mm a");
  };
  
  // Generate mock data for charts
  const dailyRevenueData = [
    { day: "Mon", revenue: 5600 },
    { day: "Tue", revenue: 4500 },
    { day: "Wed", revenue: 6800 },
    { day: "Thu", revenue: 7200 },
    { day: "Fri", revenue: 9500 },
    { day: "Sat", revenue: 8300 },
    { day: "Sun", revenue: 6100 }
  ];
  
  const orderStatusData = [
    { name: "Delivered", value: stats.completedOrders, color: "#4ade80" },
    { name: "Pending", value: stats.pendingOrders, color: "#facc15" },
    { name: "Cancelled", value: stats.cancelledOrders, color: "#f87171" }
  ];
  
  const COLORS = ["#4ade80", "#facc15", "#f87171"];
  
  // Get status CSS class
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
  
  return (
    <div className="container max-w-7xl py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome to the Canteen Control Center. Manage orders, menu items, and view analytics.
        </p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <h3 className="text-2xl font-bold mt-1">₹{stats.totalRevenue.toLocaleString()}</h3>
              <p className="text-xs text-green-600 mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +5.2% from last week
              </p>
            </div>
            <div className="h-12 w-12 bg-brand/10 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-brand" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalOrders}</h3>
              <p className="text-xs text-green-600 mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +2.4% from last week
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
              <h3 className="text-2xl font-bold mt-1">{stats.pendingOrders}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3 inline mr-1" />
                Last updated just now
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Users</p>
              <h3 className="text-2xl font-bold mt-1">124</h3>
              <p className="text-xs text-green-600 mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Daily Revenue
            </CardTitle>
            <CardDescription>
              Revenue trends for the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`₹${value}`, "Revenue"]} 
                    labelStyle={{ color: "black" }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="revenue" 
                    name="Revenue" 
                    fill="#FC8019" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Order Status
            </CardTitle>
            <CardDescription>
              Current status of all orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    formatter={(value) => [`${value} orders`, undefined]} 
                    labelStyle={{ color: "black" }}
                  />
                  <Legend />
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Orders & Popular Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>
              Latest orders placed by customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <div className="font-medium">#{order.id.substring(6)} - {order.userName}</div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(order.placedAt)}
                    </div>
                    <div className="flex flex-wrap items-center mt-1 text-xs text-muted-foreground gap-1">
                      {order.items.slice(0, 2).map((item, idx) => (
                        <span key={idx}>
                          {item.quantity}x {item.name}
                          {idx < Math.min(order.items.length, 2) - 1 && ", "}
                        </span>
                      ))}
                      {order.items.length > 2 && <span>+ {order.items.length - 2} more</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded text-xs mb-1 ${getStatusClass(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                    <div className="font-semibold">₹{order.total}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <Button variant="outline" className="w-full" asChild>
                <a href="/admin/orders">View All Orders</a>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Popular Items
            </CardTitle>
            <CardDescription>
              Best-selling menu items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.popularItems.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="font-bold text-lg text-muted-foreground w-5">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="flex justify-between">
                      <div className="text-sm text-muted-foreground">
                        {item.count} orders
                      </div>
                      <div className="font-semibold">₹{item.revenue}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <Button variant="outline" className="w-full" asChild>
                <a href="/admin/menu">Manage Menu</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
