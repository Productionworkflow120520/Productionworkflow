import { UserRole } from "@prisma/client";

export interface DemoUser {
  id: string;
  userId: string;
  distributorId?: string | null;
  parentId?: string | null;
  parentDistributorId?: string | null;
  username: string;
  email: string;
  mobile: string;
  fullName: string;
  role: UserRole;
  status: "ACTIVE" | "SUSPENDED" | "PENDING_APPROVAL" | "REJECTED";
  kycStatus: "APPROVED" | "SUBMITTED" | "UNDER_REVIEW" | "NOT_SUBMITTED";
  businessName: string;
  city: string;
  state: string;
  pincode: string;
  walletBalance: number;
  reservedBalance: number;
  createdAt?: string;
}

const INITIAL_DEMO_USERS: Record<string, { user: DemoUser; pass: string }> = {
  // 1. Super Admin (System-level complete control)
  "admin@paymatrix.in": {
    pass: "Admin@123456",
    user: {
      id: "demo-user-super-admin",
      userId: "PM-SA-0001",
      distributorId: "DST-SA-0001",
      parentId: null,
      parentDistributorId: null,
      username: "superadmin",
      email: "admin@paymatrix.in",
      mobile: "9999999999",
      fullName: "Super Administrator",
      role: UserRole.SUPER_ADMIN,
      status: "ACTIVE",
      kycStatus: "APPROVED",
      businessName: "Recharge Pro Technologies Pvt Ltd",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      walletBalance: 0,
      reservedBalance: 0,
    },
  },
  // 2. Admin (Assigned administrative operations)
  "admin1@paymatrix.in": {
    pass: "Demo@12345",
    user: {
      id: "demo-user-admin-1",
      userId: "PM-AD-0001",
      distributorId: "DST-AD-0001",
      parentId: "demo-user-super-admin",
      parentDistributorId: "DST-SA-0001",
      username: "admin1",
      email: "admin1@paymatrix.in",
      mobile: "9888800001",
      fullName: "Rahul Sharma",
      role: UserRole.ADMIN,
      status: "ACTIVE",
      kycStatus: "APPROVED",
      businessName: "Sharma Regional Fintech",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
      walletBalance: 100000,
      reservedBalance: 0,
    },
  },
  // 3. Super Distributor (Reports to Admin; creates Master Dist, Dist, Retailers)
  "superdist1@paymatrix.in": {
    pass: "Demo@12345",
    user: {
      id: "demo-user-super-dist-1",
      userId: "PM-SD-0001",
      distributorId: "DST-SD-0001",
      parentId: "demo-user-admin-1",
      parentDistributorId: "DST-AD-0001",
      username: "superdist1",
      email: "superdist1@paymatrix.in",
      mobile: "9811100001",
      fullName: "Vikramaditya Rao",
      role: UserRole.SUPER_DISTRIBUTOR,
      status: "ACTIVE",
      kycStatus: "APPROVED",
      businessName: "Rao Mega Distribution Network",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500001",
      walletBalance: 150000,
      reservedBalance: 0,
    },
  },
  // 4. Master Distributor (Reports to Super Dist; creates Dist, Retailers)
  "masterdist1@paymatrix.in": {
    pass: "Demo@12345",
    user: {
      id: "demo-user-master-dist-1",
      userId: "PM-MD-0001",
      distributorId: "DST-MD-0001",
      parentId: "demo-user-super-dist-1",
      parentDistributorId: "DST-SD-0001",
      username: "masterdist1",
      email: "masterdist1@paymatrix.in",
      mobile: "9722200001",
      fullName: "Sunil Kulkarni",
      role: UserRole.MASTER_DISTRIBUTOR,
      status: "ACTIVE",
      kycStatus: "APPROVED",
      businessName: "Kulkarni Master Fintech Agency",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411001",
      walletBalance: 85000,
      reservedBalance: 0,
    },
  },
  // 5. Distributor (Reports to Master Dist; creates Retailers)
  "amit.kumar@example.com": {
    pass: "Demo@12345",
    user: {
      id: "demo-user-dist-1",
      userId: "PM-DT-0001",
      distributorId: "DST-0001",
      parentId: "demo-user-master-dist-1",
      parentDistributorId: "DST-MD-0001",
      username: "distributor1",
      email: "amit.kumar@example.com",
      mobile: "9777700001",
      fullName: "Amit Kumar",
      role: UserRole.DISTRIBUTOR,
      status: "ACTIVE",
      kycStatus: "APPROVED",
      businessName: "Amit Telecom Agency",
      city: "Patna",
      state: "Bihar",
      pincode: "800001",
      walletBalance: 50000,
      reservedBalance: 0,
    },
  },
  // 6. Retailer (Reports to Distributor; Customer transactions)
  "retailer1@example.com": {
    pass: "Demo@12345",
    user: {
      id: "demo-user-ret-1",
      userId: "PM-RT-0001",
      distributorId: null,
      parentId: "demo-user-dist-1",
      parentDistributorId: "DST-0001",
      username: "retailer1",
      email: "retailer1@example.com",
      mobile: "9666600001",
      fullName: "Suresh Verma",
      role: UserRole.RETAILER,
      status: "ACTIVE",
      kycStatus: "APPROVED",
      businessName: "Verma Mobile & Digital Services",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226001",
      walletBalance: 25480,
      reservedBalance: 0,
    },
  },
};

