
export interface Profile {
  id: string;
  full_name: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string;
  is_veg: boolean;
  type: "immediate" | "made-to-order";
  available: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  max_orders: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: "placed" | "processing" | "ready" | "delivered" | "cancelled";
  time_slot: string;
  notes: string | null;
  placed_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  type: "immediate" | "made-to-order";
  created_at: string;
}
