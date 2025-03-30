
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface CategorySelectorProps {
  categories: string[];
  activeCategory: string | null;
  onCategoryChange: (category: string) => void;
}

export const CategorySelector = ({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}: CategorySelectorProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`overflow-x-auto pb-2 ${isMobile ? "-mx-2 px-2" : ""}`}>
      <div className="flex space-x-2 min-w-max">
        {categories.map(category => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            onClick={() => onCategoryChange(category)}
            className={`${activeCategory === category ? "bg-brand hover:bg-brand/90" : ""} whitespace-nowrap text-sm`}
            size={isMobile ? "sm" : "default"}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
};
