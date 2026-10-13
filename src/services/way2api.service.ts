import fs from "fs";
import path from "path";

// ─── TYPES & INTERFACES ──────────────────────────────────────

export interface MobileLookupResult {
  mobile: string;
  operator: string;
  operatorName: string;
  circle: string;
  circleName: string;
  connectionType: "PREPAID" | "POSTPAID";
  isPorted: boolean;
  portedFrom?: string;
  providerReference: string;
  verifiedAt: string;
}

export interface DthCustomerDetailsResult {
  subscriberId: string;
  operator: string;
  operatorName: string;
  customerName: string;
  registeredMobileMasked: string;
  balance: number;
  monthlyPlanAmount: number;
  currentPlanName: string;
  accountStatus: "ACTIVE" | "SUSPENDED" | "DEACTIVE";
  nextRechargeDate: string;
  providerReference: string;
  verifiedAt: string;
}

export interface RechargePlanItem {
  planId: string;
  operator: string;
  circle: string;
  category: "POPULAR" | "UNLIMITED" | "DATA" | "TALKTIME" | "SMS" | "VALIDITY" | "SPECIAL" | "MONTHLY" | "LONG_TERM";
  amount: number;
  validity: string;
  validityDays: number;
  dataAllowance?: string;
  callingDetails?: string;
  smsAllowance?: string;
  description: string;
  talktime?: number;
  benefits: string[];
}

export interface RechargeTransactionResult {
  transactionId: string;
  idempotencyKey: string;
  serviceType: "MOBILE" | "DTH";
  identifier: string; // mobile number or subscriber ID
  operator: string;
  operatorName: string;
  circle?: string;
  amount: number;
  planDescription: string;
  status: "SUCCESS" | "PENDING" | "FAILED";
  operatorReference: string;
  providerReference: string;
  submittedAt: string;
  completedAt?: string;
  customerName?: string;
  errorMessage?: string;
}

// ─── RECHARGE STORE & PERSISTENCE ────────────────────────────

const DATA_DIR = path.join(process.cwd(), "data");
const RECHARGE_FILE = path.join(DATA_DIR, "recharge-transactions.json");

function ensureRechargeStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(RECHARGE_FILE)) {
    fs.writeFileSync(RECHARGE_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

// ─── REAL INDIAN MARKET PLANS DATABASE ───────────────────────

const REAL_MOBILE_PLANS: RechargePlanItem[] = [
  // JIO PLANS
  {
    planId: "JIO-299",
    operator: "JIO",
    circle: "DELHI",
    category: "POPULAR",
    amount: 299,
    validity: "28 Days",
    validityDays: 28,
    dataAllowance: "1.5 GB/Day (Total 42 GB)",
    callingDetails: "Truly Unlimited Calls",
    smsAllowance: "100 SMS/Day",
    description: "Daily 1.5GB Data + Unlimited Voice + JioTV, JioCinema, JioCloud complimentary access.",
    benefits: ["5G Welcome Offer Eligible", "JioCinema Premium", "JioTV Live Streaming"],
  },
  {
    planId: "JIO-719",
    operator: "JIO",
    circle: "DELHI",
    category: "UNLIMITED",
    amount: 719,
    validity: "84 Days",
    validityDays: 84,
    dataAllowance: "1.5 GB/Day (Total 126 GB)",
    callingDetails: "Unlimited Any-Net Calling",
    smsAllowance: "100 SMS/Day",
    description: "Quarterly value pack with 1.5GB daily high speed data and unlimited calling nationwide.",
    benefits: ["Unlimited 5G Data", "Free National Roaming", "Complimentary Jio Apps"],
  },
  {
    planId: "JIO-349",
    operator: "JIO",
    circle: "DELHI",
    category: "UNLIMITED",
    amount: 349,
    validity: "28 Days",
    validityDays: 28,
    dataAllowance: "2 GB/Day (Total 56 GB)",
    callingDetails: "Truly Unlimited Calls",
    smsAllowance: "100 SMS/Day",
    description: "Heavy user plan with 2GB daily data and unlimited 5G network speeds.",
    benefits: ["Unlimited True 5G", "100 SMS Daily", "Jio Cloud Backup"],
  },
  {
    planId: "JIO-19",
    operator: "JIO",
    circle: "DELHI",
    category: "DATA",
    amount: 19,
    validity: "Active Base Plan",
    validityDays: 1,
    dataAllowance: "1.5 GB Total",
    description: "High speed 4G/5G data booster pack applicable over existing active base plan.",
    benefits: ["Instant High-Speed Data", "No Calling Allowance"],
  },
  {
    planId: "JIO-155",
    operator: "JIO",
    circle: "DELHI",
    category: "VALIDITY",
    amount: 155,
    validity: "28 Days",
    validityDays: 28,
    dataAllowance: "2 GB Total",
    callingDetails: "Unlimited Calls",
    smsAllowance: "300 SMS Total",
    description: "Budget calling plan with 28 days validity for voice callers.",
    benefits: ["28 Days Validity", "Unlimited Voice Calls", "300 SMS"],
  },

  // AIRTEL PLANS
  {
    planId: "AIR-299",
    operator: "AIRTEL",
    circle: "DELHI",
    category: "POPULAR",
    amount: 299,
    validity: "28 Days",
    validityDays: 28,
    dataAllowance: "1.5 GB/Day",
    callingDetails: "Unlimited Local/STD Calls",
    smsAllowance: "100 SMS/Day",
    description: "Best seller 1.5GB daily data + Unlimited Calling + Apollo 24|7 Circle & Free Hellotunes.",
    benefits: ["Unlimited 5G Data", "Apollo 24|7 Health Circle", "Wynk Music Free"],
  },
  {
    planId: "AIR-839",
    operator: "AIRTEL",
    circle: "DELHI",
    category: "UNLIMITED",
    amount: 839,
    validity: "84 Days",
    validityDays: 84,
    dataAllowance: "2 GB/Day (Total 168 GB)",
    callingDetails: "Truly Unlimited Calls",
    smsAllowance: "100 SMS/Day",
    description: "84 days power pack with 2GB daily data, Unlimited 5G, and Disney+ Hotstar Mobile 3 Months.",
    benefits: ["Disney+ Hotstar 3 Months", "Unlimited 5G Data", "RewardsMini Subscription"],
  },
  {
    planId: "AIR-65",
    operator: "AIRTEL",
    circle: "DELHI",
    category: "DATA",
    amount: 65,
    validity: "Existing Plan",
    validityDays: 28,
    dataAllowance: "4 GB High Speed Data",
    description: "Data add-on voucher valid till current base pack expiry.",
    benefits: ["4GB High Speed 4G/5G Data", "No Outgoing Calls"],
  },
  {
    planId: "AIR-155",
    operator: "AIRTEL",
    circle: "DELHI",
    category: "TALKTIME",
    amount: 155,
    validity: "24 Days",
    validityDays: 24,
    dataAllowance: "1 GB Total",
    callingDetails: "Unlimited Voice Calling",
    smsAllowance: "300 SMS",
    description: "Affordable voice calling pack with 24 days validity.",
    benefits: ["24 Days Service Validity", "Free Hellotunes"],
  },

  // VI (VODAFONE IDEA) PLANS
  {
    planId: "VI-299",
    operator: "VI",
    circle: "DELHI",
    category: "POPULAR",
    amount: 299,
    validity: "28 Days",
    validityDays: 28,
    dataAllowance: "1.5 GB/Day",
    callingDetails: "Truly Unlimited Calls",
    smsAllowance: "100 SMS/Day",
    description: "Hero Unlimited: Binge All Night (12AM-6AM unlimited data) + Weekend Data Rollover.",
    benefits: ["Binge All Night (12AM-6AM Free)", "Weekend Data Rollover", "Vi Movies & TV"],
  },
  {
    planId: "VI-479",
    operator: "VI",
    circle: "DELHI",
    category: "UNLIMITED",
    amount: 479,
    validity: "56 Days",
    validityDays: 56,
    dataAllowance: "1.5 GB/Day",
    callingDetails: "Unlimited Any-Net Voice",
    smsAllowance: "100 SMS/Day",
    description: "56 days pack with daily 1.5GB data, night unlimited surfing and calling.",
    benefits: ["Weekend Rollover", "Data Delight Up to 2GB backup", "Vi App perks"],
  },

  // BSNL PLANS
  {
    planId: "BSNL-197",
    operator: "BSNL",
    circle: "DELHI",
    category: "VALIDITY",
    amount: 197,
    validity: "70 Days",
    validityDays: 70,
    dataAllowance: "2 GB/Day (First 18 days)",
    callingDetails: "Unlimited Voice (First 18 days)",
    smsAllowance: "100 SMS/Day",
    description: "Long validity recharge with 70 days validity extension.",
    benefits: ["70 Days Validity Extension", "National Roaming including MTNL areas"],
  },
  {
    planId: "BSNL-397",
    operator: "BSNL",
    circle: "DELHI",
    category: "POPULAR",
    amount: 397,
    validity: "150 Days",
    validityDays: 150,
    dataAllowance: "2 GB/Day (First 30 days)",
    callingDetails: "Unlimited Voice (First 30 days)",
    description: "Popular long-term plan with 150 days service validity.",
    benefits: ["150 Days Validity", "Free Roaming nationwide"],
  },
];

const REAL_DTH_PLANS: RechargePlanItem[] = [
  // TATA PLAY
  {
    planId: "TP-DHAMAAL-249",
    operator: "TATA_PLAY",
    circle: "ALL_INDIA",
    category: "POPULAR",
    amount: 249,
    validity: "1 Month (30 Days)",
    validityDays: 30,
    description: "Hindi Dhamaal Mix Pack: 85 SD Channels including Star Plus, Zee Cinema, Sony, Aaj Tak.",
    benefits: ["85 Entertainment Channels", "Tata Play Binge Mobile Free", "Free Interactive Services"],
  },
  {
    planId: "TP-FAMILY-HD-399",
    operator: "TATA_PLAY",
    circle: "ALL_INDIA",
    category: "MONTHLY",
    amount: 399,
    validity: "1 Month (30 Days)",
    validityDays: 30,
    description: "Family Delight HD: 120 SD + 32 High Definition Channels with Dolby 5.1 sound.",
    benefits: ["32 HD Channels", "Full Sports & Movies Pack", "Tata Play Mobile App Access"],
  },
  {
    planId: "TP-ANNUAL-2799",
    operator: "TATA_PLAY",
    circle: "ALL_INDIA",
    category: "LONG_TERM",
    amount: 2799,
    validity: "12 Months (365 Days)",
    validityDays: 365,
    description: "Annual Savings Pack: 12 Months Recharge with 1 Month Cashback credited to wallet.",
    benefits: ["365 Days Uninterrupted Viewing", "1 Month Free Cash Benefit", "Priority Service Support"],
  },

  // AIRTEL DTH
  {
    planId: "AIRDTH-VALUE-280",
    operator: "AIRTEL_DTH",
    circle: "ALL_INDIA",
    category: "POPULAR",
    amount: 280,
    validity: "30 Days",
    validityDays: 30,
    description: "Airtel Value Prime Pack: 92 Channels (GEC, Movies, Infotainment, News).",
    benefits: ["92 Entertainment Channels", "Xstream App Companion Access", "No Ads in Guide"],
  },
  {
    planId: "AIRDTH-HD-420",
    operator: "AIRTEL_DTH",
    circle: "ALL_INDIA",
    category: "MONTHLY",
    amount: 420,
    validity: "30 Days",
    validityDays: 30,
    description: "Mega HD Pack: 135 Channels including Star Sports 1 HD, Sony Ten HD, HBO HD.",
    benefits: ["40 Crystal Clear HD Channels", "Dolby Surround Audio", "Airtel Thanks Rewards"],
  },

  // DISH TV
  {
    planId: "DISH-SWAGAT-215",
    operator: "DISH_TV",
    circle: "ALL_INDIA",
    category: "POPULAR",
    amount: 215,
    validity: "30 Days",
    validityDays: 30,
    description: "Classic Hindi Swagat: 75 Channels covering national entertainment and news.",
    benefits: ["Affordable Monthly Pack", "Dish SMRT Hub Compatible"],
  },
  {
    planId: "DISH-ROYAL-365",
    operator: "DISH_TV",
    circle: "ALL_INDIA",
    category: "MONTHLY",
    amount: 365,
    validity: "30 Days",
    validityDays: 30,
    description: "Royal HD Combo: 110 Channels + 25 HD Channels with live sports.",
    benefits: ["25 HD Channels", "Cricket Live Included"],
  },
];

// Helper to mask phone number (e.g. 9876543210 -> 98****3210)
export function maskMobile(mobile: string): string {
  if (!mobile || mobile.length < 8) return mobile;
  const start = mobile.substring(0, 2);
  const end = mobile.substring(mobile.length - 4);
  return `${start}****${end}`;
}

export class Way2ApiService {
  private static instance: Way2ApiService;

  private constructor() {
    ensureRechargeStore();
  }

  public static getInstance(): Way2ApiService {
    if (!Way2ApiService.instance) {
      Way2ApiService.instance = new Way2ApiService();
    }
    return Way2ApiService.instance;
  }

  // ─── 1. MOBILE NUMBER & OPERATOR LOOKUP ─────────────────────

  public async lookupMobile(mobile: string): Promise<MobileLookupResult> {
    const cleanMobile = mobile.trim().replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      throw new Error("Invalid 10-digit Indian mobile number. Must start with 6, 7, 8, or 9.");
    }

    // Determine operator from series / MNP lookup
    let operator = "JIO";
    let operatorName = "Reliance Jio";
    let circle = "DELHI";
    let circleName = "Delhi & NCR";
    let isPorted = false;
    let portedFrom: string | undefined = undefined;

    const prefix = cleanMobile.substring(0, 3);
    const firstDigit = cleanMobile[0];

    if (prefix.startsWith("981") || prefix.startsWith("982") || prefix.startsWith("987")) {
      operator = "AIRTEL";
      operatorName = "Bharti Airtel";
      circle = "DELHI";
      circleName = "Delhi & NCR";
    } else if (prefix.startsWith("989") || prefix.startsWith("992") || prefix.startsWith("983")) {
      operator = "VI";
      operatorName = "Vodafone Idea";
      circle = "MUMBAI";
      circleName = "Mumbai & Maharashtra";
    } else if (prefix.startsWith("94") || prefix.startsWith("95")) {
      operator = "BSNL";
      operatorName = "BSNL Mobile";
      circle = "UP_EAST";
      circleName = "Uttar Pradesh (East)";
    } else {
      operator = "JIO";
      operatorName = "Reliance Jio";
      circle = "DELHI";
      circleName = "Delhi & NCR";
    }

    // Detect MNP if test flag or ported sequence
    if (cleanMobile.endsWith("99") || cleanMobile.endsWith("00")) {
      isPorted = true;
      portedFrom = operator === "JIO" ? "AIRTEL" : "JIO";
    }

    const providerRef = `W2A-HLR-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      mobile: cleanMobile,
      operator,
      operatorName,
      circle,
      circleName,
      connectionType: "PREPAID",
      isPorted,
      portedFrom,
      providerReference: providerRef,
      verifiedAt: new Date().toISOString(),
    };
  }

  // ─── 2. DTH OPERATOR DETECTION & CUSTOMER DETAILS ────────────

  public async lookupDth(subscriberId: string, operatorHint?: string): Promise<{ operator: string; operatorName: string }> {
    const cleanId = subscriberId.trim().replace(/\D/g, "");
    if (cleanId.length < 5) {
      throw new Error("DTH Subscriber ID must be at least 5 digits.");
    }

    let detectedOp = operatorHint || "TATA_PLAY";
    let opName = "Tata Play";

    if (cleanId.startsWith("1") || cleanId.length === 10) {
      detectedOp = "TATA_PLAY";
      opName = "Tata Play";
    } else if (cleanId.startsWith("3") || cleanId.startsWith("4")) {
      detectedOp = "AIRTEL_DTH";
      opName = "Airtel Digital TV";
    } else if (cleanId.startsWith("025") || cleanId.startsWith("01")) {
      detectedOp = "DISH_TV";
      opName = "Dish TV India";
    } else if (cleanId.startsWith("7") || cleanId.startsWith("8")) {
      detectedOp = "SUN_DIRECT";
      opName = "Sun Direct";
    } else {
      detectedOp = "D2H";
      opName = "Videocon d2h";
    }

    return { operator: detectedOp, operatorName: opName };
  }

  public async getDthCustomerDetails(subscriberId: string, operator: string): Promise<DthCustomerDetailsResult> {
    const cleanId = subscriberId.trim();
    if (cleanId.length < 5) {
      throw new Error("Subscriber ID must be at least 5 digits.");
    }

    const mockNames: Record<string, string> = {
      TATA_PLAY: "Rajesh Kumar Sharma",
      AIRTEL_DTH: "Priya V. Sundaram",
      DISH_TV: "Amitabh Banerjee",
      SUN_DIRECT: "Karthik Subramanian",
      D2H: "Deepak Narayan Patel",
    };

    const customerName = mockNames[operator.toUpperCase()] || "Verified Subscriber";
    const maskedMobile = maskMobile(`98${cleanId.slice(-8).padStart(8, "1")}`);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    return {
      subscriberId: cleanId,
      operator: operator.toUpperCase(),
      operatorName: operator.replace("_", " "),
      customerName,
      registeredMobileMasked: maskedMobile,
      balance: 142.50,
      monthlyPlanAmount: 249.00,
      currentPlanName: `${operator.replace("_", " ")} Standard Family Pack`,
      accountStatus: "ACTIVE",
      nextRechargeDate: dueDate.toISOString().split("T")[0],
      providerReference: `W2A-DTH-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      verifiedAt: new Date().toISOString(),
    };
  }

  // ─── 3. VIEW PLANS (MOBILE & DTH) ───────────────────────────

  public async getMobilePlans(operator: string, circle: string = "DELHI"): Promise<{ operator: string; circle: string; plans: RechargePlanItem[] }> {
    const opUpper = operator.toUpperCase();
    const plans = REAL_MOBILE_PLANS.filter((p) => p.operator === opUpper);

    // If operator has specific plans, return them; otherwise provide universal catalog mapped to operator
    const finalPlans = plans.length > 0 ? plans : REAL_MOBILE_PLANS.map((p) => ({ ...p, operator: opUpper }));

    return {
      operator: opUpper,
      circle: circle.toUpperCase(),
      plans: finalPlans,
    };
  }

  public async getDthPlans(operator: string): Promise<{ operator: string; plans: RechargePlanItem[] }> {
    const opUpper = operator.toUpperCase();
    const plans = REAL_DTH_PLANS.filter((p) => p.operator === opUpper);
    const finalPlans = plans.length > 0 ? plans : REAL_DTH_PLANS.map((p) => ({ ...p, operator: opUpper }));

    return {
      operator: opUpper,
      plans: finalPlans,
    };
  }

  // ─── 4. RECHARGE SUBMIT (WITH IDEMPOTENCY) ───────────────────

  public async submitRecharge(params: {
    serviceType: "MOBILE" | "DTH";
    identifier: string;
    operator: string;
    operatorName?: string;
    circle?: string;
    amount: number;
    planDescription: string;
    idempotencyKey?: string;
    customerName?: string;
  }): Promise<RechargeTransactionResult> {
    ensureRechargeStore();

    if (params.amount <= 0) {
      throw new Error("Recharge amount must be greater than zero.");
    }

    const idempotencyKey = params.idempotencyKey || `IDEM-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Check for existing transaction with same idempotency key (prevent double recharge)
    const existing = this.getRechargeHistory(100);
    const duplicate = existing.find((t) => t.idempotencyKey === idempotencyKey);
    if (duplicate) {
      return duplicate;
    }

    const txId = `REC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const opRef = `OPR-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const providerRef = `W2A-SWITCH-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newTx: RechargeTransactionResult = {
      transactionId: txId,
      idempotencyKey,
      serviceType: params.serviceType,
      identifier: params.identifier,
      operator: params.operator,
      operatorName: params.operatorName || params.operator.replace("_", " "),
      circle: params.circle,
      amount: params.amount,
      planDescription: params.planDescription,
      status: "SUCCESS", // Simulated instant provider switch confirmation
      operatorReference: opRef,
      providerReference: providerRef,
      submittedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      customerName: params.customerName,
    };

    // Save to persistent file store
    try {
      const updated = [newTx, ...existing];
      fs.writeFileSync(RECHARGE_FILE, JSON.stringify(updated, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to persist recharge transaction:", e);
    }

    return newTx;
  }

  // ─── 5. STATUS CHECK & TRANSACTION HISTORY ───────────────────

  public async getTransactionStatus(transactionId: string): Promise<RechargeTransactionResult> {
    ensureRechargeStore();
    const history = this.getRechargeHistory(200);
    const found = history.find((t) => t.transactionId === transactionId);

    if (!found) {
      throw new Error(`Transaction ID ${transactionId} not found.`);
    }

    return found;
  }

  public getRechargeHistory(limit: number = 50): RechargeTransactionResult[] {
    ensureRechargeStore();
    try {
      const content = fs.readFileSync(RECHARGE_FILE, "utf-8");
      const list: RechargeTransactionResult[] = JSON.parse(content);
      return list.slice(0, limit);
    } catch (e) {
      console.error("Error reading recharge history:", e);
      return [];
    }
  }
}

export const way2ApiService = Way2ApiService.getInstance();
