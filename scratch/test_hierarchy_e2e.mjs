// Automated E2E Verification Suite for PayMatrix 6-Tier Hierarchy Platform
import http from "node:http";

const BASE_URL = "http://localhost:3000";

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = options.headers || {};
  if (options.body && typeof options.body === "object") {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body,
  });

  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  // Extract cookies
  const cookieHeader = res.headers.get("set-cookie");

  return {
    status: res.status,
    headers: res.headers,
    cookie: cookieHeader,
    data,
  };
}

async function runTests() {
  console.log("===============================================================");
  console.log("PAYMATRIX 6-TIER HIERARCHY & RECHARGE SYSTEM VERIFICATION SUITE");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = "") {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      if (details) console.error(`   Details:`, details);
      failed++;
    }
  }

  const sessions = {};

  // 1. TEST AUTHENTICATION FOR ALL 6 HIERARCHY TIERS
  console.log("--- 1. Testing Authentication across all 6 Hierarchy Tiers ---");
  const accounts = [
    { label: "Super Admin", email: "admin@paymatrix.in", pass: "Admin@123456", expectedRole: "SUPER_ADMIN" },
    { label: "Admin", email: "admin1@paymatrix.in", pass: "Demo@12345", expectedRole: "ADMIN" },
    { label: "Super Distributor", email: "superdist1@paymatrix.in", pass: "Demo@12345", expectedRole: "SUPER_DISTRIBUTOR" },
    { label: "Master Distributor", email: "masterdist1@paymatrix.in", pass: "Demo@12345", expectedRole: "MASTER_DISTRIBUTOR" },
    { label: "Distributor", email: "amit.kumar@example.com", pass: "Demo@12345", expectedRole: "DISTRIBUTOR" },
    { label: "Retailer", email: "retailer1@example.com", pass: "Demo@12345", expectedRole: "RETAILER" },
  ];

  for (const acc of accounts) {
    const res = await request("/api/auth/login", {
      method: "POST",
      body: { identifier: acc.email, password: acc.pass },
    });

    const success = res.status === 200 && res.data?.user?.role === acc.expectedRole;
    assert(success, `Login as ${acc.label} (${acc.expectedRole})`, JSON.stringify(res.data));

    if (success && res.cookie) {
      const match = res.cookie.match(/paymatrix_session=([^;]+)/);
      if (match) {
        sessions[acc.expectedRole] = {
          token: match[1],
          cookie: `paymatrix_session=${match[1]}`,
          user: res.data.user,
        };
      }
    }
  }

  // 2. CRITICAL ARCHITECTURAL RESTRICTION: SUPER ADMIN & ADMIN MUST BE 403 FORBIDDEN FROM RECHARGE & BBPS
  console.log("\n--- 2. Testing Critical Server-Side Transaction Blocking (HTTP 403) ---");
  const adminTiers = ["SUPER_ADMIN", "ADMIN"];

  for (const role of adminTiers) {
    const sess = sessions[role];
    if (!sess) continue;

    // A. Mobile Recharge
    const resMobile = await request("/api/recharge/mobile", {
      method: "POST",
      headers: {
        Cookie: sess.cookie,
        "x-user-id": sess.user.id,
        "x-user-role": sess.user.role,
      },
      body: {
        mobile: "9876543210",
        operator: "JIO",
        amount: 199,
      },
    });
    assert(
      resMobile.status === 403,
      `Blocked ${role} from Mobile Recharge (HTTP 403)`,
      `Expected 403, got ${resMobile.status}: ${JSON.stringify(resMobile.data)}`
    );

    // B. DTH Recharge
    const resDth = await request("/api/recharge/dth", {
      method: "POST",
      headers: {
        Cookie: sess.cookie,
        "x-user-id": sess.user.id,
        "x-user-role": sess.user.role,
      },
      body: {
        customerId: "1002938475",
        operator: "TATA_PLAY",
        amount: 250,
      },
    });
    assert(
      resDth.status === 403,
      `Blocked ${role} from DTH Recharge (HTTP 403)`,
      `Expected 403, got ${resDth.status}: ${JSON.stringify(resDth.data)}`
    );

    // C. BBPS Bill Pay
    const resBbps = await request("/api/bbps/pay", {
      method: "POST",
      headers: {
        Cookie: sess.cookie,
        "x-user-id": sess.user.id,
        "x-user-role": sess.user.role,
      },
      body: {
        category: "ELECTRICITY",
        billerId: "MSEDCL001",
        consumerNumber: "02891823910",
        amount: 850,
      },
    });
    assert(
      resBbps.status === 403,
      `Blocked ${role} from BBPS Bill Payment (HTTP 403)`,
      `Expected 403, got ${resBbps.status}: ${JSON.stringify(resBbps.data)}`
    );
  }

  // 3. OPERATIONAL TIERS MUST SUCCEED WITH RECHARGE & BILL PAYMENTS
  console.log("\n--- 3. Testing Operational Tier Customer Transactions (HTTP 200) ---");
  const operationalTiers = [
    { role: "RETAILER", service: "Mobile", path: "/api/recharge/mobile", body: { mobile: "9876543210", operator: "JIO", amount: 149 } },
    { role: "DISTRIBUTOR", service: "Mobile", path: "/api/recharge/mobile", body: { mobile: "9812345678", operator: "AIRTEL", amount: 199 } },
    { role: "MASTER_DISTRIBUTOR", service: "DTH", path: "/api/recharge/dth", body: { customerId: "1098234710", operator: "TATA_PLAY", amount: 299 } },
    { role: "SUPER_DISTRIBUTOR", service: "BBPS", path: "/api/bbps/pay", body: { category: "ELECTRICITY", billerId: "MSEDCL001", consumerNumber: "02891823910", amount: 450 } },
  ];

  for (const op of operationalTiers) {
    const sess = sessions[op.role];
    if (!sess) continue;

    const res = await request(op.path, {
      method: "POST",
      headers: {
        Cookie: sess.cookie,
        "x-user-id": sess.user.id,
        "x-user-role": sess.user.role,
      },
      body: op.body,
    });

    assert(
      res.status === 200 && (res.data?.success === true || res.data?.transaction?.status === "SUCCESS"),
      `Allowed ${op.role} to execute ${op.service} transaction (HTTP 200)`,
      `Status: ${res.status}, response: ${JSON.stringify(res.data)}`
    );
  }

  // 4. USER ONBOARDING HIERARCHY MATRIX
  console.log("\n--- 4. Testing User Hierarchy Creation Constraints ---");

  // Retailer CANNOT create any user (HTTP 403)
  const retSess = sessions["RETAILER"];
  if (retSess) {
    const res = await request("/api/users", {
      method: "POST",
      headers: {
        Cookie: retSess.cookie,
        "x-user-id": retSess.user.id,
        "x-user-role": retSess.user.role,
      },
      body: {
        role: "RETAILER",
        username: "illegal_ret_sub",
        email: "illegal@retailer.com",
        mobile: "9811001100",
        fullName: "Illegal Retailer Sub",
        password: "Password@123",
      },
    });
    assert(
      res.status === 403,
      "Retailer is blocked from creating any user account (HTTP 403)",
      `Expected 403, got ${res.status}`
    );
  }

  // Distributor CAN create Retailer (HTTP 201)
  const distSess = sessions["DISTRIBUTOR"];
  if (distSess) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const res = await request("/api/users", {
      method: "POST",
      headers: {
        Cookie: distSess.cookie,
        "x-user-id": distSess.user.id,
        "x-user-role": distSess.user.role,
      },
      body: {
        role: "RETAILER",
        username: `new_retailer_${randomSuffix}`,
        email: `new_retailer_${randomSuffix}@example.com`,
        mobile: `987654${randomSuffix}`,
        fullName: `New Retailer ${randomSuffix}`,
        password: "Password@123",
        businessName: `Outlet ${randomSuffix}`,
      },
    });

    assert(
      res.status === 201 && res.data?.user?.parentId === distSess.user.id,
      "Distributor successfully onboards Retailer with automatic parentId link (HTTP 201)",
      `Status: ${res.status}, user: ${JSON.stringify(res.data?.user)}`
    );
  }

  // Super Distributor CAN create Master Distributor (HTTP 201)
  const sdSess = sessions["SUPER_DISTRIBUTOR"];
  if (sdSess) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const res = await request("/api/users", {
      method: "POST",
      headers: {
        Cookie: sdSess.cookie,
        "x-user-id": sdSess.user.id,
        "x-user-role": sdSess.user.role,
      },
      body: {
        role: "MASTER_DISTRIBUTOR",
        username: `new_md_${randomSuffix}`,
        email: `new_md_${randomSuffix}@example.com`,
        mobile: `982233${randomSuffix}`,
        fullName: `New Master Dist ${randomSuffix}`,
        password: "Password@123",
        businessName: `Master Agency ${randomSuffix}`,
      },
    });

    assert(
      res.status === 201 &&
      res.data?.user?.parentId === sdSess.user.id &&
      res.data?.user?.distributorId?.startsWith("DST-MD-"),
      "Super Distributor onboards Master Distributor with DST-MD-* ID (HTTP 201)",
      `Status: ${res.status}, user: ${JSON.stringify(res.data?.user)}`
    );
  }

  // 5. HIERARCHY SCOPED DIRECTORY ACCESS (GET /api/users)
  console.log("\n--- 5. Testing Hierarchy Data Isolation (GET /api/users) ---");
  const saSess = sessions["SUPER_ADMIN"];
  if (saSess) {
    const res = await request("/api/users", {
      method: "GET",
      headers: {
        Cookie: saSess.cookie,
        "x-user-id": saSess.user.id,
        "x-user-role": saSess.user.role,
      },
    });
    assert(
      res.status === 200 && Array.isArray(res.data?.users) && res.data.users.length >= 6,
      "Super Admin views complete multi-tier directory",
      `Total users: ${res.data?.users?.length}`
    );
  }

  if (distSess) {
    const res = await request("/api/users", {
      method: "GET",
      headers: {
        Cookie: distSess.cookie,
        "x-user-id": distSess.user.id,
        "x-user-role": distSess.user.role,
      },
    });
    // Distributor should only see downline users
    const hasHigherTiers = res.data?.users?.some(u => ["SUPER_ADMIN", "ADMIN", "SUPER_DISTRIBUTOR", "MASTER_DISTRIBUTOR"].includes(u.role));
    assert(
      res.status === 200 && !hasHigherTiers,
      "Distributor directory is strictly isolated from parent and peer branches",
      `Higher tiers visible: ${hasHigherTiers}`
    );
  }

  console.log("\n===============================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("===============================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Give dev server 2 seconds to be warm, then execute
setTimeout(runTests, 2000);
