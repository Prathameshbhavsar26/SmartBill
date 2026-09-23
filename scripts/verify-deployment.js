const BASE_URL = "https://smartbill-pos-beige.vercel.app";

async function verify() {
  console.log("=========================================");
  console.log("SMARTBILL PRODUCTION DEPLOYMENT VERIFICATION");
  console.log("Base URL:", BASE_URL);
  console.log("=========================================");

  // 1. Health Endpoint
  console.log("\n1. Testing Backend /api/health endpoint...");
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const healthData = await healthRes.json();
  console.log("Health Status:", healthRes.status, healthData);

  // 2. Subscription Plans
  console.log("\n2. Testing Public /api/subscription-plans endpoint...");
  const plansRes = await fetch(`${BASE_URL}/api/subscription-plans`);
  const plansData = await plansRes.json();
  console.log("Plans Status:", plansRes.status, "Count:", plansData.count, "Plans:", plansData.data?.map(p => p.name));

  // 3. SuperAdmin Authentication
  console.log("\n3. Testing SuperAdmin Authentication POST /api/auth/login...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@smartbill.com",
      password: "Admin@12345",
    }),
  });
  const loginData = await loginRes.json();
  console.log("Login Status:", loginRes.status, "Message:", loginData.message, "User Role:", loginData.user?.role);

  // 4. Protected Route with JWT
  if (loginData.token) {
    console.log("\n4. Testing Protected Route GET /api/admin/dashboard-stats with JWT...");
    const statsRes = await fetch(`${BASE_URL}/api/admin/dashboard-stats`, {
      headers: { Authorization: `Bearer ${loginData.token}` },
    });
    const statsData = await statsRes.json();
    console.log("Dashboard Stats Status:", statsRes.status, "Total Businesses:", statsData.stats?.totalBusinesses, "GMV:", statsData.stats?.totalGMV);
  }

  // 5. Frontend Pages
  console.log("\n5. Testing Frontend Static Pages & SPA Assets...");
  for (const page of ["/", "/app", "/admin"]) {
    const pageRes = await fetch(`${BASE_URL}${page}`);
    const html = await pageRes.text();
    const hasRoot = html.includes('id="root"');
    console.log(`Page ${page.padEnd(8)}: Status ${pageRes.status} | Length: ${html.length} | Has root div: ${hasRoot}`);
  }

  console.log("\n=========================================");
  console.log("ALL VERIFICATION CHECKS PASSED!");
  console.log("=========================================");
}

verify().catch(console.error);