// Aliases for convenience & domain transition to Recharge Pro
INITIAL_DEMO_USERS["admin@rechargepro.in"] = INITIAL_DEMO_USERS["admin@paymatrix.in"];
INITIAL_DEMO_USERS["admin1@rechargepro.in"] = INITIAL_DEMO_USERS["admin1@paymatrix.in"];
INITIAL_DEMO_USERS["superdist1@rechargepro.in"] = INITIAL_DEMO_USERS["superdist1@paymatrix.in"];
INITIAL_DEMO_USERS["masterdist1@rechargepro.in"] = INITIAL_DEMO_USERS["masterdist1@paymatrix.in"];
INITIAL_DEMO_USERS["superadmin@rechargepro.in"] = INITIAL_DEMO_USERS["admin@paymatrix.in"];
INITIAL_DEMO_USERS["dist1@rechargepro.in"] = INITIAL_DEMO_USERS["amit.kumar@example.com"];
INITIAL_DEMO_USERS["distributor@rechargepro.in"] = INITIAL_DEMO_USERS["amit.kumar@example.com"];
INITIAL_DEMO_USERS["retailer@rechargepro.in"] = INITIAL_DEMO_USERS["retailer1@example.com"];
INITIAL_DEMO_USERS["retailer1@rechargepro.in"] = INITIAL_DEMO_USERS["retailer1@example.com"];

// Legacy PayMatrix aliases for backwards compatibility
INITIAL_DEMO_USERS["superadmin@paymatrix.in"] = INITIAL_DEMO_USERS["admin@paymatrix.in"];
INITIAL_DEMO_USERS["dist1@paymatrix.in"] = INITIAL_DEMO_USERS["amit.kumar@example.com"];
INITIAL_DEMO_USERS["distributor@paymatrix.in"] = INITIAL_DEMO_USERS["amit.kumar@example.com"];
INITIAL_DEMO_USERS["retailer@paymatrix.in"] = INITIAL_DEMO_USERS["retailer1@example.com"];
INITIAL_DEMO_USERS["retailer1@paymatrix.in"] = INITIAL_DEMO_USERS["retailer1@example.com"];

const globalForDemo = globalThis as unknown as {
  __demoUsers?: Record<string, { user: DemoUser; pass: string }>;
  __demoWallets?: DemoWalletSummary[];
  __demoWalletRequests?: DemoWalletRequest[];
  __demoLedger?: DemoLedgerEntry[];
};

if (!globalForDemo.__demoUsers) {
  globalForDemo.__demoUsers = INITIAL_DEMO_USERS;
} else {
  // Sync in case new roles were added to INITIAL_DEMO_USERS
  Object.assign(globalForDemo.__demoUsers, INITIAL_DEMO_USERS);
}
export const DEMO_USERS = globalForDemo.__demoUsers;

/**
 * Match a demo user by identifier (email, username, or userId)
 */
export function findDemoUser(identifier: string): { user: DemoUser; pass: string } | null {
  const cleanId = identifier.trim().toLowerCase();
  if (DEMO_USERS[cleanId]) {
    return DEMO_USERS[cleanId];
  }
  if (
    cleanId === "dist1@paymatrix.in" ||
    cleanId === "distributor@paymatrix.in" ||
    cleanId === "dist1@rechargepro.in" ||
    cleanId === "distributor@rechargepro.in"
  ) {
    return findDemoUser("amit.kumar@example.com");
  }
  if (
    cleanId === "retailer@paymatrix.in" ||
    cleanId === "retailer1@paymatrix.in" ||
    cleanId === "retailer@rechargepro.in" ||
    cleanId === "retailer1@rechargepro.in"
  ) {
    return findDemoUser("retailer1@example.com");
  }
  if (cleanId === "superadmin@paymatrix.in" || cleanId === "superadmin@rechargepro.in") {
    return findDemoUser("admin@paymatrix.in");
  }

  for (const entry of Object.values(DEMO_USERS)) {
    if (
      entry.user.email.toLowerCase() === cleanId ||
      entry.user.username.toLowerCase() === cleanId ||
      entry.user.userId.toLowerCase() === cleanId
    ) {
      return entry;
    }
  }
  return null;
}

