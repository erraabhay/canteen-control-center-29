
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface MobileCartProps {
  cartItemCount: number;
  cartTotal: number;
}

export const MobileCart = ({ cartItemCount, cartTotal }: MobileCartProps) => {
  const handleOpenCart = () => {
    document.getElementById('cart-details')?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <div className="mb-4">
      <Button 
        onClick={handleOpenCart}
        variant="outline" 
        className="flex w-full justify-between items-center shadow-md bg-background border border-gray-200"
      >
        <div className="flex items-center">
          <ShoppingCart className="mr-2 h-4 w-4" />
          <span>{cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}</span>
        </div>
        <span className="font-bold">₹{cartTotal}</span>
      </Button>
    </div>
  );
};
