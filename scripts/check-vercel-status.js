async function main() {
  const urls = [
    "https://smartbill-pos-beige.vercel.app/",
    "https://smartbill-pos-beige.vercel.app/admin",
    "https://smartbill-pos-beige.vercel.app/app",
    "https://smartbill-pos-beige.vercel.app/crm",
    "https://smartbill-crm.vercel.app",
    "https://smartbill-admin.vercel.app",
    "https://smartbill-landing.vercel.app",
    "https://smartbill-backend-tqf5.onrender.com/health"
  ];
  for (const u of urls) {
    try {
      const r = await fetch(u, { headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" } });
      const text = await r.text();
      const scripts = [...text.matchAll(/src=["']([^"']+)["']/g)].map(m => m[1]);
      console.log("=== " + u + " ===");
      console.log("Status:", r.status, "Age:", r.headers.get("age"), "x-vercel-id:", r.headers.get("x-vercel-id") || "none");
      console.log("Scripts:", scripts);
    } catch (e) {
      console.log("=== " + u + " ===");
      console.log("Error:", e.message);
    }
  }
}

main().catch(console.error);