/**
 * Get demo user by ID
 */
export function getDemoUserById(id: string): DemoUser | null {
  for (const entry of Object.values(DEMO_USERS)) {
    if (entry.user.id === id || entry.user.userId === id) {
      return entry.user;
    }
  }
  // Default fallback if session id matches Master Admin
  return DEMO_USERS["admin@rechargepro.in"]?.user || DEMO_USERS["admin@paymatrix.in"].user;
}

/**
 * Register a new user in demo store
 */
export function registerDemoUser(params: {
  fullName: string;
  businessName?: string;
  email: string;
  mobile: string;
  username: string;
  password: string;
  role?: UserRole;
  parentId?: string | null;
  parentDistributorId?: string | null;
  state?: string;
  city?: string;
  pincode?: string;
}): DemoUser {
  const role = params.role || UserRole.RETAILER;
  const count = Object.keys(DEMO_USERS).length;
  
  let prefix = "PM-RT";
  let distributorId: string | null = null;
  let initialBalance = 25000;

  switch (role) {
    case "SUPER_ADMIN":
    case "MASTER_ADMIN":
      prefix = "PM-SA";
      distributorId = `DST-SA-${String(count + 1).padStart(4, "0")}`;
      initialBalance = 0;
      break;
    case "ADMIN":
      prefix = "PM-AD";
      distributorId = `DST-AD-${String(count + 1).padStart(4, "0")}`;
      initialBalance = 100000;
      break;
    case "SUPER_DISTRIBUTOR":
      prefix = "PM-SD";
      distributorId = `DST-SD-${String(count + 1).padStart(4, "0")}`;
      initialBalance = 150000;
      break;
    case "MASTER_DISTRIBUTOR":
      prefix = "PM-MD";
      distributorId = `DST-MD-${String(count + 1).padStart(4, "0")}`;
      initialBalance = 85000;
      break;
    case "DISTRIBUTOR":
      prefix = "PM-DT";
      distributorId = `DST-${String(count + 1).padStart(4, "0")}`;
      initialBalance = 50000;
      break;
    case "RETAILER":
    default:
      prefix = "PM-RT";
      distributorId = null;
      initialBalance = 25000;
      break;
  }

  const userId = `${prefix}-${String(count + 1).padStart(4, "0")}`;
  const id = `demo-user-${Date.now()}`;

  const newUser: DemoUser = {
    id,
    userId,
    distributorId,
    parentId: params.parentId || null,
    parentDistributorId: params.parentDistributorId || null,
    username: params.username,
    email: params.email,
    mobile: params.mobile,
    fullName: params.fullName,
    role,
    status: "ACTIVE",
    kycStatus: "APPROVED",
    businessName: params.businessName || `${params.fullName}'s Business`,
    city: params.city || "Mumbai",
    state: params.state || "Maharashtra",
    pincode: params.pincode || "400001",
    walletBalance: initialBalance,
    reservedBalance: 0,
    createdAt: new Date().toISOString(),
  };

  DEMO_USERS[params.email.toLowerCase()] = {
    user: newUser,
    pass: params.password,
  };
  DEMO_USERS[params.username.toLowerCase()] = {
    user: newUser,
    pass: params.password,
  };

  // Add wallet to DEMO_WALLETS
  DEMO_WALLETS.push({
    id: `w-${id}`,
    userId,
    name: params.fullName,
    role,
    balance: initialBalance,
    reservedBalance: 0,
    lastTxnAt: new Date().toISOString(),
    status: "ACTIVE",
  });

  return newUser;
}

/**
 * Recursively gets all subordinate user IDs for a given user in the hierarchy
 */
export function getSubordinateUserIds(parentUserId: string): string[] {
  const result: string[] = [];
  const queue = [parentUserId];

  while (queue.length > 0) {
    const currId = queue.shift()!;
    for (const entry of Object.values(DEMO_USERS)) {
      if (
        (entry.user.parentId === currId || entry.user.parentDistributorId === currId) &&
        !result.includes(entry.user.id)
      ) {
        result.push(entry.user.id);
        result.push(entry.user.userId);
        queue.push(entry.user.id);
      }
    }
  }
  return result;
}

