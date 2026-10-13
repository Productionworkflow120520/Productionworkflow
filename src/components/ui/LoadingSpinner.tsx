import React from "react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  message?: string;
  className?: string;
  fullPage?: boolean;
}

export function LoadingSpinner({
  size = "md",
  message,
  className,
  fullPage = false,
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
    xl: "h-16 w-16 border-4",
  };

  const spinner = (
    <div className={cn("flex flex-col items-center justify-center gap-3 p-4", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-solid border-navy-500 border-t-transparent",
          sizeMap[size]
        )}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p className="text-sm font-medium text-gray-500 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-xs">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export default LoadingSpinner;
