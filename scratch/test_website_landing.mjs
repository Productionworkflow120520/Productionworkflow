import assert from "node:assert";

const BASE_URL = "http://localhost:3000";

async function run() {
  console.log("=== Testing Website Landing Page & Contact Verification ===");

  // 1. Test GET /
  const pageRes = await fetch(`${BASE_URL}/`);
  assert.strictEqual(pageRes.status, 200, "Home page should return 200");
  const html = await pageRes.text();

  // Verify website name & contacts appear
  assert.ok(html.includes("Recharge Pro"), "Page must contain our website name 'Recharge Pro'");
  assert.ok(html.includes("7045470545"), "Page must contain phone 7045470545");
  assert.ok(html.includes("9867231230"), "Page must contain phone 9867231230");
  assert.ok(html.includes("022 - 40160303"), "Page must contain landline 022 - 40160303");
  assert.ok(html.includes("100,000+") || html.includes("100000+"), "Page must contain 100,000+ Retailers");
  assert.ok(html.includes("5,000+") || html.includes("5000+"), "Page must contain 5,000+ Distributors");

  // Strict verification: ZERO SMS Wallet details or links
  assert.ok(!html.includes("SMS Link Wallet"), "Must NOT contain 'SMS Link Wallet'");
  assert.ok(!html.includes("SMS Wallet"), "Must NOT contain 'SMS Wallet'");
  assert.ok(!html.includes("smslinkwallet"), "Must NOT contain 'smslinkwallet'");
  assert.ok(!html.includes("com.rechbbpsapp"), "Must NOT contain external SMS wallet app link");
  console.log("✅ PASS: Verified all SMS Wallet links and details have been completely removed.");
  console.log("✅ PASS: Verified only website name and contact details are displayed.");

  // 2. Test POST /api/enquire
  const enquireRes = await fetch(`${BASE_URL}/api/enquire`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Rohan Gupta",
      mobile: "9876543210",
      role: "Distributor",
      city: "Pune",
      message: "Interested in onboarding retailers",
    }),
  });
  assert.strictEqual(enquireRes.status, 200, "/api/enquire should return 200");
  const json = await enquireRes.json();
  assert.strictEqual(json.success, true);
  console.log(`✅ PASS: Enquiry system active. Lead generated: ${json.enquiryId}`);

  console.log("\nALL VERIFICATION CHECKS PASSED!");
}

run().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