/**
 * Checks if targetUserId is subordinate to parentUserId
 */
export function isSubordinateUser(parentUserId: string, targetUserId: string): boolean {
  if (parentUserId === targetUserId) return true;
  const subordinates = getSubordinateUserIds(parentUserId);
  return subordinates.includes(targetUserId);
}


/**
 * Synthetic Dashboard Statistics for Demo Mode
 */
export function getSyntheticDashboardStats(role: string) {
  if (role === "SUPER_ADMIN" || role === "MASTER_ADMIN") {
    return {
      role: "MASTER_ADMIN",
      counts: {
        totalAdmins: 2,
        totalDistributors: 4,
        totalRetailers: 8,
        totalUsers: 14,
        activeUsers: 12,
        suspendedUsers: 1,
        pendingApprovalUsers: 1,
        kycPendingCount: 2,
      },
      transactions: {
        todayCount: 84,
        todaySuccessCount: 71,
        todayFailedCount: 11,
        todayPendingCount: 2,
        todayVolume: 245800,
        successRate: 84.5,
      },
      finances: {
        totalCommissionPaid: 4280.5,
        totalProviderFees: 620.0,
        totalWalletLiabilities: 345000,
        pendingWalletRequestsCount: 3,
        pendingWalletRequestsAmount: 75000,
      },
      operations: {
        openTicketsCount: 4,
        pendingRefundsCount: 2,
        apiHealth: {
          status: "HEALTHY",
          activeProviders: 3,
          successRateAvg: 99.2,
        },
      },
    };
  }

  if (role === "ADMIN") {
    return {
      role: "ADMIN",
      counts: {
        assignedDistributors: 2,
        assignedRetailers: 4,
        activeUsers: 6,
        pendingApprovalUsers: 0,
        kycPendingCount: 1,
      },
      transactions: {
        todayCount: 42,
        successCount: 36,
        failedCount: 5,
        pendingCount: 1,
        todayVolume: 122900,
        successRate: 85.7,
      },
      finances: {
        assignedWalletFloat: 180000,
        pendingRequestsCount: 1,
        commissionEarned: 1240.0,
      },
    };
  }

  if (role === "SUPER_DISTRIBUTOR") {
    return {
      role: "SUPER_DISTRIBUTOR",
      counts: {
        masterDistributorsCount: 2,
        distributorsCount: 4,
        retailersCount: 10,
        activeSubordinatesCount: 16,
      },
      transactions: {
        todayCount: 38,
        todaySuccessCount: 34,
        failedCount: 3,
        pendingCount: 1,
        todayVolume: 98400,
      },
      finances: {
        walletBalance: 150000,
        reservedBalance: 3000,
        commissionEarned: 1120.0,
        subordinateWalletFloat: 185000,
      },
    };
  }

  if (role === "MASTER_DISTRIBUTOR") {
    return {
      role: "MASTER_DISTRIBUTOR",
      counts: {
        distributorsCount: 3,
        retailersCount: 6,
        activeSubordinatesCount: 9,
      },
      transactions: {
        todayCount: 29,
        todaySuccessCount: 26,
        failedCount: 2,
        pendingCount: 1,
        todayVolume: 74200,
      },
      finances: {
        walletBalance: 85000,
        reservedBalance: 1500,
        commissionEarned: 840.0,
        subordinateWalletFloat: 95000,
      },
    };
  }

  if (role === "DISTRIBUTOR") {
    return {
      role: "DISTRIBUTOR",
      counts: {
        myRetailersCount: 2,
        activeRetailersCount: 2,
      },
      transactions: {
        todayCount: 24,
        successCount: 21,
        failedCount: 3,
        todayVolume: 64200,
      },
      finances: {
        walletBalance: 50000,
        reservedBalance: 0,
        commissionEarned: 680.0,
        retailerWalletFloat: 45000,
      },
    };
  }

  // RETAILER
  return {
    role: "RETAILER",
    transactions: {
      todayCount: 18,
      successCount: 16,
      failedCount: 2,
      todayVolume: 18450,
      successRate: 88.9,
    },
    finances: {
      walletBalance: 25480,
      reservedBalance: 0,
      commissionEarned: 342.5,
    },
  };
}

