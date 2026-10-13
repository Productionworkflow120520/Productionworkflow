import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format currency in INR */
export function formatCurrency(amount?: number | string | null): string {
  if (amount === undefined || amount === null || amount === "") return "₹0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num) || !isFinite(num)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/** Convert INR rupees to integer paise (1 INR = 100 paise) */
export function inrToPaise(amountInr: number | string): bigint {
  const parsed = typeof amountInr === "string" ? parseFloat(amountInr) : amountInr;
  if (isNaN(parsed) || !isFinite(parsed)) return BigInt(0);
  return BigInt(Math.round(parsed * 100));
}

/** Convert integer paise to INR rupees (100 paise = 1 INR) */
export function paiseToInr(amountPaise: bigint | number | string): number {
  if (typeof amountPaise === "bigint") {
    return Number(amountPaise) / 100;
  }
  const parsed = typeof amountPaise === "string" ? Number(amountPaise) : amountPaise;
  if (isNaN(parsed) || !isFinite(parsed)) return 0;
  return parsed / 100;
}

/** Format paise directly into INR currency string */
export function formatPaise(amountPaise?: bigint | number | string | null): string {
  if (amountPaise === undefined || amountPaise === null) return "₹0.00";
  return formatCurrency(paiseToInr(amountPaise));
}

/** Format date in IST with null-safety */
export function formatDate(date?: Date | string | null, includeTime = false): string {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d.getTime())) return "-";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    };
    if (includeTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }
    return d.toLocaleDateString("en-IN", options);
  } catch {
    return "-";
  }
}

/** Format date and time in IST with null-safety */
export function formatDateTime(date?: Date | string | null): string {
  return formatDate(date, true);
}

/** Generate unique ID with prefix */
export function generateId(prefix: string): string {
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${date}-${random}`;
}

/** Generate user ID based on role */
export function generateUserId(
  role: string,
  sequence: number
): string {
  const prefixes: Record<string, string> = {
    SUPER_ADMIN: "PM-SA",
    MASTER_ADMIN: "PM-SA",
    ADMIN: "PM-AD",
    SUPER_DISTRIBUTOR: "PM-SD",
    MASTER_DISTRIBUTOR: "PM-MD",
    DISTRIBUTOR: "PM-DT",
    RETAILER: "PM-RT",
  };
  const prefix = prefixes[role] || "PM-XX";
  return `${prefix}-${String(sequence).padStart(4, "0")}`;
}

/** Generate unique distributor ID where applicable */
export function generateDistributorId(role: string, sequence: number): string | null {
  switch (role) {
    case "SUPER_ADMIN":
    case "MASTER_ADMIN":
      return `DST-SA-${String(sequence).padStart(4, "0")}`;
    case "ADMIN":
      return `DST-AD-${String(sequence).padStart(4, "0")}`;
    case "SUPER_DISTRIBUTOR":
      return `DST-SD-${String(sequence).padStart(4, "0")}`;
    case "MASTER_DISTRIBUTOR":
      return `DST-MD-${String(sequence).padStart(4, "0")}`;
    case "DISTRIBUTOR":
      return `DST-${String(sequence).padStart(4, "0")}`;
    case "RETAILER":
    default:
      return null;
  }
}

/** Mask sensitive data */
export function maskString(
  str: string,
  visibleStart = 2,
  visibleEnd = 2
): string {
  if (str.length <= visibleStart + visibleEnd) return str;
  const start = str.slice(0, visibleStart);
  const end = str.slice(-visibleEnd);
  const masked = "*".repeat(str.length - visibleStart - visibleEnd);
  return `${start}${masked}${end}`;
}

/** Mask mobile number */
export function maskMobile(mobile: string): string {
  return maskString(mobile, 2, 3);
}

/** Mask email */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return `${maskString(local, 2, 1)}@${domain}`;
}

/** Get status badge color classes */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    SUCCESS: "bg-green-100 text-green-800",
    APPROVED: "bg-green-100 text-green-800",
    CREDITED: "bg-green-100 text-green-800",
    COMPLETED: "bg-green-100 text-green-800",
    RESOLVED: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    UNDER_REVIEW: "bg-blue-100 text-blue-800",
    SUBMITTED: "bg-blue-100 text-blue-800",
    INITIATED: "bg-gray-100 text-gray-800",
    OPEN: "bg-gray-100 text-gray-800",
    FAILED: "bg-red-100 text-red-800",
    REJECTED: "bg-red-100 text-red-800",
    SUSPENDED: "bg-red-100 text-red-800",
    REFUNDED: "bg-purple-100 text-purple-800",
    REVERSAL_PENDING: "bg-orange-100 text-orange-800",
    CANCELLED: "bg-gray-100 text-gray-600",
    CLOSED: "bg-gray-100 text-gray-600",
    EXPIRED: "bg-gray-100 text-gray-600",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

/** Truncate string */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/** Validate Indian mobile number */
export function isValidMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile);
}

/** Validate email */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Calculate percentage */
export function calcPercentage(
  value: number,
  total: number,
  decimals = 1
): number {
  if (total === 0) return 0;
  return parseFloat(((value / total) * 100).toFixed(decimals));
}

/** Safe JSON parse */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

/** Delay helper for demo mode */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Check if demo mode is enabled */
export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}
