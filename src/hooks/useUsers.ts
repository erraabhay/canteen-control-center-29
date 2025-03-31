
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';
import { toast } from 'sonner';

export function useUsers() {
  const queryClient = useQueryClient();

  // Fetch all users
  const fetchUsers = async (): Promise<(Profile & { email?: string })[]> => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        throw new Error(`Error loading profiles: ${profilesError.message}`);
      }

      // Get auth users for their emails
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Could not fetch auth users:', authError);
        // Return profiles without emails if auth fetch fails
        return profiles as Profile[];
      }

      // Combine profile data with user emails
      const combinedData = profiles.map(profile => {
        // Explicitly type the authUser.users array to avoid 'never' type issue
        const users = authUsers?.users as { id: string; email?: string }[] | undefined;
        const authUser = users?.find(user => user && user.id === profile.id);
        
        return {
          ...profile,
          email: authUser?.email
        };
      });
      
      return combinedData;
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Could not load users. Please try again.');
      return [];
    }
  };

  // Update user status (active/inactive)
  const updateUserStatus = async ({ userId, active }: { userId: string, active: boolean }) => {
    try {
      // Update user in auth system
      const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        { ban_duration: active ? '0' : 'none' }
      );
      
      if (authError) {
        throw new Error(`Failed to update user status: ${authError.message}`);
      }
      
      return { userId, active };
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  };

  // Update user role
  const updateUserRole = async ({ userId, role }: { userId: string, role: 'user' | 'admin' }) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();
        
      if (error) {
        throw new Error(`Failed to update user role: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  // Reset a user's OTP for any active order
  const resetUserOrderOTP = async (userId: string) => {
    try {
      // Get active orders for this user
      const { data: activeOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', userId)
        .in('status', ['placed', 'processing', 'ready'])
        .order('placed_at', { ascending: false });
        
      if (ordersError) {
        throw new Error(`Failed to get user orders: ${ordersError.message}`);
      }
      
      if (!activeOrders.length) {
        throw new Error('No active orders found for this user');
      }
      
      // Generate new OTP for the most recent order
      const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          otp: newOTP, 
          otp_verified: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeOrders[0].id)
        .select()
        .single();
        
      if (error) {
        throw new Error(`Failed to reset user OTP: ${error.message}`);
      }
      
      // Now we have the proper Order type with otp property, but we'll add a type assertion for clarity
      return data as { id: string, otp: string } & Record<string, any>;
    } catch (error) {
      console.error('Error resetting user OTP:', error);
      throw error;
    }
  };

  // Use queries and mutations
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User status updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update user status: ${error.message}`);
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: updateUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update user role: ${error.message}`);
    }
  });

  const resetOTPMutation = useMutation({
    mutationFn: resetUserOrderOTP,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(`OTP has been reset. New OTP: ${data.otp}`);
    },
    onError: (error) => {
      toast.error(`Failed to reset OTP: ${error.message}`);
    }
  });

  return {
    users: usersQuery.data || [],
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,
    updateUserStatus: updateStatusMutation.mutate,
    updateUserRole: updateRoleMutation.mutate,
    resetUserOTP: resetOTPMutation.mutate,
    isPendingStatusUpdate: updateStatusMutation.isPending,
    isPendingRoleUpdate: updateRoleMutation.isPending,
    isPendingOTPReset: resetOTPMutation.isPending,
    refetch: usersQuery.refetch
  };
}
