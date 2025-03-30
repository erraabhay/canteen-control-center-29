
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function Loading({ 
  size = "md", 
  text = "Loading...", 
  className, 
  ...props 
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center space-y-2 p-4", 
        className
      )} 
      {...props}
    >
      <Loader2 className={cn("animate-spin text-muted-foreground", sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

export function FullPageLoading() {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center">
      <Loading size="lg" />
    </div>
  );
}