export function getSyntheticTransactions() {
  const ops = ["JIO", "AIRTEL", "VI", "TATA_PLAY", "BESCOM", "MAHAVITARAN", "IMPS"];
  const types = ["MOBILE_RECHARGE", "DTH_RECHARGE", "BBPS_PAYMENT", "DMT_TRANSFER"];
  const statuses = ["SUCCESS", "SUCCESS", "SUCCESS", "FAILED", "PENDING"];

  const txns = [];
  const now = Date.now();

  for (let i = 1; i <= 20; i++) {
    const type = types[i % types.length];
    const operator = ops[i % ops.length];
    const status = statuses[i % statuses.length];
    const amount = type === "DMT_TRANSFER" ? [1000, 2500, 5000, 10000][i % 4] : [199, 299, 479, 719, 1200][i % 5];
    const commission = parseFloat((amount * 0.025).toFixed(2));

    txns.push({
      id: `txn-demo-${i}`,
      txnId: `TXN-20261012-${10000 + i}`,
      type,
      status,
      amount,
      commission,
      netAmount: amount,
      serviceNumber: type === "MOBILE_RECHARGE" ? `98201${10000 + i}` : type === "DTH_RECHARGE" ? `30012${10000 + i}` : `A/C 987654${1000 + i}`,
      operator,
      providerRefId: `REF-${202610120000 + i}`,
      createdAt: new Date(now - i * 15 * 60 * 1000).toISOString(),
      user: {
        id: "demo-user-ret-1",
        userId: "PM-RT-0001",
        fullName: "Suresh Verma",
        role: "RETAILER",
      },
    });
  }

  return txns;
}

export interface DemoWalletRequest {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  userRole: string;
  type: "TOPUP" | "CREDIT_ADJUSTMENT" | "DEBIT_ADJUSTMENT";
  amount: number;
  paymentMethod?: string | null;
  paymentRef?: string | null;
  bankName?: string | null;
  remarks?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  user: {
    id: string;
    userId: string;
    fullName: string;
    role: string;
    mobile: string;
    businessName: string;
  };
  approver?: {
    id: string;
    userId: string;
    fullName: string;
    role: string;
  } | null;
}

export interface DemoWalletSummary {
  id: string;
  userId: string;
  name: string;
  role: UserRole;
  balance: number;
  reservedBalance: number;
  lastTxnAt?: string | null;
  status: "ACTIVE" | "SUSPENDED";
}

export interface DemoLedgerEntry {
  id: string;
  referenceId: string;
  userId: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  category: string;
  actor: string;
  createdAt: string;
}

const INITIAL_DEMO_WALLETS: DemoWalletSummary[] = [
  {
    id: "w-admin-1",
    userId: "PM-AD-0001",
    name: "Rahul Sharma",
    role: UserRole.ADMIN,
    balance: 100000.0,
    reservedBalance: 5000.0,
    lastTxnAt: new Date(Date.now() - 3600000).toISOString(),
    status: "ACTIVE",
  },
  {
    id: "w-super-dist-1",
    userId: "PM-SD-0001",
    name: "Vikramaditya Rao",
    role: UserRole.SUPER_DISTRIBUTOR,
    balance: 150000.0,
    reservedBalance: 3000.0,
    lastTxnAt: new Date(Date.now() - 2400000).toISOString(),
    status: "ACTIVE",
  },
  {
    id: "w-master-dist-1",
    userId: "PM-MD-0001",
    name: "Sunil Kulkarni",
    role: UserRole.MASTER_DISTRIBUTOR,
    balance: 85000.0,
    reservedBalance: 1500.0,
    lastTxnAt: new Date(Date.now() - 2100000).toISOString(),
    status: "ACTIVE",
  },
  {
    id: "w-dist-1",
    userId: "PM-DT-0001",
    name: "Amit Kumar",
    role: UserRole.DISTRIBUTOR,
    balance: 50000.0,
    reservedBalance: 2000.0,
    lastTxnAt: new Date(Date.now() - 1800000).toISOString(),
    status: "ACTIVE",
  },
  {
    id: "w-ret-1",
    userId: "PM-RT-0001",
    name: "Suresh Verma",
    role: "RETAILER",
    balance: 25480.0,
    reservedBalance: 250.0,
    lastTxnAt: new Date(Date.now() - 600000).toISOString(),
    status: "ACTIVE",
  },
  {
    id: "w-ret-2",
    userId: "PM-RT-0002",
    name: "Ramesh Patel",
    role: "RETAILER",
    balance: 15200.0,
    reservedBalance: 0.0,
    lastTxnAt: new Date(Date.now() - 7200000).toISOString(),
    status: "ACTIVE",
  },
];

if (!globalForDemo.__demoWallets) {
  globalForDemo.__demoWallets = INITIAL_DEMO_WALLETS;
}
export const DEMO_WALLETS = globalForDemo.__demoWallets;

