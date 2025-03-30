
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BellIcon, SunIcon, MoonIcon, Menu, ShoppingCart, Settings, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

const Navbar = () => {
  const { user, profile, logout } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

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

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur">
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
          <Link to="/" className="font-bold text-xl text-brand">
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
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full md:flex hidden"
              >
                <BellIcon className="h-5 w-5" />
              </Button>
              
              {/* Mobile navigation dropdown */}
              <div className="md:hidden">
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="h-8 w-8 p-0">
                        <Avatar>
                          <AvatarFallback className="bg-brand text-white">
                            {profile?.full_name ? getInitials(profile.full_name) : "U"}
                          </AvatarFallback>
                        </Avatar>
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="w-60 p-2">
                          <div className="mb-2 p-2 border-b">
                            <p className="font-medium">{profile?.full_name || 'User'}</p>
                          </div>
                          <div className="grid gap-1">
                            <Link 
                              to="/orders" 
                              className="flex items-center p-2 rounded-md hover:bg-accent"
                            >
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              <span>Orders</span>
                            </Link>
                            <Link 
                              to="/settings" 
                              className="flex items-center p-2 rounded-md hover:bg-accent"
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              <span>Settings</span>
                            </Link>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-accent"
                              onClick={logout}
                            >
                              <LogOut className="mr-2 h-4 w-4" />
                              <span>Logout</span>
                            </Button>
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
              
              {/* Desktop profile display */}
              <div className="hidden md:flex items-center gap-2">
                <Avatar>
                  <AvatarFallback className="bg-brand text-white">
                    {profile?.full_name ? getInitials(profile.full_name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block font-medium">
                  {profile?.full_name || 'User'}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
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
