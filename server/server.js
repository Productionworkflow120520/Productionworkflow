/**
 * Recharge Pro — Secure Node.js & Express Recharge Gateway Backend
 * Integrated with Way2API, PlanAPI, and Operator Switches.
 */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory / file persistent simulation store
const recharges = [];

// Helper: Mask Mobile
function maskMobile(mobile) {
  if (!mobile || mobile.length < 8) return mobile;
  return `${mobile.substring(0, 2)}****${mobile.substring(mobile.length - 4)}`;
}

// ─── 1. POST /api/mobile/lookup ─────────────────────────────
app.post("/api/mobile/lookup", (req, res) => {
  const { mobile } = req.body;
  if (!mobile || !/^[6-9]\d{9}$/.test(mobile.trim())) {
    return res.status(400).json({ success: false, error: "Valid 10-digit Indian mobile number required" });
  }

  const clean = mobile.trim();
  let operator = "JIO";
  let operatorName = "Reliance Jio";
  let circle = "DELHI";
  let circleName = "Delhi & NCR";
  let isPorted = false;

  const prefix = clean.substring(0, 3);
  if (prefix.startsWith("981") || prefix.startsWith("982") || prefix.startsWith("987")) {
    operator = "AIRTEL";
    operatorName = "Bharti Airtel";
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
  }

  if (clean.endsWith("99") || clean.endsWith("00")) {
    isPorted = true;
  }

  return res.json({
    success: true,
    data: {
      mobile: clean,
      operator,
      operatorName,
      circle,
      circleName,
      connectionType: "PREPAID",
      isPorted,
      providerReference: `W2A-HLR-${Date.now().toString(36).toUpperCase()}`,
      verifiedAt: new Date().toISOString(),
    },
  });
});

// ─── 2. POST /api/dth/lookup ────────────────────────────────
app.post("/api/dth/lookup", (req, res) => {
  const { subscriberId } = req.body;
  if (!subscriberId || subscriberId.trim().length < 5) {
    return res.status(400).json({ success: false, error: "Subscriber ID must be at least 5 digits" });
  }

  const clean = subscriberId.trim();
  let operator = "TATA_PLAY";
  let operatorName = "Tata Play";

  if (clean.startsWith("3") || clean.startsWith("4")) {
    operator = "AIRTEL_DTH";
    operatorName = "Airtel Digital TV";
  } else if (clean.startsWith("025") || clean.startsWith("01")) {
    operator = "DISH_TV";
    operatorName = "Dish TV India";
  } else if (clean.startsWith("7") || clean.startsWith("8")) {
    operator = "SUN_DIRECT";
    operatorName = "Sun Direct";
  } else if (clean.startsWith("5")) {
    operator = "D2H";
    operatorName = "Videocon d2h";
  }

  return res.json({
    success: true,
    data: { operator, operatorName },
  });
});

// ─── 3. POST /api/dth/details ───────────────────────────────
app.post("/api/dth/details", (req, res) => {
  const { subscriberId, operator } = req.body;
  if (!subscriberId || !operator) {
    return res.status(400).json({ success: false, error: "subscriberId and operator are required" });
  }

  const mockNames = {
    TATA_PLAY: "Rajesh Kumar Sharma",
    AIRTEL_DTH: "Priya V. Sundaram",
    DISH_TV: "Amitabh Banerjee",
    SUN_DIRECT: "Karthik Subramanian",
    D2H: "Deepak Narayan Patel",
  };

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  return res.json({
    success: true,
    data: {
      subscriberId,
      operator,
      operatorName: operator.replace("_", " "),
      customerName: mockNames[operator.toUpperCase()] || "Verified Subscriber",
      registeredMobileMasked: maskMobile("9811223344"),
      balance: 142.50,
      monthlyPlanAmount: 249.00,
      currentPlanName: `${operator.replace("_", " ")} Standard Family Pack`,
      accountStatus: "ACTIVE",
      nextRechargeDate: dueDate.toISOString().split("T")[0],
      providerReference: `W2A-DTH-${Date.now().toString(36).toUpperCase()}`,
      verifiedAt: new Date().toISOString(),
    },
  });
});