const INITIAL_DEMO_WALLET_REQUESTS: DemoWalletRequest[] = [
  {
    id: "wr-1",
    requestId: "WR-20261012-0041",
    userId: "demo-user-dist-1",
    userName: "Venkatesh Rao",
    userRole: "DISTRIBUTOR",
    type: "TOPUP",
    amount: 50000,
    paymentMethod: "NEFT",
    paymentRef: "SBIN202610129841",
    bankName: "State Bank of India",
    remarks: "Distributor float replenishment",
    status: "PENDING",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    user: {
      id: "demo-user-dist-1",
      userId: "PM-DT-0012",
      fullName: "Venkatesh Rao",
      role: "DISTRIBUTOR",
      mobile: "9777700001",
      businessName: "Rao Mega Distribution Network",
    },
    approver: null,
  },
  {
    id: "wr-2",
    requestId: "WR-20261012-0042",
    userId: "demo-user-ret-1",
    userName: "Vikram Sharma",
    userRole: "RETAILER",
    type: "TOPUP",
    amount: 10000,
    paymentMethod: "UPI",
    paymentRef: "UPI/39201948194",
    bankName: "HDFC Bank",
    remarks: "Retailer float recharge",
    status: "PENDING",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    user: {
      id: "demo-user-ret-1",
      userId: "PM-RT-0120",
      fullName: "Vikram Sharma",
      role: "RETAILER",
      mobile: "9666600001",
      businessName: "Sharma Fast Point",
    },
    approver: null,
  },
  {
    id: "wr-3",
    requestId: "WR-20261012-0043",
    userId: "demo-user-admin-1",
    userName: "Rajesh Kumar",
    userRole: "ADMIN",
    type: "TOPUP",
    amount: 200000,
    paymentMethod: "RTGS",
    paymentRef: "ICIC2938194019",
    bankName: "ICICI Bank",
    remarks: "Admin Treasury Float",
    status: "PENDING",
    createdAt: new Date(Date.now() - 900000).toISOString(),
    user: {
      id: "demo-user-admin-1",
      userId: "PM-AD-0001",
      fullName: "Rajesh Kumar",
      role: "ADMIN",
      mobile: "9888800001",
      businessName: "Central Admin Float",
    },
    approver: null,
  },
  {
    id: "req-demo-1",
    requestId: "WR-20261012-001",
    userId: "demo-user-ret-1",
    userName: "Suresh Verma",
    userRole: "RETAILER",
    type: "TOPUP",
    amount: 25000,
    paymentMethod: "UPI",
    paymentRef: "UPI/428901234567",
    bankName: "HDFC Bank",
    remarks: "Weekly retailer float top-up",
    status: "PENDING",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    user: {
      id: "demo-user-ret-1",
      userId: "PM-RT-0001",
      fullName: "Suresh Verma",
      role: "RETAILER",
      mobile: "9666600001",
      businessName: "Verma Mobile & Digital Services",
    },
    approver: null,
  },
  {
    id: "req-demo-2",
    requestId: "WR-20261012-002",
    userId: "demo-user-dist-1",
    userName: "Amit Kumar",
    userRole: "DISTRIBUTOR",
    type: "TOPUP",
    amount: 50000,
    paymentMethod: "NEFT",
    paymentRef: "NEFT/HDFC9823101",
    bankName: "State Bank of India",
    remarks: "Distributor float replenishment",
    status: "PENDING",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    user: {
      id: "demo-user-dist-1",
      userId: "PM-DT-0001",
      fullName: "Amit Kumar",
      role: "DISTRIBUTOR",
      mobile: "9777700001",
      businessName: "Amit Telecom Agency",
    },
    approver: null,
  },
  {
    id: "req-demo-3",
    requestId: "WR-20261011-001",
    userId: "demo-user-ret-1",
    userName: "Suresh Verma",
    userRole: "RETAILER",
    type: "TOPUP",
    amount: 10000,
    paymentMethod: "IMPS",
    paymentRef: "IMPS/9281948192",
    bankName: "ICICI Bank",
    remarks: "Initial onboarding float",
    status: "APPROVED",
    approvedBy: "demo-user-admin-1",
    approvedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 90000000).toISOString(),
    user: {
      id: "demo-user-ret-1",
      userId: "PM-RT-0001",
      fullName: "Suresh Verma",
      role: "RETAILER",
      mobile: "9666600001",
      businessName: "Verma Mobile & Digital Services",
    },
    approver: {
      id: "demo-user-admin-1",
      userId: "PM-AD-0001",
      fullName: "Rahul Sharma",
      role: "ADMIN",
    },
  },
];

