// Test Suite for Automatic Verification Operator System API
const BASE_URL = "http://localhost:3000";

async function run() {
  console.log("===============================================================");
  console.log("AUTOMATIC VERIFICATION OPERATOR SYSTEM API TEST SUITE");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = "") {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`);
      if (details) console.error("   Details:", details);
      failed++;
    }
  }

  // Login first to obtain authorized session
  console.log("--- 0. Authenticating Session ---");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identifier: "superdist1@paymatrix.in",
      password: "Demo@12345",
    }),
  });
  const cookie = loginRes.headers.get("set-cookie") || "";
  const match = cookie.match(/paymatrix_session=([^;]+)/);
  const sessionCookie = match ? `paymatrix_session=${match[1]}` : "";
  assert(loginRes.status === 200 && sessionCookie.length > 0, "Obtained authenticated session cookie");

  const authHeaders = {
    "Content-Type": "application/json",
    Cookie: sessionCookie,
  };

  // 1. DTH Verification - Known Subscriber
  console.log("\n--- 1. Testing DTH Customer Name Verification (Known Account) ---");
  const dthRes1 = await fetch(`${BASE_URL}/api/verify/dth`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      operator: "TATA_PLAY",
      subscriberId: "1002938475",
    }),
  });
  const dthData1 = await dthRes1.json();
  assert(
    dthRes1.status === 200 &&
    dthData1.data?.customerName === "Rameshwar Prasad Sharma" &&
    dthData1.data?.status === "ACTIVE" &&
    dthData1.data?.providerReference?.startsWith("PRV-TA-") &&
    dthData1.data?.internalCaseReference?.startsWith("VRF-"),
    "DTH Customer Name Verification returns registered name & references",
    JSON.stringify(dthData1)
  );

  // 2. DTH Verification - Dynamic VC Number
  console.log("\n--- 2. Testing DTH Verification (Dynamic Account) ---");
  const dthRes2 = await fetch(`${BASE_URL}/api/verify/dth`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      operator: "AIRTEL_DTH",
      subscriberId: "3002948172",
    }),
  });
  const dthData2 = await dthRes2.json();
  assert(
    dthRes2.status === 200 &&
    dthData2.data?.customerName === "Mohammed Farooq Khan" &&
    dthData2.data?.planName?.includes("Airtel") &&
    dthData2.data?.providerReference &&
    dthData2.data?.internalCaseReference,
    "Airtel DTH subscriber verification returns registered name & plan",
    JSON.stringify(dthData2)
  );

  // 3. Mobile Recharge Verification & HLR Lookup
  console.log("\n--- 3. Testing Mobile Recharge Verification & HLR Lookup ---");
  const mobRes = await fetch(`${BASE_URL}/api/verify/mobile`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      mobile: "9876543210",
      transactionId: "TXN-20261013-0091",
    }),
  });
  const mobData = await mobRes.json();
  assert(
    mobRes.status === 200 &&
    mobData.data?.mobile === "9876543210" &&
    mobData.data?.operator === "AIRTEL" &&
    mobData.data?.rechargeStatus === "SUCCESS" &&
    mobData.data?.providerReference &&
    mobData.data?.internalCaseReference,
    "Mobile HLR & transaction verification returns operator, status & references",
    JSON.stringify(mobData)
  );

  // 4. Refer Inconclusive / Failed Case to Operator
  console.log("\n--- 4. Testing Refer to Operator Desk ---");
  const caseRef = dthData1.data?.internalCaseReference;
  const referRes = await fetch(`${BASE_URL}/api/verify/refer`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      service: "DTH",
      identifier: "1002938475",
      operator: "TATA_PLAY",
      caseReference: caseRef,
      customerName: "Rameshwar Prasad Sharma",
      providerReference: dthData1.data?.providerReference,
      reason: "Account status mismatch observed during customer verification",
      priority: "HIGH",
    }),
  });
  const referData = await referRes.json();
  assert(
    referRes.status === 200 &&
    referData.success === true &&
    referData.case?.caseReference === caseRef &&
    referData.case?.status === "PENDING_OPERATOR_REVIEW",
    "Account successfully routed to operator queue with case reference",
    JSON.stringify(referData)
  );

  // 5. Query Operator Review Queue (GET /api/verify/cases)
  console.log("\n--- 5. Testing Operator Review Queue Query ---");
  const casesRes = await fetch(`${BASE_URL}/api/verify/cases`, {
    headers: authHeaders,
  });
  const casesData = await casesRes.json();
  const foundCase = casesData.cases?.find(c => c.caseReference === caseRef);
  assert(
    casesRes.status === 200 &&
    Array.isArray(casesData.cases) &&
    foundCase !== undefined,
    "Operator Queue retrieves referred case with search and filters",
    `Total cases: ${casesData.cases?.length}`
  );

  // 6. Operator Action / Resolution (PUT /api/verify/cases/[id])
  console.log("\n--- 6. Testing Operator Resolution Action ---");
  if (foundCase) {
    const updateRes = await fetch(`${BASE_URL}/api/verify/cases/${foundCase.id}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        status: "RESOLVED",
        operatorNotes: "Customer KYC verified against provider records. Account active.",
        assignedOperator: "OPR-Senior-Agent",
      }),
    });
    const updateData = await updateRes.json();
    assert(
      updateRes.status === 200 &&
      updateData.case?.status === "RESOLVED" &&
      updateData.case?.operatorNotes?.includes("KYC verified"),
      "Operator marks case as RESOLVED with audit note",
      JSON.stringify(updateData)
    );
  }

  console.log("\n===============================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("===============================================================\n");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

run();