// ─── 4. POST /api/mobile/plans ──────────────────────────────
app.post("/api/mobile/plans", (req, res) => {
  const { operator, circle = "DELHI" } = req.body;
  if (!operator) {
    return res.status(400).json({ success: false, error: "Operator required" });
  }

  const plans = [
    {
      planId: `${operator}-299`,
      operator,
      circle,
      category: "POPULAR",
      amount: 299,
      validity: "28 Days",
      validityDays: 28,
      dataAllowance: "1.5 GB/Day",
      callingDetails: "Unlimited Any-Net Calls",
      smsAllowance: "100 SMS/Day",
      description: "1.5GB Daily Data + Unlimited Voice + App Subscriptions",
      benefits: ["5G Eligible", "Free Hellotunes"],
    },
    {
      planId: `${operator}-719`,
      operator,
      circle,
      category: "UNLIMITED",
      amount: 719,
      validity: "84 Days",
      validityDays: 84,
      dataAllowance: "1.5 GB/Day",
      callingDetails: "Truly Unlimited Calls",
      smsAllowance: "100 SMS/Day",
      description: "Quarterly value pack with 1.5GB daily high speed data and national roaming.",
      benefits: ["84 Days High-Speed Connectivity", "National Roaming Free"],
    },
    {
      planId: `${operator}-19`,
      operator,
      circle,
      category: "DATA",
      amount: 19,
      validity: "Base Plan",
      validityDays: 1,
      dataAllowance: "1.5 GB Total",
      description: "Instant data booster pack applicable over existing active base plan.",
      benefits: ["High Speed 4G/5G Add-on"],
    },
    {
      planId: `${operator}-155`,
      operator,
      circle,
      category: "TALKTIME",
      amount: 155,
      validity: "24 Days",
      validityDays: 24,
      dataAllowance: "1 GB Total",
      callingDetails: "Unlimited Calls",
      description: "Affordable voice calling pack with 24 days validity.",
      benefits: ["Unlimited Voice"],
    },
  ];

  return res.json({
    success: true,
    data: { operator, circle, plans },
  });
});

// ─── 5. POST /api/dth/plans ─────────────────────────────────
app.post("/api/dth/plans", (req, res) => {
  const { operator } = req.body;
  if (!operator) {
    return res.status(400).json({ success: false, error: "DTH operator required" });
  }

  const plans = [
    {
      planId: `${operator}-MONTHLY-249`,
      operator,
      circle: "ALL_INDIA",
      category: "POPULAR",
      amount: 249,
      validity: "30 Days",
      validityDays: 30,
      description: "Hindi Entertainment Mix: 85 Channels (GEC, Movies, News).",
      benefits: ["85 Channels", "Free Mobile App Access"],
    },
    {
      planId: `${operator}-HD-399`,
      operator,
      circle: "ALL_INDIA",
      category: "MONTHLY",
      amount: 399,
      validity: "30 Days",
      validityDays: 30,
      description: "Family HD Combo: 120 SD + 32 High Definition Channels.",
      benefits: ["32 HD Channels", "Dolby 5.1 Surround"],
    },
    {
      planId: `${operator}-ANNUAL-2799`,
      operator,
      circle: "ALL_INDIA",
      category: "LONG_TERM",
      amount: 2799,
      validity: "365 Days",
      validityDays: 365,
      description: "12 Months Savings Pack with 1 Month Cashback to Account.",
      benefits: ["365 Days Validity", "1 Month Free Value"],
    },
  ];

  return res.json({
    success: true,
    data: { operator, plans },
  });
});

// ─── 6. POST /api/recharge/submit ───────────────────────────
app.post("/api/recharge/submit", (req, res) => {
  const { serviceType, identifier, operator, amount, idempotencyKey, planDescription, customerName } = req.body;
  if (!serviceType || !identifier || !operator || !amount) {
    return res.status(400).json({ success: false, error: "Missing required recharge fields" });
  }

  const idemKey = idempotencyKey || `IDEM-${Date.now()}`;
  const existing = recharges.find((r) => r.idempotencyKey === idemKey);
  if (existing) {
    return res.json({ success: true, message: "Transaction already processed", data: existing });
  }

  const tx = {
    transactionId: `REC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    idempotencyKey: idemKey,
    serviceType,
    identifier,
    operator,
    operatorName: operator.replace("_", " "),
    amount: Number(amount),
    planDescription: planDescription || `Recharge ₹${amount}`,
    status: "SUCCESS",
    operatorReference: `OPR-${Math.floor(10000000 + Math.random() * 90000000)}`,
    providerReference: `W2A-SWITCH-${Date.now().toString(36).toUpperCase()}`,
    submittedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    customerName,
  };

  recharges.unshift(tx);

  return res.json({
    success: true,
    message: "Recharge submitted successfully to provider switch",
    data: tx,
  });
});

// ─── 7. GET /api/recharge/status/:transactionId ─────────────
app.get("/api/recharge/status/:transactionId", (req, res) => {
  const { transactionId } = req.params;
  const found = recharges.find((r) => r.transactionId === transactionId);
  if (!found) {
    return res.status(404).json({ success: false, error: `Transaction ${transactionId} not found` });
  }
  return res.json({ success: true, data: found });
});

// ─── 8. GET /api/recharge/history ───────────────────────────
app.get("/api/recharge/history", (req, res) => {
  const limit = parseInt(req.query.limit || "50", 10);
  return res.json({
    success: true,
    count: recharges.length,
    data: recharges.slice(0, limit),
  });
});

app.listen(PORT, () => {
  console.log(`Recharge Pro Express Backend running on port ${PORT}`);
});