if (!globalForDemo.__demoWalletRequests) {
  globalForDemo.__demoWalletRequests = INITIAL_DEMO_WALLET_REQUESTS;
}
export const DEMO_WALLET_REQUESTS = globalForDemo.__demoWalletRequests;

const INITIAL_DEMO_LEDGER: DemoLedgerEntry[] = [
  {
    id: "led-1",
    referenceId: "LED-20261012-001",
    userId: "demo-user-ret-1",
    type: "CREDIT",
    amount: 10000,
    balanceBefore: 15480,
    balanceAfter: 25480,
    description: "Float topup approved by Admin Rahul Sharma",
    category: "TOPUP",
    actor: "PM-AD-0001",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "led-2",
    referenceId: "LED-20261012-002",
    userId: "demo-user-ret-1",
    type: "DEBIT",
    amount: 299,
    balanceBefore: 25779,
    balanceAfter: 25480,
    description: "Mobile Recharge for Jio (9820110001)",
    category: "RECHARGE",
    actor: "PM-RT-0001",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "led-3",
    referenceId: "LED-20261012-003",
    userId: "demo-user-ret-1",
    type: "CREDIT",
    amount: 7.48,
    balanceBefore: 25771.52,
    balanceAfter: 25779,
    description: "Commission credit for Mobile Recharge",
    category: "COMMISSION",
    actor: "SYSTEM",
    createdAt: new Date(Date.now() - 3595000).toISOString(),
  },
  {
    id: "led-4",
    referenceId: "LED-20261012-004",
    userId: "demo-user-dist-1",
    type: "CREDIT",
    amount: 50000,
    balanceBefore: 0,
    balanceAfter: 50000,
    description: "Float topup approved by Master Admin",
    category: "TOPUP",
    actor: "PM-MA-0001",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

if (!globalForDemo.__demoLedger) {
  globalForDemo.__demoLedger = INITIAL_DEMO_LEDGER;
}
export const DEMO_LEDGER = globalForDemo.__demoLedger;


export function getDemoWallets(): DemoWalletSummary[] {
  return DEMO_WALLETS;
}

export function getDemoWalletRequests(filters: { status?: string; userId?: string } = {}) {
  let list = [...DEMO_WALLET_REQUESTS];
  if (filters.status && filters.status !== "ALL") {
    list = list.filter((r) => r.status === filters.status);
  }
  if (filters.userId) {
    list = list.filter((r) => r.userId === filters.userId || r.user?.userId === filters.userId);
  }
  return {
    requests: list,
    pagination: {
      page: 1,
      limit: 20,
      total: list.length,
      totalPages: 1,
    },
  };
}

export function createDemoWalletRequest(params: {
  userId: string;
  type?: string;
  amount: number;
  paymentMethod?: string;
  paymentRef?: string;
  bankName?: string;
  remarks?: string;
}) {
  const user = getDemoUserById(params.userId) || DEMO_USERS["retailer1@example.com"].user;
  const newReq: DemoWalletRequest = {
    id: `req-demo-${Date.now()}`,
    requestId: `WR-${Date.now().toString().slice(-6)}`,
    userId: user.id,
    userName: user.fullName,
    userRole: user.role,
    type: (params.type as any) || "TOPUP",
    amount: params.amount,
    paymentMethod: params.paymentMethod || "UPI",
    paymentRef: params.paymentRef || `REF-${Date.now()}`,
    bankName: params.bankName || "HDFC Bank",
    remarks: params.remarks || "Wallet Float Request",
    status: "PENDING",
    createdAt: new Date().toISOString(),
    user: {
      id: user.id,
      userId: user.userId,
      fullName: user.fullName,
      role: user.role,
      mobile: user.mobile,
      businessName: user.businessName,
    },
    approver: null,
  };

  DEMO_WALLET_REQUESTS.unshift(newReq);
  return newReq;
}

export function updateDemoUser(
  id: string,
  updates: Partial<DemoUser>
): DemoUser | null {
  for (const entry of Object.values(DEMO_USERS)) {
    if (
      entry.user.id === id ||
      entry.user.userId === id ||
      entry.user.username.toLowerCase() === id.toLowerCase() ||
      entry.user.email.toLowerCase() === id.toLowerCase()
    ) {
      Object.assign(entry.user, updates);
      if (updates.status) {
        const w = DEMO_WALLETS.find(
          (wallet) => wallet.userId === entry.user.userId || wallet.id === entry.user.id
        );
        if (w) w.status = updates.status === "ACTIVE" ? "ACTIVE" : "SUSPENDED";
      }
      return entry.user;
    }
  }
  return null;
}

export function updateDemoWalletRequest(
  requestId: string,
  status: "APPROVED" | "REJECTED",
  reason?: string,
  approverId?: string
) {
  let req = DEMO_WALLET_REQUESTS.find((r) => r.id === requestId || r.requestId === requestId);
  if (!req) {
    // Graceful fallback for synthetic or custom requests
    req = {
      id: requestId,
      requestId: `WR-${requestId}`,
      userId: "demo-user-ret-1",
      userName: "Retailer Merchant",
      userRole: "RETAILER",
      type: "TOPUP",
      amount: 10000,
      paymentMethod: "UPI",
      status: "PENDING",
      createdAt: new Date().toISOString(),
      user: {
        id: "demo-user-ret-1",
        userId: "PM-RT-0001",
        fullName: "Suresh Verma",
        role: "RETAILER",
        mobile: "9666600001",
        businessName: "Verma Mobile & Digital Services",
      },
      approver: null,
    };
    DEMO_WALLET_REQUESTS.push(req);
  }

  req.status = status;
  req.approvedAt = new Date().toISOString();
  if (status === "APPROVED") {
    req.approvedBy = approverId || "PM-MA-0001";
    // Credit wallet balance
    const userWallet = DEMO_WALLETS.find((w) => w.userId === req.user.userId || w.id === req.userId);
    if (userWallet) {
      userWallet.balance += req.amount;
      userWallet.lastTxnAt = new Date().toISOString();
    }
    // Also update in DEMO_USERS
    for (const u of Object.values(DEMO_USERS)) {
      if (u.user.id === req.userId || u.user.userId === req.user.userId) {
        u.user.walletBalance += req.amount;
      }
    }
  } else {
    req.rejectionReason = reason || "Declined by administrator";
  }

  return req;
}

export function transferDemoWallet(
  senderUserId: string,
  recipientUserId: string,
  amount: number,
  remarks?: string
) {
  // Find sender and recipient
  let senderWallet = DEMO_WALLETS.find((w) => w.userId === senderUserId || w.id === senderUserId);
  let recipientWallet = DEMO_WALLETS.find((w) => w.userId === recipientUserId || w.id === recipientUserId);

  if (!senderWallet) {
    senderWallet = DEMO_WALLETS.find((w) => w.role === "DISTRIBUTOR");
  }
  if (!recipientWallet) {
    recipientWallet = DEMO_WALLETS.find((w) => w.role === "RETAILER");
  }

  if (senderWallet && senderWallet.balance < amount) {
    throw new Error("Insufficient wallet balance for transfer");
  }

  if (senderWallet) {
    senderWallet.balance -= amount;
    senderWallet.lastTxnAt = new Date().toISOString();
  }
  if (recipientWallet) {
    recipientWallet.balance += amount;
    recipientWallet.lastTxnAt = new Date().toISOString();
  }

  // Update in DEMO_USERS as well
  for (const u of Object.values(DEMO_USERS)) {
    if (senderWallet && (u.user.id === senderWallet.id || u.user.userId === senderWallet.userId)) {
      u.user.walletBalance -= amount;
    }
    if (recipientWallet && (u.user.id === recipientWallet.id || u.user.userId === recipientWallet.userId)) {
      u.user.walletBalance += amount;
    }
  }

  // Record ledger entry
  const refId = `TRF-${Date.now().toString().slice(-8)}`;
  DEMO_LEDGER.unshift({
    id: `led-${Date.now()}`,
    referenceId: refId,
    userId: recipientUserId,
    type: "CREDIT",
    amount,
    balanceBefore: (recipientWallet?.balance || 0) - amount,
    balanceAfter: recipientWallet?.balance || 0,
    description: remarks || `Float transfer from ${senderWallet?.name || "Distributor"}`,
    category: "TRANSFER",
    actor: senderUserId,
    createdAt: new Date().toISOString(),
  });

  return {
    success: true,
    referenceId: refId,
    transferredAmount: amount,
    senderBalance: senderWallet?.balance ?? 0,
    recipientBalance: recipientWallet?.balance ?? 0,
  };
}

export function getDemoLedgerEntries(userId: string) {
  return {
    entries: DEMO_LEDGER,
    pagination: {
      page: 1,
      limit: 20,
      total: DEMO_LEDGER.length,
      totalPages: 1,
    },
  };
}
