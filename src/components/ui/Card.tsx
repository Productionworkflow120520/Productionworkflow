import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: "default" | "stat" | "hover";
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  extra?: React.ReactNode;
  // Stat variant specific props
  icon?: React.ReactNode;
  value?: React.ReactNode;
  label?: React.ReactNode;
  trend?: {
    value: number | string;
    isPositive?: boolean;
    label?: string;
  };
}

export function Card({
  className,
  variant = "default",
  title,
  description,
  footer,
  extra,
  icon,
  value,
  label,
  trend,
  children,
  ...props
}: CardProps) {
  if (variant === "stat") {
    return (
      <div
        className={cn(
          "card flex flex-col justify-between transition-all duration-200 hover:shadow-card-hover",
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              {label || title}
            </p>
            <div className="text-2xl font-bold text-gray-900 tracking-tight">
              {value}
            </div>
          </div>
          {icon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
              {icon}
            </div>
          )}
        </div>

        {(trend || description) && (
          <div className="mt-4 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center font-semibold px-1.5 py-0.5 rounded",
                  trend.isPositive !== false
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                )}
              >
                {trend.isPositive !== false ? "↑" : "↓"} {trend.value}
              </span>
            )}
            <span className="text-gray-500">{trend?.label || description}</span>
          </div>
        )}
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        variant === "hover" ? "card-hover" : "card",
        className
      )}
      {...props}
    >
      {(title || description || extra) && (
        <div className="flex items-start justify-between pb-4 border-b border-gray-100 mb-4 gap-4">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-gray-900">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          {extra && <div className="shrink-0">{extra}</div>}
        </div>
      )}

      <div>{children}</div>

      {footer && (
        <div className="pt-4 border-t border-gray-100 mt-4 text-sm text-gray-600">
          {footer}
        </div>
      )}
    </div>
  );
}

export default Card;
