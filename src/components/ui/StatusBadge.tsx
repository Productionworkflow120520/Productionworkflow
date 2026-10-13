import React from "react";
import { cn, getStatusColor } from "@/lib/utils";
import {
  USER_STATUS_LABELS,
  KYC_STATUS_LABELS,
  TRANSACTION_STATUS_LABELS,
} from "@/lib/constants";

export interface StatusBadgeProps {
  status: string;
  type?: "transaction" | "user" | "kyc" | "generic";
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  type = "generic",
  size = "md",
  showDot = true,
  className,
}: StatusBadgeProps) {
  const getLabel = () => {
    if (type === "transaction" && TRANSACTION_STATUS_LABELS[status]) {
      return TRANSACTION_STATUS_LABELS[status];
    }
    if (type === "user" && USER_STATUS_LABELS[status]) {
      return USER_STATUS_LABELS[status];
    }
    if (type === "kyc" && KYC_STATUS_LABELS[status]) {
      return KYC_STATUS_LABELS[status];
    }

    // Default label fallback
    return (
      TRANSACTION_STATUS_LABELS[status] ||
      USER_STATUS_LABELS[status] ||
      KYC_STATUS_LABELS[status] ||
      status.replace(/_/g, " ")
    );
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
  };

  const colorClass = getStatusColor(status);

  return (
    <span
      className={cn(
        "badge inline-flex items-center gap-1.5 font-medium tracking-wide capitalize",
        colorClass,
        sizeClasses[size],
        className
      )}
    >
      {showDot && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current opacity-75"
          aria-hidden="true"
        />
      )}
      <span>{getLabel()}</span>
    </span>
  );
}

export default StatusBadge;
