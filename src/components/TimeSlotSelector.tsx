
import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Clock } from "lucide-react";
import { format, addMinutes } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { TimeSlot } from "@/types/database";

interface TimeSlotSelectorProps {
  value: string;
  onChange: (value: string) => void;
  availableSlots: TimeSlot[];
  cartHasMadeToOrder: boolean;
}

export const TimeSlotSelector = ({ 
  value, 
  onChange, 
  availableSlots,
  cartHasMadeToOrder
}: TimeSlotSelectorProps) => {
  const [dynamicTimeSlots, setDynamicTimeSlots] = useState<{value: string, label: string}[]>([]);
  const isMobile = useIsMobile();

  // Generate time slots for the next 2 hours in 15-minute intervals
  useEffect(() => {
    const now = new Date();
    const slots: {value: string, label: string}[] = [];
    
    // Round up to the nearest 15 minutes and add a buffer of 10 minutes for preparation
    const minutes = now.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 15) * 15 + 10;
    const startTime = new Date(now);
    startTime.setMinutes(roundedMinutes, 0, 0);
    
    // Generate slots for the next 2 hours
    for (let i = 0; i < 8; i++) {
      const slotTime = addMinutes(startTime, i * 15);
      const formattedTime = format(slotTime, "h:mm a");
      const pickupTime = `${formattedTime}`;
      
      slots.push({
        value: formattedTime,
        label: `Pickup at ${formattedTime}`
      });
    }
    
    // Filter slots based on availability from the database
    const filteredSlots = cartHasMadeToOrder 
      ? slots.filter(slot => {
          const matchingDbSlot = availableSlots.find(
            dbSlot => dbSlot.time === slot.value
          );
          // Only include if we have a matching slot in the database and it has capacity
          return matchingDbSlot;
        })
      : slots;
    
    setDynamicTimeSlots(filteredSlots);
  }, [availableSlots, cartHasMadeToOrder]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Select Pickup Time</label>
      <Select 
        value={value} 
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full">
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Choose pickup time" />
          </div>
        </SelectTrigger>
        <SelectContent className={isMobile ? "w-screen max-w-[100vw] px-3" : ""}>
          {dynamicTimeSlots.length > 0 ? (
            dynamicTimeSlots.map((slot) => (
              <SelectItem key={slot.value} value={slot.value} className="py-3">
                {slot.label}
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-center text-sm text-muted-foreground">
              No available pickup times with current order
            </div>
          )}
        </SelectContent>
      </Select>
      {cartHasMadeToOrder && (
        <p className="text-xs text-muted-foreground">
          Available pickup times may be limited due to made-to-order items in your cart.
        </p>
      )}
    </div>
  );
};
