
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
  type: "immediate" | "made-to-order";
}

interface CartItemComponentProps {
  item: CartItem;
  onRemove: () => void;
  onAdd: () => void;
}

export const CartItemComponent = ({ item, onRemove, onAdd }: CartItemComponentProps) => {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="font-medium text-sm">{item.name}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {item.type === "immediate" ? "Ready to serve" : "Made to order"}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-sm font-semibold">₹{item.price * item.quantity}</div>
        <div className="flex items-center border rounded">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-none p-0"
            onClick={onRemove}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-6 text-center text-sm">{item.quantity}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-none p-0"
            onClick={onAdd}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
