
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, isAdmin: boolean) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demonstration
const MOCK_ADMIN = {
  id: "admin-1",
  name: "Admin User",
  email: "admin@canteen.com",
  role: "admin" as const,
  password: "admin123"
};

const MOCK_USER = {
  id: "user-1",
  name: "John Doe",
  email: "user@example.com",
  role: "user" as const,
  password: "user123"
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user in localStorage on initial load
    const storedUser = localStorage.getItem("canteen-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, isAdmin: boolean): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isAdmin) {
        if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
          const { password, ...userData } = MOCK_ADMIN;
          setUser(userData);
          localStorage.setItem("canteen-user", JSON.stringify(userData));
          toast.success("Admin login successful");
          return true;
        }
      } else {
        if (email === MOCK_USER.email && password === MOCK_USER.password) {
          const { password, ...userData } = MOCK_USER;
          setUser(userData);
          localStorage.setItem("canteen-user", JSON.stringify(userData));
          toast.success("Login successful");
          return true;
        }
      }
      
      toast.error("Invalid email or password");
      return false;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, just simulate successful registration
      toast.success("Account created successfully! Please login.");
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Signup failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("canteen-user");
    toast.info("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
