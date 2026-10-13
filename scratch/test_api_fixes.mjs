// Test suite verifying all newly resolved routes and error handlers
import assert from "node:assert";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function login(identifier, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await res.json();
  const setCookie = res.headers.get("set-cookie") || "";
  let cookie = "";
  const match = setCookie.match(/(?:rechargepro_session|paymatrix_session)=([^;]+)/);
  if (match) {
    cookie = `rechargepro_session=${match[1]}; paymatrix_session=${match[1]}`;
  }
  return { status: res.status, data, cookie, token: data.token };
}

async function runTests() {
  console.log("=== Testing Recharge Pro System API Routes & Fixes ===");
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // Log in as Super Admin and Retailer
  const superAdminAuth = await login("admin@paymatrix.in", "Admin@123456");
  const retailerAuth = await login("retailer1@example.com", "Demo@12345");

  assert.strictEqual(superAdminAuth.status, 200, "Super admin login failed");
  assert.strictEqual(retailerAuth.status, 200, "Retailer login failed");

  const saHeaders = {
    Cookie: superAdminAuth.cookie,
    Authorization: `Bearer ${superAdminAuth.token}`,
  };

  const retHeaders = {
    Cookie: retailerAuth.cookie,
    Authorization: `Bearer ${retailerAuth.token}`,
  };

  // 1. Reports API - Super Admin
  await test("GET /api/reports?type=SUPER_ADMIN_OVERVIEW returns complete stats", async () => {
    const res = await fetch(`${BASE_URL}/api/reports?type=SUPER_ADMIN_OVERVIEW`, {
      headers: saHeaders,
    });
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert.ok(data.stats, "Expected stats in response");
    assert.ok(data.stats.totalAdmins !== undefined, "Expected totalAdmins");
    assert.ok(data.stats.totalSuperDistributors !== undefined, "Expected totalSuperDistributors");
    assert.ok(Array.isArray(data.recentTransactions), "Expected recentTransactions array");
  });

  // 2. Reports API - Super Distributor
  await test("GET /api/reports?type=SUPER_DISTRIBUTOR_OVERVIEW returns 200 and downline stats", async () => {
    const res = await fetch(`${BASE_URL}/api/reports?type=SUPER_DISTRIBUTOR_OVERVIEW`, {
      headers: saHeaders,
    });
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert.ok(data.stats, "Expected stats");
    assert.ok(data.stats.walletBalance !== undefined, "Expected walletBalance");
  });

  // 3. Reports API - Master Distributor
  await test("GET /api/reports?type=MASTER_DISTRIBUTOR_OVERVIEW returns 200 and downline stats", async () => {
    const res = await fetch(`${BASE_URL}/api/reports?type=MASTER_DISTRIBUTOR_OVERVIEW`, {
      headers: saHeaders,
    });
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert.ok(data.stats, "Expected stats");
    assert.ok(data.stats.totalDistributors !== undefined, "Expected totalDistributors");
  });

  // 4. Recharge API - Retailer endpoint
  await test("POST /api/recharge processes mobile recharge successfully", async () => {
    const res = await fetch(`${BASE_URL}/api/recharge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...retHeaders,
      },
      body: JSON.stringify({
        mobileNumber: "9820110001",
        operator: "JIO",
        circle: "Maharashtra & Goa",
        amount: 299,
      }),
    });
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert.strictEqual(data.success, true, "Expected success true");
    assert.ok(data.txnId, "Expected txnId");
    assert.strictEqual(data.status, "SUCCESS", "Expected status SUCCESS");
  });

  // 5. User Status Toggle - /api/users/:id/status
  await test("PATCH /api/users/:id/status toggles account status successfully", async () => {
    const res = await fetch(`${BASE_URL}/api/users/demo-user-dist-1/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...saHeaders,
      },
      body: JSON.stringify({ status: "SUSPENDED" }),
    });
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.status, "SUSPENDED");

    // Revert back to ACTIVE
    const revert = await fetch(`${BASE_URL}/api/users/demo-user-dist-1/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...saHeaders,
      },
      body: JSON.stringify({ status: "ACTIVE" }),
    });
    assert.strictEqual(revert.status, 200);
    const revertData = await revert.json();
    assert.strictEqual(revertData.user.status, "ACTIVE");
  });

  // 6. KYC Status Update - /api/kyc/:id/status
  await test("PATCH /api/kyc/:id/status updates KYC review successfully", async () => {
    const res = await fetch(`${BASE_URL}/api/kyc/demo-user-ret-1/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...saHeaders,
      },
      body: JSON.stringify({ status: "APPROVED" }),
    });
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.kycStatus, "APPROVED");
  });

  // 7. Wallet Request processing - /api/wallet-requests/:id (wr-1)
  await test("PATCH /api/wallet-requests/wr-1 approves request without 500 error", async () => {
    const res = await fetch(`${BASE_URL}/api/wallet-requests/wr-1`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...saHeaders,
      },
      body: JSON.stringify({ status: "APPROVED" }),
    });
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.request.status, "APPROVED");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
