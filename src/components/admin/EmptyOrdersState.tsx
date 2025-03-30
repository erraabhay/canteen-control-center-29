
import { ShoppingCart, Calendar, RefreshCw, CheckCircle, Check, XCircle } from "lucide-react";

interface EmptyOrdersStateProps {
  searchTerm: string;
  statusFilter: string;
}

export const EmptyOrdersState = ({ searchTerm, statusFilter }: EmptyOrdersStateProps) => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto h-12 w-12 text-muted-foreground opacity-20">
        {statusFilter === "all" ? (
          <ShoppingCart className="h-12 w-12" />
        ) : (
          statusFilter === "placed" ? <Calendar className="h-12 w-12" /> :
          statusFilter === "processing" ? <RefreshCw className="h-12 w-12" /> :
          statusFilter === "ready" ? <CheckCircle className="h-12 w-12" /> :
          statusFilter === "delivered" ? <Check className="h-12 w-12" /> :
          <XCircle className="h-12 w-12" />
        )}
      </div>
      <h3 className="mt-4 text-lg font-medium">No orders found</h3>
      <p className="text-muted-foreground">
        {searchTerm 
          ? "Try a different search term or filter" 
          : `No ${statusFilter !== "all" ? statusFilter : ""} orders found`}
      </p>
    </div>
  );
};
