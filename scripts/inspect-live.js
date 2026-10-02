// Using native fetch in Node.js

async function main() {
  console.log("=== CHECKING LIVE DEPLOYMENT AT https://smartbill-pos-beige.vercel.app ===");
  const res = await fetch("https://smartbill-pos-beige.vercel.app/");
  const html = await res.text();
  console.log("Status:", res.status);
  console.log("HTML:", html.slice(0, 500));
  
  // Find script tags
  const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map(m => m[1]);
  console.log("Scripts found:", scripts);

  for (const scriptUrl of scripts) {
    const fullUrl = scriptUrl.startsWith("http") ? scriptUrl : "https://smartbill-pos-beige.vercel.app" + scriptUrl;
    console.log("\nInspecting script:", fullUrl);
    const scriptRes = await fetch(fullUrl);
    const scriptText = await scriptRes.text();
    console.log("Length:", scriptText.length);
    
    // Check for specific keywords
    if (scriptText.includes("/auth/profile")) {
      console.log("⚠️ SCRIPT CONTAINS /auth/profile");
      const idx = scriptText.indexOf("/auth/profile");
      console.log("Snippet around /auth/profile:", scriptText.substring(Math.max(0, idx - 100), Math.min(scriptText.length, idx + 100)));
    } else {
      console.log("✓ SCRIPT DOES NOT CONTAIN /auth/profile");
    }

    if (scriptText.includes("RedirectToCrm")) {
      console.log("⚠️ SCRIPT CONTAINS RedirectToCrm");
    }
  }

  // Check /register directly
  console.log("\n=== CHECKING https://smartbill-pos-beige.vercel.app/register ===");
  const regRes = await fetch("https://smartbill-pos-beige.vercel.app/register");
  console.log("/register Status:", regRes.status);
  const regHtml = await regRes.text();
  console.log("/register HTML:", regHtml.slice(0, 500));
  const regScripts = [...regHtml.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map(m => m[1]);
  console.log("/register Scripts found:", regScripts);

  for (const scriptUrl of regScripts) {
    const fullUrl = scriptUrl.startsWith("http") ? scriptUrl : "https://smartbill-pos-beige.vercel.app" + scriptUrl;
    console.log("\nInspecting /register script:", fullUrl);
    const scriptRes = await fetch(fullUrl);
    const scriptText = await scriptRes.text();
    console.log("Length:", scriptText.length);
    if (scriptText.includes("/auth/profile")) {
      console.log("⚠️ SCRIPT CONTAINS /auth/profile");
      const idx = scriptText.indexOf("/auth/profile");
      console.log("Snippet around /auth/profile:", scriptText.substring(Math.max(0, idx - 100), Math.min(scriptText.length, idx + 100)));
    }

    // Look for warmup or axios interceptors
    const warmIdx = scriptText.indexOf("warmupBackend");
    if (warmIdx !== -1) {
      console.log("Snippet around warmupBackend:", scriptText.substring(Math.max(0, warmIdx - 100), Math.min(scriptText.length, warmIdx + 200)));
    }

    // Look for getProfile
    const profIdx = scriptText.indexOf("getProfile");
    if (profIdx !== -1) {
      console.log("Snippet around getProfile:", scriptText.substring(Math.max(0, profIdx - 100), Math.min(scriptText.length, profIdx + 200)));
    }

    // Look for onNav
    const onNavIdx = scriptText.indexOf("navAuth");
    if (onNavIdx !== -1) {
      console.log("Snippet around navAuth:", scriptText.substring(Math.max(0, onNavIdx - 100), Math.min(scriptText.length, onNavIdx + 200)));
    }
  }
}

main().catch(console.error);
