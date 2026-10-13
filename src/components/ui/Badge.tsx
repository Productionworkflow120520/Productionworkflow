import React, { HTMLAttributes } from "react";
import { cn, getStatusColor } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
}

export function Badge({
  children,
  status,
  variant,
  size = "md",
  dot = false,
  className,
  ...props
}: BadgeProps) {
  // If status is provided, use getStatusColor, otherwise check variant
  const variantClasses = {
    default: "bg-navy-100 text-navy-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    neutral: "bg-gray-100 text-gray-800",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
  };

  const statusClass = status ? getStatusColor(status) : variant ? variantClasses[variant] : variantClasses.default;

  return (
    <span
      className={cn(
        "badge font-medium inline-flex items-center gap-1.5 transition-colors",
        statusClass,
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current opacity-80"
          aria-hidden="true"
        />
      )}
      {children || (status ? status.replace(/_/g, " ") : null)}
    </span>
  );
}

export default Badge;
