import React from "react";
import { cn, formatCurrency } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: number | string;
  isCurrency?: boolean;
  icon?: React.ReactNode;
  iconColor?: "navy" | "green" | "blue" | "amber" | "purple" | "red";
  trend?: {
    value: number | string; // percentage
    label?: string;
    isPositive?: boolean;
  };
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  isCurrency = false,
  icon,
  iconColor = "navy",
  trend,
  subtitle,
  className,
  onClick,
}: StatCardProps) {
  const displayValue =
    typeof value === "number"
      ? isCurrency
        ? formatCurrency(value)
        : value.toLocaleString("en-IN")
      : value;

  const iconColorStyles = {
    navy: "bg-navy-50 text-navy-600",
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
  };

  const isPositive = trend
    ? trend.isPositive !== undefined
      ? trend.isPositive
      : Number(trend.value) >= 0
    : true;

  return (
    <div
      onClick={onClick}
      className={cn(
        "stat-card hover:shadow-card-hover transition-all duration-200 relative overflow-hidden",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            {title}
          </p>
          <div className="text-2xl font-bold text-gray-900 tracking-tight">
            {displayValue}
          </div>
        </div>

        {icon && (
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
              iconColorStyles[iconColor]
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {(trend || subtitle) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded",
                isPositive
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              )}
            >
              {isPositive ? (
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {Math.abs(Number(trend.value))}%
            </span>
          )}
          <span className="text-gray-500">{trend?.label || subtitle}</span>
        </div>
      )}
    </div>
  );
}

export default StatCard;
