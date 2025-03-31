
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BellIcon, SunIcon, MoonIcon, Menu, ShoppingCart, Settings, LogOut, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  orderId?: string;
}

const Navbar = () => {
  const { user, profile, logout, isAdmin } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [darkMode, setDarkMode] = useState(false);
  const isMobile = useIsMobile();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [audioRef] = useState<HTMLAudioElement | null>(
    typeof Audio !== "undefined" ? new Audio('/notification.mp3') : null
  );

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    // Load existing notifications from localStorage
    const savedNotifications = localStorage.getItem("adminNotifications");
    if (savedNotifications) {
      const parsedNotifications = JSON.parse(savedNotifications);
      setNotifications(parsedNotifications);
      setUnreadCount(parsedNotifications.filter((n: Notification) => !n.read).length);
    }

    // Subscribe to real-time order notifications
    const channel = supabase
      .channel('order-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('New order received:', payload);
          
          // Play notification sound
          try {
            audioRef?.play().catch(error => {
              console.error('Error playing notification sound:', error);
            });
          } catch (error) {
            console.error('Error playing notification sound:', error);
          }
          
          // Create new notification
          const newNotification: Notification = {
            id: crypto.randomUUID(),
            message: "New order received",
            timestamp: new Date().toISOString(),
            read: false,
            orderId: payload.new?.id
          };
          
          // Update notifications
          setNotifications(prev => {
            const updated = [newNotification, ...prev.slice(0, 19)]; // Keep only the 20 most recent
            localStorage.setItem("adminNotifications", JSON.stringify(updated));
            return updated;
          });
          
          // Increment unread count
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification
          toast.success('New Order Received!', {
            description: 'Click to view order details',
            action: {
              label: 'View',
              onClick: () => {
                window.location.href = '/admin/orders';
              }
            },
          });
        }
      )
      .subscribe();
    
    return () => {
      // Cleanup channel subscription
      supabase.removeChannel(channel);
    };
  }, [isAdmin, audioRef]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));
    
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({...n, read: true}));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    localStorage.setItem("adminNotifications", JSON.stringify(updatedNotifications));
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark this notification as read
    const updatedNotifications = notifications.map(n => 
      n.id === notification.id ? {...n, read: true} : n
    );
    setNotifications(updatedNotifications);
    setUnreadCount(prev => Math.max(0, prev - (notification.read ? 0 : 1)));
    localStorage.setItem("adminNotifications", JSON.stringify(updatedNotifications));
    
    // Navigate to orders page if there's an orderId
    if (notification.orderId) {
      window.location.href = '/admin/orders';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden rounded-full"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/" className={`font-bold ${isMobile ? "text-lg" : "text-xl"} text-brand`}>
            Canteen Control
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode}
            className="rounded-full"
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>
          
          {user && profile ? (
            <>
              {isAdmin && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full relative"
                    >
                      <BellIcon className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="flex items-center justify-between p-3 border-b">
                      <h4 className="font-medium">Notifications</h4>
                      {unreadCount > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleMarkAllAsRead}
                          className="h-8 text-xs flex items-center"
                        >
                          <CheckCheck className="h-3.5 w-3.5 mr-1" />
                          Mark all as read
                        </Button>
                      )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`p-3 border-b cursor-pointer hover:bg-muted/50 ${!notification.read ? 'bg-muted/20' : ''}`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatTimestamp(notification.timestamp)}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              
              {/* Mobile and desktop dropdown using DropdownMenu component */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-brand text-white text-xs">
                        {profile?.full_name ? getInitials(profile.full_name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={5} className="w-56 bg-popover border border-border">
                  <div className="px-2 py-1.5 border-b border-border">
                    <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  
                  <div className="py-2">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="cursor-pointer">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        <span>Orders</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={logout} className="text-red-500 hover:text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Desktop only: show name beside avatar */}
              <span className="hidden md:inline-block font-medium ml-1">
                {profile?.full_name || 'User'}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size={isMobile ? "sm" : "default"}>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size={isMobile ? "sm" : "default"}>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
