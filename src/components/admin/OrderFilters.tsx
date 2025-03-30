
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Calendar } from "lucide-react";

interface OrderFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
}

export const OrderFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange
}: OrderFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="md:flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          className="pl-9"
          placeholder="Search by order ID or user ID"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter Status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="placed">Placed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort By" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="highest">Highest Amount</SelectItem>
            <SelectItem value="lowest">Lowest Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
