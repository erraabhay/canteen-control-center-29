
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  ShoppingCart, 
  Clock, 
  Settings, 
  LogOut, 
  Users, 
  Utensils, 
  BarChart3,
  User
} from "lucide-react";
import { Link } from "react-router-dom";
import { OrderNotifications } from "@/components/admin/OrderNotifications";
import { useIsMobile } from "@/hooks/use-mobile";

const AppSidebar = () => {
  const { user, logout, isAdmin, profile } = useAuth();
  const isMobile = useIsMobile();
  
  const userMenuItems = [
    { title: "Home", url: "/", icon: Home },
    { title: "Orders", url: "/orders", icon: ShoppingCart },
    { title: "Order History", url: "/history", icon: Clock },
    { title: "User Profile", url: "/profile", icon: User },
    { title: "Settings", url: "/settings", icon: Settings },
  ];
  
  const adminMenuItems = [
    { title: "Dashboard", url: "/admin", icon: BarChart3 },
    { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
    { title: "Menu Management", url: "/admin/menu", icon: Utensils },
    { title: "Users", url: "/admin/users", icon: Users },
    { title: "Settings", url: "/admin/settings", icon: Settings },
  ];
  
  const menuItems = isAdmin ? adminMenuItems : userMenuItems;
  
  return (
    <Sidebar className={isMobile ? "max-w-[85vw]" : ""}>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-brand items-center justify-center text-white font-semibold flex">
              CC
            </div>
            <div className="font-semibold text-lg">Canteen Control</div>
          </div>
          {isAdmin && <OrderNotifications />}
        </div>
        <SidebarTrigger className="md:hidden absolute top-4 right-4" />
      </SidebarHeader>
      <SidebarContent className="p-2">
        {profile && (
          <div className="mb-4 p-4 flex items-center space-x-3 bg-accent/30 rounded-lg">
            <div className="h-10 w-10 rounded-full bg-brand flex items-center justify-center text-white font-semibold">
              {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="overflow-hidden">
              <div className="font-medium truncate">{profile.full_name || "User"}</div>
              <div className="text-xs text-muted-foreground">{isAdmin ? "Administrator" : "Customer"}</div>
            </div>
          </div>
        )}
        <SidebarGroup>
          <SidebarGroupLabel>{isAdmin ? "Admin Menu" : "Menu"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className="flex items-center">
                      <item.icon className="mr-2 h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={logout} className="w-full flex items-center text-red-500 hover:text-red-600">
                  <LogOut className="mr-2 h-5 w-5" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
