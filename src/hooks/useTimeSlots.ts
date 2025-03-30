
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TimeSlot } from '@/types/database';

export function useTimeSlots() {
  const fetchTimeSlots = async (): Promise<TimeSlot[]> => {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .order('time');
    
    if (error) {
      console.error('Error loading time slots:', error);
      throw new Error('Failed to load time slots');
    }
    
    return data as TimeSlot[];
  };

  return useQuery({
    queryKey: ['timeSlots'],
    queryFn: fetchTimeSlots,
  });
}
