
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { menuItems } from "@/data/mockData";
import { 
  Search, 
  Plus,
  Edit,
  Trash2,
  MenuSquare,
  Tag, 
  Check,
  X
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface MenuItem {
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

const AdminMenuPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<MenuItem[]>(menuItems);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [menuItemToEdit, setMenuItemToEdit] = useState<MenuItem | null>(null);
  
  // New menu item form state
  const [newItem, setNewItem] = useState<Omit<MenuItem, "id">>({
    name: "",
    description: "",
    price: 0,
    image: "",
    category: "",
    isVeg: true,
    type: "immediate",
    available: true
  });
  
  // Filter items based on search and tab
  const filteredItems = items.filter(item => {
    // First apply tab filter
    if (activeTab === "veg" && !item.isVeg) {
      return false;
    }
    if (activeTab === "nonveg" && item.isVeg) {
      return false;
    }
    if (activeTab === "immediate" && item.type !== "immediate") {
      return false;
    }
    if (activeTab === "made-to-order" && item.type !== "made-to-order") {
      return false;
    }
    if (activeTab === "unavailable" && item.available) {
      return false;
    }
    
    // Then apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = item.name.toLowerCase().includes(searchLower);
      const categoryMatch = item.category.toLowerCase().includes(searchLower);
      if (!nameMatch && !categoryMatch) {
        return false;
      }
    }
    
    return true;
  });
  
  // Group items by category
  const itemsByCategory = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);
  
  const handleAddItem = () => {
    if (!newItem.name || !newItem.description || !newItem.price || !newItem.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Create a new menu item with a generated ID
    const newItemWithId: MenuItem = {
      ...newItem,
      id: `item-${items.length + 1}`,
      image: newItem.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500"
    };
    
    setItems([...items, newItemWithId]);
    toast.success(`${newItem.name} has been added to the menu`);
    
    // Reset form and close modal
    setNewItem({
      name: "",
      description: "",
      price: 0,
      image: "",
      category: "",
      isVeg: true,
      type: "immediate",
      available: true
    });
    setIsAddModalOpen(false);
  };
  
  const handleUpdateItem = () => {
    if (!menuItemToEdit) return;
    
    setItems(items.map(item => 
      item.id === menuItemToEdit.id ? menuItemToEdit : item
    ));
    
    toast.success(`${menuItemToEdit.name} has been updated`);
    setMenuItemToEdit(null);
  };
  
  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
    toast.success("Item has been deleted from the menu");
  };
  
  const toggleItemAvailability = (itemId: string) => {
    setItems(items.map(item => 
      item.id === itemId 
        ? { ...item, available: !item.available } 
        : item
    ));
    
    const item = items.find(item => item.id === itemId);
    if (item) {
      toast.success(`${item.name} is now ${item.available ? 'unavailable' : 'available'}`);
    }
  };

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground mt-1">
            Add, edit, or remove menu items
          </p>
        </div>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand hover:bg-brand/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new item to your menu.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Veg Fried Rice"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="e.g., 120"
                    value={newItem.price || ""}
                    onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the menu item"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Main Course"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL (Optional)</Label>
                  <Input
                    id="image"
                    placeholder="https://example.com/image.jpg"
                    value={newItem.image}
                    onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Item Type</Label>
                  <Select
                    value={newItem.type}
                    onValueChange={(value) => setNewItem({ ...newItem, type: value as "immediate" | "made-to-order" })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate Pickup (Ready-Made)</SelectItem>
                      <SelectItem value="made-to-order">Made to Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Food Type</Label>
                  <div className="flex items-center justify-between border p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${newItem.isVeg ? 'bg-food-veg' : 'bg-food-nonveg'}`}></div>
                      <span>{newItem.isVeg ? "Vegetarian" : "Non-Vegetarian"}</span>
                    </div>
                    <Switch
                      checked={newItem.isVeg}
                      onCheckedChange={(checked) => setNewItem({ ...newItem, isVeg: checked })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="available">Available for Ordering</Label>
                  <Switch
                    id="available"
                    checked={newItem.available}
                    onCheckedChange={(checked) => setNewItem({ ...newItem, available: checked })}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-brand hover:bg-brand/90" onClick={handleAddItem}>
                Add to Menu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit Item Dialog */}
        <Dialog open={!!menuItemToEdit} onOpenChange={(open) => !open && setMenuItemToEdit(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Menu Item</DialogTitle>
              <DialogDescription>
                Update the details for this menu item.
              </DialogDescription>
            </DialogHeader>
            
            {menuItemToEdit && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Item Name</Label>
                    <Input
                      id="edit-name"
                      value={menuItemToEdit.name}
                      onChange={(e) => setMenuItemToEdit({ ...menuItemToEdit, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-price">Price (₹)</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      value={menuItemToEdit.price}
                      onChange={(e) => setMenuItemToEdit({ ...menuItemToEdit, price: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={menuItemToEdit.description}
                    onChange={(e) => setMenuItemToEdit({ ...menuItemToEdit, description: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Input
                      id="edit-category"
                      value={menuItemToEdit.category}
                      onChange={(e) => setMenuItemToEdit({ ...menuItemToEdit, category: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-image">Image URL</Label>
                    <Input
                      id="edit-image"
                      value={menuItemToEdit.image}
                      onChange={(e) => setMenuItemToEdit({ ...menuItemToEdit, image: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">Item Type</Label>
                    <Select
                      value={menuItemToEdit.type}
                      onValueChange={(value) => setMenuItemToEdit({ ...menuItemToEdit, type: value as "immediate" | "made-to-order" })}
                    >
                      <SelectTrigger id="edit-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate Pickup (Ready-Made)</SelectItem>
                        <SelectItem value="made-to-order">Made to Order</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Food Type</Label>
                    <div className="flex items-center justify-between border p-3 rounded-md">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${menuItemToEdit.isVeg ? 'bg-food-veg' : 'bg-food-nonveg'}`}></div>
                        <span>{menuItemToEdit.isVeg ? "Vegetarian" : "Non-Vegetarian"}</span>
                      </div>
                      <Switch
                        checked={menuItemToEdit.isVeg}
                        onCheckedChange={(checked) => setMenuItemToEdit({ ...menuItemToEdit, isVeg: checked })}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-available">Available for Ordering</Label>
                    <Switch
                      id="edit-available"
                      checked={menuItemToEdit.available}
                      onCheckedChange={(checked) => setMenuItemToEdit({ ...menuItemToEdit, available: checked })}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setMenuItemToEdit(null)}>
                Cancel
              </Button>
              <Button className="bg-brand hover:bg-brand/90" onClick={handleUpdateItem}>
                Update Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            className="pl-9"
            placeholder="Search menu items by name or category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-3 md:grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="veg">Veg</TabsTrigger>
            <TabsTrigger value="nonveg">Non-Veg</TabsTrigger>
            <TabsTrigger value="immediate">Ready-Made</TabsTrigger>
            <TabsTrigger value="made-to-order">Made to Order</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="space-y-8">
        {Object.entries(itemsByCategory).length > 0 ? (
          Object.entries(itemsByCategory).map(([category, categoryItems]) => (
            <div key={category}>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MenuSquare className="mr-2 h-5 w-5 text-muted-foreground" />
                {category}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryItems.map((item) => (
                  <Card key={item.id} className={`overflow-hidden ${!item.available ? 'opacity-60' : ''}`}>
                    <div className="relative h-40 overflow-hidden">
                      {!item.available && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Unavailable
                          </span>
                        </div>
                      )}
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 bg-white hover:bg-white/90"
                          onClick={() => setMenuItemToEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 bg-white hover:bg-white/90"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${item.isVeg ? 'bg-food-veg' : 'bg-food-nonveg'}`}></span>
                          {item.name}
                        </h3>
                        <span className="font-semibold">₹{item.price}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 my-2">{item.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs px-2 py-1 rounded bg-muted flex items-center">
                          <Tag className="h-3 w-3 mr-1" />
                          {item.type === "immediate" ? "Ready-Made" : "Made to Order"}
                        </div>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`text-xs ${item.available ? 'text-red-500' : 'text-green-500'}`}
                            onClick={() => toggleItemAvailability(item.id)}
                          >
                            {item.available ? (
                              <X className="h-3 w-3 mr-1" />
                            ) : (
                              <Check className="h-3 w-3 mr-1" />
                            )}
                            {item.available ? "Mark Unavailable" : "Mark Available"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <MenuSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
            <h3 className="mt-4 text-lg font-medium">No menu items found</h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? "Try a different search term or filter" 
                : "Add your first menu item to get started"}
            </p>
            <Button 
              className="mt-4 bg-brand hover:bg-brand/90"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Menu Item
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMenuPage;
