export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Recharge Pro";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";


export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  MASTER_ADMIN: "MASTER_ADMIN", // Supported alias for SUPER_ADMIN
  ADMIN: "ADMIN",
  SUPER_DISTRIBUTOR: "SUPER_DISTRIBUTOR",
  MASTER_DISTRIBUTOR: "MASTER_DISTRIBUTOR",
  DISTRIBUTOR: "DISTRIBUTOR",
  RETAILER: "RETAILER",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  MASTER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SUPER_DISTRIBUTOR: "Super Distributor",
  MASTER_DISTRIBUTOR: "Master Distributor",
  DISTRIBUTOR: "Distributor",
  RETAILER: "Retailer",
};

export const USER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  PENDING_APPROVAL: "Pending Approval",
  REJECTED: "Rejected",
};

export const KYC_STATUS_LABELS: Record<string, string> = {
  NOT_SUBMITTED: "Not Submitted",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};

export const TRANSACTION_STATUS_LABELS: Record<string, string> = {
  INITIATED: "Initiated",
  PROCESSING: "Processing",
  PENDING: "Pending",
  SUCCESS: "Success",
  FAILED: "Failed",
  REVERSAL_PENDING: "Reversal Pending",
  REFUNDED: "Refunded",
  UNDER_REVIEW: "Under Review",
};

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  MOBILE_RECHARGE: "Mobile Recharge",
  DTH_RECHARGE: "DTH Recharge",
  BBPS_PAYMENT: "BBPS Payment",
  AEPS_WITHDRAWAL: "AEPS Withdrawal",
  AEPS_BALANCE: "AEPS Balance Inquiry",
  AEPS_MINI_STATEMENT: "AEPS Mini Statement",
  AEPS_AADHAAR_PAY: "Aadhaar Pay",
  WALLET_TOPUP: "Wallet Top-up",
  WALLET_TRANSFER: "Wallet Transfer",
  WALLET_ADJUSTMENT: "Wallet Adjustment",
  COMMISSION_CREDIT: "Commission Credit",
  REFUND_CREDIT: "Refund Credit",
  DMT_TRANSFER: "Money Transfer (DMT)",
  DMT_PENNY_DROP: "Penny Drop Account Verification",
};

export const SERVICE_TYPES = [
  "MOBILE_RECHARGE",
  "DTH_RECHARGE",
  "BBPS_PAYMENT",
  "AEPS_WITHDRAWAL",
  "AEPS_BALANCE",
  "AEPS_MINI_STATEMENT",
  "AEPS_AADHAAR_PAY",
  "DMT_TRANSFER",
] as const;

export const MOBILE_OPERATORS = [
  { code: "JIO", name: "Jio" },
  { code: "AIRTEL", name: "Airtel" },
  { code: "VI", name: "Vi (Vodafone Idea)" },
  { code: "BSNL", name: "BSNL" },
];

export const DTH_OPERATORS = [
  { code: "TATA_PLAY", name: "Tata Play" },
  { code: "AIRTEL_DTH", name: "Airtel Digital TV" },
  { code: "DISH_TV", name: "Dish TV" },
  { code: "SUN_DIRECT", name: "Sun Direct" },
  { code: "D2H", name: "D2H" },
];

export const BBPS_CATEGORIES = [
  { code: "ELECTRICITY", name: "Electricity", icon: "⚡" },
  { code: "WATER", name: "Water", icon: "💧" },
  { code: "GAS", name: "Gas", icon: "🔥" },
  { code: "BROADBAND", name: "Broadband", icon: "🌐" },
  { code: "LANDLINE", name: "Landline", icon: "📞" },
  { code: "POSTPAID", name: "Postpaid Mobile", icon: "📱" },
  { code: "FASTAG", name: "FASTag", icon: "🚗" },
  { code: "INSURANCE", name: "Insurance", icon: "🛡️" },
  { code: "LOAN_REPAYMENT", name: "Loan Repayment", icon: "🏦" },
  { code: "CABLE_TV", name: "Cable TV", icon: "📺" },
];

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

export const PAYMENT_METHODS = [
  { code: "NEFT", name: "NEFT" },
  { code: "IMPS", name: "IMPS" },
  { code: "UPI", name: "UPI" },
  { code: "RTGS", name: "RTGS" },
  { code: "CASH", name: "Cash Deposit" },
];

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

export const LIMITS = {
  MIN_RECHARGE: 10,
  MAX_RECHARGE: 10000,
  MIN_DTH: 100,
  MAX_DTH: 5000,
  MIN_BBPS: 1,
  MAX_BBPS: 100000,
  MIN_WALLET_TOPUP: 100,
  MAX_WALLET_TOPUP: 500000,
};
