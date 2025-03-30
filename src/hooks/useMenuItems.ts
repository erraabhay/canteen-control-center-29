
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem } from '@/types/database';
import { useQuery } from '@tanstack/react-query';

export function useMenuItems() {
  const fetchMenuItems = async (): Promise<MenuItem[]> => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category');
    
    if (error) {
      console.error('Error loading menu items:', error);
      throw new Error('Failed to load menu items');
    }
    
    return data as MenuItem[];
  };

  return useQuery({
    queryKey: ['menuItems'],
    queryFn: fetchMenuItems,
  });
}
