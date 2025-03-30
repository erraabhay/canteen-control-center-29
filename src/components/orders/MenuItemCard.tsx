
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";

interface MenuItemCardProps {
  item: {
    id: string;
    name: string;
    description?: string;
    price: number;
    is_veg: boolean;
    type: "immediate" | "made-to-order";
    available: boolean;
    image?: string;
  };
  onAddToCart: () => void;
  isAdded: boolean;
}

export const MenuItemCard = ({ item, onAddToCart, isAdded }: MenuItemCardProps) => {
  return (
    <Card key={item.id} className="flex overflow-hidden hover:shadow-md transition-shadow">
      <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
        <img 
          src={item.image || '/placeholder.svg'} 
          alt={item.name} 
          className="w-full h-full object-cover" 
          loading="lazy"
        />
      </div>
      <div className="flex-1 p-2 sm:p-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <h3 className="font-medium text-sm">{item.name}</h3>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
        <div className="flex justify-between items-center mt-2">
          <span className="font-semibold">₹{item.price}</span>
          <div className="flex items-center text-xs">
            {item.type === "immediate" ? (
              <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs mr-2">
                Ready
              </span>
            ) : (
              <span className="bg-brand/10 text-brand px-2 py-0.5 rounded text-xs mr-2">
                Made to order
              </span>
            )}
            <Button 
              size="sm" 
              className="h-7 w-7 rounded-full p-0 bg-brand hover:bg-brand/90 relative"
              onClick={onAddToCart}
              disabled={!item.available}
            >
              {isAdded ? (
                <Check className="h-4 w-4 text-white animate-scale-in" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
