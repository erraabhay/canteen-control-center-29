
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface OrderSuccessViewProps {
  selectedTimeSlot: string;
}

export const OrderSuccessView = ({ selectedTimeSlot }: OrderSuccessViewProps) => {
  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card className="animate-fade-in">
        <CardContent className="pt-6 text-center">
          <div className="mb-4 flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Order Placed Successfully!</h2>
          <p className="text-muted-foreground mb-6">
            Your order has been placed and will be ready for pickup at {selectedTimeSlot}.
          </p>
          <Button className="bg-brand hover:bg-brand/90" asChild>
            <a href="/history">View Order Status</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
