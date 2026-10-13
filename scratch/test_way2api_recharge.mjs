import assert from "node:assert";

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("===============================================================");
  console.log("WAY2API AUTO OPERATOR DETECTION & VIEW PLANS TEST SUITE");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  // 1. Mobile Lookup (Jio)
  try {
    console.log("--- 1. Testing Mobile Operator Lookup (Auto-Detect) ---");
    const res = await fetch(`${BASE_URL}/api/mobile/lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile: "9876543210" }),
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.operator, "Operator must be detected");
    assert.ok(json.data.circle, "Circle must be detected");
    assert.strictEqual(json.data.connectionType, "PREPAID");
    console.log(`✅ PASS: Mobile 9876543210 detected as ${json.data.operatorName} (${json.data.circleName}), MNP: ${json.data.isPorted}`);
    passed++;
  } catch (e) {
    console.error("❌ FAIL Test 1:", e.message);
    failed++;
  }

  // 2. Mobile MNP Ported Detection
  try {
    console.log("\n--- 2. Testing MNP Ported Number Detection ---");
    const res = await fetch(`${BASE_URL}/api/mobile/lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile: "9811122299" }),
    });
    const json = await res.json();
    assert.strictEqual(json.data.isPorted, true, "Number ending in 99 should be detected as ported");
    console.log(`✅ PASS: Ported mobile flagged correctly with MNP Port status: ${json.data.isPorted}`);
    passed++;
  } catch (e) {
    console.error("❌ FAIL Test 2:", e.message);
    failed++;
  }

  // 3. DTH Auto Operator Detection
  try {
    console.log("\n--- 3. Testing DTH Operator Detection ---");
    const res = await fetch(`${BASE_URL}/api/dth/lookup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriberId: "1002938475" }),
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.data.operator, "TATA_PLAY");
    console.log(`✅ PASS: Subscriber ID 1002938475 auto-detected as ${json.data.operatorName}`);
    passed++;
  } catch (e) {
    console.error("❌ FAIL Test 3:", e.message);
    failed++;
  }

  // 4. DTH Customer Details Lookup
  try {
    console.log("\n--- 4. Testing DTH Customer Account Details Retrieval ---");
    const res = await fetch(`${BASE_URL}/api/dth/details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriberId: "1002938475", operator: "TATA_PLAY" }),
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.ok(json.data.customerName, "Customer name must be returned");
    assert.ok(json.data.registeredMobileMasked.includes("****"), "Mobile must be masked");
    assert.ok(json.data.balance > 0, "Balance must be present");
    assert.ok(json.data.nextRechargeDate, "Next recharge date must be present");
    console.log(`✅ PASS: DTH Customer Name: "${json.data.customerName}", Masked Mobile: ${json.data.registeredMobileMasked}, Balance: ₹${json.data.balance}, Due: ${json.data.nextRechargeDate}`);
    passed++;
  } catch (e) {
    console.error("❌ FAIL Test 4:", e.message);
    failed++;
  }

  // 5. Mobile View Plans (Categorized)
  try {
    console.log("\n--- 5. Testing Mobile View Plans Endpoint ---");
    const res = await fetch(`${BASE_URL}/api/mobile/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operator: "JIO", circle: "DELHI" }),
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.ok(json.data.plans.length > 0, "Plans must be returned");

    const categories = new Set(json.data.plans.map(p => p.category));
    assert.ok(categories.has("POPULAR") || categories.has("UNLIMITED"), "Must have popular or unlimited plans");
    console.log(`✅ PASS: Retrieved ${json.data.plans.length} Mobile plans for Jio across categories: [${Array.from(categories).join(", ")}]`);
    passed++;
  } catch (e) {
    console.error("❌ FAIL Test 5:", e.message);
    failed++;
  }

  // 6. DTH View Plans
  try {
    console.log("\n--- 6. Testing DTH View Plans Endpoint ---");
    const res = await fetch(`${BASE_URL}/api/dth/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operator: "TATA_PLAY" }),
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.ok(json.data.plans.length > 0, "DTH plans must be returned");
    console.log(`✅ PASS: Retrieved ${json.data.plans.length} DTH plans for Tata Play`);
    passed++;
  } catch (e) {
    console.error("❌ FAIL Test 6:", e.message);
    failed++;
  }

  // 7. Recharge Submission with Idempotency Key
  let submittedTxId = "";
  const testIdempotencyKey = `IDEM-TEST-${Date.now()}`;
  try {
    console.log("\n--- 7. Testing Recharge Submission to Provider Switch ---");
    const res = await fetch(`${BASE_URL}/api/recharge/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceType: "MOBILE",
        identifier: "9876543210",
        operator: "JIO",
        operatorName: "Reliance Jio",
        circle: "DELHI",
        amount: 299,
        planDescription: "1.5GB/Day 28 Days Unlimited",
        idempotencyKey: testIdempotencyKey,
      }),
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.status, "SUCCESS");
    submittedTxId = json.data.transactionId;
    assert.ok(submittedTxId, "Tx ID must be generated");
    console.log(`✅ PASS: Recharge submitted successfully! Tx ID: ${submittedTxId}, Status: ${json.data.status}, Operator Ref: ${json.data.operatorReference}`);
    passed++;
  } catch (e) {
    console.error("❌ FAIL Test 7:", e.message);
    failed++;
  }

  // 8. Idempotency Protection (Duplicate Submission Prevention)
  try {
    console.log("\n--- 8. Testing Idempotency Protection (Duplicate Prevention) ---");
    const res = await fetch(`${BASE_URL}/api/recharge/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceType: "MOBILE",
        identifier: "9876543210",
        operator: "JIO",
        amount: 299,
        idempotencyKey: testIdempotencyKey, // Same idempotency key!
      }),
    });
    const json = await res.json();
    assert.strictEqual(json.data.transactionId, submittedTxId, "Must return existing transaction rather than charging again");
    console.log(`✅ PASS: Idempotency safety verified: Duplicate submission returned existing ${json.data.transactionId} without double-charging.`);
    passed++;
  } catch (e) {
    console.error("❌ FAIL Test 8:", e.message);
    failed++;
  }

  // 9. Query Transaction Status by ID
  try {
    console.log("\n--- 9. Testing GET /api/recharge/status/:id ---");
    const res = await fetch(`${BASE_URL}/api/recharge/status/${submittedTxId}`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.data.transactionId, submittedTxId);
    assert.strictEqual(json.data.status, "SUCCESS");
    console.log(`✅ PASS: Transaction status verified for ${submittedTxId}: ${json.data.status}`);
    passed++;
  } catch (e) {
    console.error("❌ FAIL Test 9:", e.message);
    failed++;
  }

  // 10. Query Transaction History
  try {
    console.log("\n--- 10. Testing GET /api/recharge/history ---");
    const res = await fetch(`${BASE_URL}/api/recharge/history?limit=10`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.ok(json.data.length > 0, "History must contain records");
    console.log(`✅ PASS: History retrieved ${json.count} transactions. Latest: ${json.data[0].transactionId}`);
    passed++;
  } catch (e) {
    console.error("❌ FAIL Test 10:", e.message);
    failed++;
  }

  console.log("\n===============================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("===============================================================");

  if (failed > 0) process.exit(1);
}

runTests();
