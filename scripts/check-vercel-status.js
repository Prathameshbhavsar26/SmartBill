async function main() {
  const domains = [
    "https://smartbill-pos.vercel.app",
    "https://smartbill-pos-beige.vercel.app",
    "https://smartbill.vercel.app"
  ];
  
  const paths = ["", "/admin", "/app", "/crm"];

  for (const domain of domains) {
    console.log(`\n================== ${domain} ==================`);
    for (const path of paths) {
      const url = domain + path;
      try {
        const r = await fetch(url, { headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" } });
        const text = await r.text();
        const scripts = [...text.matchAll(/src=["']([^"']+)["']/g)].map(m => m[1]);
        console.log(`${url} => Status: ${r.status} | Age: ${r.headers.get("age")} | Scripts: ${JSON.stringify(scripts)}`);
      } catch (e) {
        console.log(`${url} => Error: ${e.message}`);
      }
    }
  }
}

main().catch(console.error);
