
import { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/contexts/AuthContext";
import { FullPageLoading } from "@/components/ui/loading";
import { Navigate } from "react-router-dom";
import { 
  Card, 
  CardHeader,
  CardTitle, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  Search, 
  UserCheck, 
  UserX, 
  Shield, 
  User, 
  RefreshCcw,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const AdminUsersPage = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { 
    users, 
    isLoading, 
    updateUserStatus, 
    updateUserRole, 
    resetUserOTP,
    isPendingStatusUpdate,
    isPendingRoleUpdate,
    isPendingOTPReset
  } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const { toast } = useToast();

  if (authLoading || isLoading) {
    return <FullPageLoading />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Handle user actions
  const handleStatusChange = (userId: string, isActive: boolean) => {
    updateUserStatus({ userId, active: isActive });
  };

  const handleRoleChange = (userId: string, role: 'user' | 'admin') => {
    // Prevent removing all admins
    if (role === 'user' && users.filter(u => u.role === 'admin').length <= 1) {
      toast({
        title: "Action Denied",
        description: "You cannot remove all admins from the system.",
        variant: "destructive"
      });
      return;
    }
    
    updateUserRole({ userId, role });
  };

  const handleResetOTP = (userId: string) => {
    resetUserOTP(userId);
  };

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">
          View and manage users in the system
        </p>
      </div>
      
      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>User Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {roleFilter ? `Role: ${roleFilter}` : "Filter by Role"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setRoleFilter(null)}>
                  All Roles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRoleFilter("admin")}>
                  Admins
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRoleFilter("user")}>
                  Users
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </CardFooter>
      </Card>
      
      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name || "No Name"}</TableCell>
                      <TableCell>{user.email || "No Email"}</TableCell>
                      <TableCell>
                        {user.role === "admin" ? (
                          <Badge className="bg-orange-500"><Shield className="mr-1 h-3 w-3" /> Admin</Badge>
                        ) : (
                          <Badge variant="secondary"><User className="mr-1 h-3 w-3" /> User</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={user.active ? "border-green-500 text-green-500" : "border-red-500 text-red-500"}>
                          {user.active ? 
                            <><CheckCircle className="mr-1 h-3 w-3" /> Active</> : 
                            <><XCircle className="mr-1 h-3 w-3" /> Inactive</>
                          }
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(user.id, !user.active)}
                              disabled={isPendingStatusUpdate}
                            >
                              {user.active ? (
                                <><UserX className="mr-2 h-4 w-4" />Set Inactive</>
                              ) : (
                                <><UserCheck className="mr-2 h-4 w-4" />Set Active</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')}
                              disabled={isPendingRoleUpdate || user.id === user?.id} // Prevent changing own role
                            >
                              {user.role === 'admin' ? (
                                <><User className="mr-2 h-4 w-4" />Make User</>
                              ) : (
                                <><Shield className="mr-2 h-4 w-4" />Make Admin</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleResetOTP(user.id)}
                              disabled={isPendingOTPReset}
                            >
                              <RefreshCcw className="mr-2 h-4 w-4" />Reset OTP
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersPage;
