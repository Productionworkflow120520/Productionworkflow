import assert from "node:assert";

const BASE_URL = "http://localhost:3000";

async function login(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: email, password }),
  });
  const cookie = res.headers.get("set-cookie") || "";
  const data = await res.json();
  return { status: res.status, data, cookie: cookie.split(";")[0] };
}

async function runTests() {
  console.log("===============================================================");
  console.log("RECHARGE PRO DYNAMIC BRANDING & AUDIT SYSTEM VERIFICATION SUITE");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  // Test 1: Public GET /api/branding
  try {
    console.log("--- 1. Testing Public GET /api/branding ---");
    const res = await fetch(`${BASE_URL}/api/branding`);
    assert.strictEqual(res.status, 200, "GET /api/branding should return 200");
    const json = await res.json();
    assert.strictEqual(json.success, true, "Response success should be true");
    assert.ok(json.data.appName, "App name must be present");
    assert.ok(json.data.logoUrl, "Logo URL must be present");
    console.log(`✅ PASS: Public branding retrieved. Active appName: "${json.data.appName}", version: v${json.data.version}`);
    passed++;
  } catch (e) {
    console.error("❌ FAIL Test 1:", e.message);
    failed++;
  }

  // Test 2: Unauthorized PUT /api/branding (No session)
  try {
    console.log("\n--- 2. Testing Security: Unauthorized PUT /api/branding (No session) ---");
    const res = await fetch(`${BASE_URL}/api/branding`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appName: "Hacked App" }),
    });
    assert.strictEqual(res.status, 401, "Unauthenticated request must be rejected with 401");
    console.log("✅ PASS: Blocked unauthenticated attempt to modify branding with HTTP 401");
    passed++;
  } catch (e) {
    console.error("❌ FAIL Test 2:", e.message);
    failed++;
  }

  // Test 3: Retailer PUT /api/branding (Role Forbidden)
  try {
    console.log("\n--- 3. Testing Security: Retailer Role Blocked (HTTP 403 Forbidden) ---");
    const retailerLogin = await login("retailer1@example.com", "Demo@12345");
    assert.strictEqual(retailerLogin.status, 200, "Retailer login should succeed");

    const res = await fetch(`${BASE_URL}/api/branding`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: retailerLogin.cookie,
      },
      body: JSON.stringify({ appName: "Retailer Custom Name" }),
    });

    assert.strictEqual(res.status, 403, "Retailer must be forbidden from updating branding (403)");
    console.log("✅ PASS: Correctly blocked Retailer from branding modifications with HTTP 403 Forbidden");
    passed++;
  } catch (e) {
    console.error("❌ FAIL Test 3:", e.message);
    failed++;
  }

  // Test 4: Super Admin PUT /api/branding (Allowed)
  let superAdminCookie = "";
  try {
    console.log("\n--- 4. Testing Super Admin Authorized Branding Update ---");
    const adminLogin = await login("admin@paymatrix.in", "Admin@123456");
    assert.strictEqual(adminLogin.status, 200, "Super Admin login should succeed");
    superAdminCookie = adminLogin.cookie;

    const res = await fetch(`${BASE_URL}/api/branding`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: superAdminCookie,
      },
      body: JSON.stringify({
        appName: "Recharge Pro Elite",
        tagline: "India's #1 Fintech & Multi-Recharge Network",
        primaryColor: "#0f172a",
        accentColor: "#2563eb",
      }),
    });

    assert.strictEqual(res.status, 200, "Super Admin update should return 200");
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.appName, "Recharge Pro Elite");
    console.log(`✅ PASS: Super Admin successfully updated appName to "${json.data.appName}" v${json.data.version}`);
    passed++;
  } catch (e) {
    console.error("❌ FAIL Test 4:", e.message);
    failed++;
  }

  // Test 5: Verify Public GET reflects the updated brand live
  try {
    console.log("\n--- 5. Testing Live Real-Time Brand Propagation ---");
    const res = await fetch(`${BASE_URL}/api/branding?t=${Date.now()}`);
    const json = await res.json();
    assert.strictEqual(json.data.appName, "Recharge Pro Elite", "Brand name must update immediately without deployment");
    console.log(`✅ PASS: Brand update live on GET /api/branding: "${json.data.appName}"`);
    passed++;
  } catch (e) {
    console.error("❌ FAIL Test 5:", e.message);
    failed++;
  }

  // Test 6: Verify Immutable Audit Log History
  try {
    console.log("\n--- 6. Testing Audit History Retrieval (GET /api/branding/history) ---");
    const res = await fetch(`${BASE_URL}/api/branding/history?limit=10`, {
      headers: { Cookie: superAdminCookie },
    });
    assert.strictEqual(res.status, 200, "History query should return 200");
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.history.length > 0, "Audit logs should not be empty");

    const latest = json.history[0];
    console.log(`✅ PASS: Audit log entry verified. Action: ${latest.action}, Field: ${latest.fieldChanged}, By: ${latest.adminEmail}`);
    passed++;
  } catch (e) {
    console.error("❌ FAIL Test 6:", e.message);
    failed++;
  }

  // Test 7: Restore Default Branding
  try {
    console.log("\n--- 7. Testing Super Admin Restore Default Branding ---");
    const res = await fetch(`${BASE_URL}/api/branding/restore`, {
      method: "POST",
      headers: { Cookie: superAdminCookie },
    });
    assert.strictEqual(res.status, 200, "Restore defaults should return 200");
    const json = await res.json();
    assert.strictEqual(json.data.appName, "Recharge Pro", "Default name must be 'Recharge Pro'");
    console.log(`✅ PASS: Default branding restored successfully to "${json.data.appName}"`);
    passed++;
  } catch (e) {
    console.error("❌ FAIL Test 7:", e.message);
    failed++;
  }

  // Test 8: Regional Admin Permissions
  try {
    console.log("\n--- 8. Testing Admin (Tier 2) Permissions ---");
    const regionalAdminLogin = await login("admin1@paymatrix.in", "Demo@12345");
    assert.strictEqual(regionalAdminLogin.status, 200, "Regional Admin login should succeed");

    // Admin should be able to update branding within permissions
    const updateRes = await fetch(`${BASE_URL}/api/branding`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: regionalAdminLogin.cookie,
      },
      body: JSON.stringify({
        tagline: "Premier High-Speed Recharge Switch",
      }),
    });
    assert.strictEqual(updateRes.status, 200, "Authorized Admin should update branding");

    // Admin should NOT be able to restore defaults (Super Admin only)
    const restoreRes = await fetch(`${BASE_URL}/api/branding/restore`, {
      method: "POST",
      headers: { Cookie: regionalAdminLogin.cookie },
    });
    assert.strictEqual(restoreRes.status, 403, "Admin must be blocked from restoring system defaults (HTTP 403)");
    console.log("✅ PASS: Admin permitted to update tagline, strictly prohibited from restoring defaults (HTTP 403)");
    passed++;
  } catch (e) {
    console.error("❌ FAIL Test 8:", e.message);
    failed++;
  }

  console.log("\n===============================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("===============================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
