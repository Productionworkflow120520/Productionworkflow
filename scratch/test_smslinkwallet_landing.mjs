import assert from "node:assert";

const BASE_URL = "http://localhost:3000";

async function run() {
  console.log("=== Testing SMS Link Wallet Landing Page & Enquire API ===");

  // 1. Test GET /
  const pageRes = await fetch(`${BASE_URL}/`);
  assert.strictEqual(pageRes.status, 200, "Home page should return 200");
  const html = await pageRes.text();

  assert.ok(html.includes("SMS Link Wallet"), "Page must contain 'SMS Link Wallet'");
  assert.ok(html.includes("7045470545"), "Page must contain phone 7045470545");
  assert.ok(html.includes("9867231230"), "Page must contain phone 9867231230");
  assert.ok(html.includes("022 - 40160303"), "Page must contain landline 022 - 40160303");
  assert.ok(html.includes("100000+"), "Page must contain 100000+ Retailers");
  assert.ok(html.includes("5000+"), "Page must contain 5000+ Distributors");
  assert.ok(html.includes("com.rechbbpsapp"), "Page must contain Play store link");

  // Verify that physical address and support email are omitted as requested
  assert.ok(!html.includes("PRATAPGARH CHS LTD"), "Registered address must NOT appear");
  assert.ok(!html.includes("support@smslinkwallet.in"), "Support email must NOT appear");
  console.log("✅ PASS: Landing page contains all SMS Link Wallet sections and contact numbers, strictly omitting physical address and email as instructed.");

  // 2. Test POST /api/enquire validation
  const badRes = await fetch(`${BASE_URL}/api/enquire`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "A", mobile: "123" }),
  });
  assert.strictEqual(badRes.status, 400, "Invalid mobile must return 400");
  console.log("✅ PASS: /api/enquire validates mobile number properly.");

  // 3. Test POST /api/enquire successful submission
  const goodRes = await fetch(`${BASE_URL}/api/enquire`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Suresh Patil",
      mobile: "9820112233",
      role: "Retailer",
      city: "Mumbai",
      message: "Want to start mobile recharge and DTH in shop",
    }),
  });
  assert.strictEqual(goodRes.status, 200, "Valid enquiry must return 200");
  const goodJson = await goodRes.json();
  assert.strictEqual(goodJson.success, true);
  assert.ok(goodJson.enquiryId.startsWith("ENQ-"), "Must generate enquiry ID");
  console.log(`✅ PASS: /api/enquire generated enquiry ID: ${goodJson.enquiryId}`);

  console.log("\nALL SMS LINK WALLET TESTS PASSED!");
}

run().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
