
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Calendar, Check, XCircle } from "lucide-react";

interface OrderStatsProps {
  activeOrdersCount: number;
  todayOrdersCount: number;
  completedOrdersCount: number;
  cancelledOrdersCount: number;
}

export const OrderStats = ({ 
  activeOrdersCount, 
  todayOrdersCount, 
  completedOrdersCount, 
  cancelledOrdersCount 
}: OrderStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Orders</p>
            <h3 className="text-2xl font-bold">{activeOrdersCount}</h3>
          </div>
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <RefreshCw className="h-5 w-5 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Today's Orders</p>
            <h3 className="text-2xl font-bold">{todayOrdersCount}</h3>
          </div>
          <div className="h-10 w-10 bg-brand/10 rounded-full flex items-center justify-center">
            <Calendar className="h-5 w-5 text-brand" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Completed</p>
            <h3 className="text-2xl font-bold">{completedOrdersCount}</h3>
          </div>
          <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-5 w-5 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
            <h3 className="text-2xl font-bold">{cancelledOrdersCount}</h3>
          </div>
          <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
