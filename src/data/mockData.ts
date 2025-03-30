
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  type: "immediate" | "made-to-order";
  available: boolean;
}

export interface TimeSlot {
  id: string;
  time: string; // e.g. "12:30"
  ordersCount: number;
  maxOrders: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    type: "immediate" | "made-to-order";
  }[];
  total: number;
  status: "placed" | "processing" | "ready" | "delivered" | "cancelled";
  timeSlot: string;
  placedAt: string; // ISO date string
  notes?: string;
}

export const menuItems: MenuItem[] = [
  {
    id: "item-1",
    name: "Veg Fried Rice",
    description: "Delicious rice stir-fried with mixed vegetables",
    price: 120,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=500",
    category: "Main Course",
    isVeg: true,
    type: "made-to-order",
    available: true
  },
  {
    id: "item-2",
    name: "Chicken Biryani",
    description: "Fragrant rice dish with chicken and aromatic spices",
    price: 180,
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=500",
    category: "Main Course",
    isVeg: false,
    type: "made-to-order",
    available: true
  },
  {
    id: "item-3",
    name: "Samosa",
    description: "Crispy pastry filled with spiced potatoes and peas",
    price: 25,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=500",
    category: "Snacks",
    isVeg: true,
    type: "immediate",
    available: true
  },
  {
    id: "item-4",
    name: "Masala Chai",
    description: "Spiced tea with milk",
    price: 20,
    image: "https://images.unsplash.com/photo-1565194481104-39d1ee1b8bcc?auto=format&fit=crop&q=80&w=500",
    category: "Beverages",
    isVeg: true,
    type: "immediate",
    available: true
  },
  {
    id: "item-5",
    name: "Butter Naan",
    description: "Soft flatbread brushed with butter",
    price: 35,
    image: "https://images.unsplash.com/photo-1626198226552-1e6f34f26b2e?auto=format&fit=crop&q=80&w=500",
    category: "Breads",
    isVeg: true,
    type: "made-to-order",
    available: true
  },
  {
    id: "item-6",
    name: "Paneer Tikka",
    description: "Marinated and grilled cottage cheese cubes",
    price: 150,
    image: "https://images.unsplash.com/photo-1599487338995-56998567a157?auto=format&fit=crop&q=80&w=500",
    category: "Starters",
    isVeg: true,
    type: "made-to-order",
    available: true
  },
  {
    id: "item-7",
    name: "Cold Coffee",
    description: "Chilled coffee with milk and sugar",
    price: 80,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=500",
    category: "Beverages",
    isVeg: true,
    type: "immediate",
    available: true
  },
  {
    id: "item-8",
    name: "Veg Burger",
    description: "Grilled vegetable patty with lettuce and cheese",
    price: 100,
    image: "https://images.unsplash.com/photo-1550950158-d0d960dff51b?auto=format&fit=crop&q=80&w=500",
    category: "Fast Food",
    isVeg: true,
    type: "made-to-order",
    available: true
  }
];

// Generate time slots from 10:00 to 16:00 every 10 minutes
export const timeSlots: TimeSlot[] = Array.from({ length: 37 }).map((_, index) => {
  const hour = Math.floor(index / 6) + 10;
  const minute = (index % 6) * 10;
  const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  
  return {
    id: `slot-${index + 1}`,
    time,
    ordersCount: Math.floor(Math.random() * 20), // Random number of current orders
    maxOrders: 25
  };
});

// Generate random mock orders
export const generateMockOrders = (count: number): Order[] => {
  const statuses: Order["status"][] = ["placed", "processing", "ready", "delivered", "cancelled"];
  const users = [
    { id: "user-1", name: "John Doe" },
    { id: "user-2", name: "Jane Smith" },
    { id: "user-3", name: "Mike Johnson" },
    { id: "user-4", name: "Sarah Williams" }
  ];
  
  return Array.from({ length: count }).map((_, index) => {
    const orderItems = Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => {
      const item = menuItems[Math.floor(Math.random() * menuItems.length)];
      return {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: Math.floor(Math.random() * 3) + 1,
        type: item.type
      };
    });
    
    const user = users[Math.floor(Math.random() * users.length)];
    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)].time;
    
    return {
      id: `order-${index + 1}`,
      userId: user.id,
      userName: user.name,
      items: orderItems,
      total,
      status: statuses[Math.floor(Math.random() * (index < 2 ? 3 : statuses.length))], // Ensure some recent orders
      timeSlot,
      placedAt: new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000)).toISOString(),
      notes: Math.random() > 0.7 ? "Please make it spicy" : undefined
    };
  });
};

export const mockOrders = generateMockOrders(30);

// Get user orders
export const getUserOrders = (userId: string) => {
  return mockOrders.filter(order => order.userId === userId);
};

// Get orders for display on admin dashboard
export const getRecentOrders = () => {
  return [...mockOrders]
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
    .slice(0, 10);
};

// Generate stats for admin dashboard
export const generateDashboardStats = () => {
  const totalOrders = mockOrders.length;
  const completedOrders = mockOrders.filter(o => o.status === "delivered").length;
  const pendingOrders = mockOrders.filter(o => ["placed", "processing", "ready"].includes(o.status)).length;
  const cancelledOrders = mockOrders.filter(o => o.status === "cancelled").length;
  
  const totalRevenue = mockOrders
    .filter(o => o.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);
  
  const ordersByItem = mockOrders
    .flatMap(order => order.items)
    .reduce((acc, item) => {
      const existing = acc.find(i => i.id === item.menuItemId);
      if (existing) {
        existing.count += item.quantity;
        existing.revenue += item.price * item.quantity;
      } else {
        acc.push({
          id: item.menuItemId,
          name: item.name,
          count: item.quantity,
          revenue: item.price * item.quantity
        });
      }
      return acc;
    }, [] as { id: string; name: string; count: number; revenue: number }[])
    .sort((a, b) => b.count - a.count);
    
  return {
    totalOrders,
    completedOrders,
    pendingOrders,
    cancelledOrders,
    totalRevenue,
    popularItems: ordersByItem.slice(0, 5)
  };
};
