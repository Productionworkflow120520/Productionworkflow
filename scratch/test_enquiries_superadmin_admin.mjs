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

async function run() {
  console.log("=== Testing Super Admin & Admin Enquiries System ===");

  // 1. Verify GET /api/enquire
  const getRes = await fetch(`${BASE_URL}/api/enquire`);
  assert.strictEqual(getRes.status, 200, "GET /api/enquire must return 200");
  const getJson = await getRes.json();
  assert.strictEqual(getJson.success, true);
  assert.ok(getJson.enquiries.length > 0, "Enquiries list should not be empty");
  console.log(`✅ PASS: Retrieved ${getJson.total} total enquiries from store.`);

  // 2. Submit new enquiry for Super Admin role
  const superAdminLeadRes = await fetch(`${BASE_URL}/api/enquire`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Devendra Singhal",
      mobile: "9820011223",
      role: "Super Admin",
      city: "Bengaluru, Karnataka",
      message: "Requesting full platform ownership and enterprise multi-operator setup",
    }),
  });
  assert.strictEqual(superAdminLeadRes.status, 200, "POST Super Admin lead must return 200");
  const saJson = await superAdminLeadRes.json();
  assert.ok(saJson.enquiryId.startsWith("ENQ-"));
  console.log(`✅ PASS: Created Super Admin enquiry lead: ${saJson.enquiryId}`);

  // 3. Submit new enquiry for Admin role
  const adminLeadRes = await fetch(`${BASE_URL}/api/enquire`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Prakash Jha",
      mobile: "9833445566",
      role: "Admin",
      city: "Patna, Bihar",
      message: "Interested in state administrative franchise rights",
    }),
  });
  assert.strictEqual(adminLeadRes.status, 200, "POST Admin lead must return 200");
  const aJson = await adminLeadRes.json();
  assert.ok(aJson.enquiryId.startsWith("ENQ-"));
  console.log(`✅ PASS: Created Admin enquiry lead: ${aJson.enquiryId}`);

  // 4. Update status and follow-up notes via PATCH /api/enquire
  const patchRes = await fetch(`${BASE_URL}/api/enquire`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: saJson.enquiryId,
      status: "CONTACTED",
      notes: "Spoke with Devendra. Demo scheduled for Friday morning.",
    }),
  });
  assert.strictEqual(patchRes.status, 200, "PATCH enquiry must return 200");
  const patchJson = await patchRes.json();
  assert.strictEqual(patchJson.data.status, "CONTACTED");
  assert.strictEqual(patchJson.data.notes, "Spoke with Devendra. Demo scheduled for Friday morning.");
  console.log(`✅ PASS: Successfully updated status and follow-up notes on enquiry.`);

  // 5. Test Super Admin dashboard page access (/super-admin/enquiries)
  const superAdminLogin = await login("admin@paymatrix.in", "Admin@123456");
  assert.strictEqual(superAdminLogin.status, 200);
  const saPageRes = await fetch(`${BASE_URL}/super-admin/enquiries`, {
    headers: { Cookie: superAdminLogin.cookie },
  });
  assert.strictEqual(saPageRes.status, 200, "Super Admin enquiries page should return 200");
  console.log("✅ PASS: Super Admin authenticated access to /super-admin/enquiries verified.");

  // 6. Test Admin dashboard page access (/admin/enquiries)
  const adminLogin = await login("admin1@paymatrix.in", "Demo@12345");
  assert.strictEqual(adminLogin.status, 200);
  const adminPageRes = await fetch(`${BASE_URL}/admin/enquiries`, {
    headers: { Cookie: adminLogin.cookie },
  });
  assert.strictEqual(adminPageRes.status, 200, "Admin enquiries page should return 200");
  console.log("✅ PASS: Admin authenticated access to /admin/enquiries verified.");

  // 7. Verify public landing page has Super Admin and Admin options
  const homeRes = await fetch(`${BASE_URL}/`);
  const html = await homeRes.text();
  assert.ok(html.includes("Super Admin (Platform Owner"), "Landing page must contain Super Admin option");
  assert.ok(html.includes("Admin (Franchise"), "Landing page must contain Admin option");
  console.log("✅ PASS: Public form includes Super Admin and Admin in Partnership Type dropdown.");

  console.log("\nALL ENQUIRIES & LEADS TESTS PASSED!");
}

run().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
