
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import Navbar from "./Navbar";
import { FullPageLoading } from "@/components/ui/loading";

const MainLayout = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <FullPageLoading />;
  }
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        <div className="flex flex-1 w-full">
          {user && <AppSidebar />}
          <div className="flex-1 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 px-3 py-4 md:p-6 mx-auto w-full max-w-7xl">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
