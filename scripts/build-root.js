import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const distDir = path.join(rootDir, "dist");
const landingDist = path.join(rootDir, "apps", "landing-page", "dist");
const crmDist = path.join(rootDir, "apps", "crm", "dist");
const adminDist = path.join(rootDir, "apps", "admin-panel", "dist");

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log("[BUILD-ROOT] Assembling unified distribution bundle in dist/ ...");

// Ensure clean dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// 1. Copy Landing Page to root dist/
if (fs.existsSync(landingDist)) {
  copyDirSync(landingDist, distDir);
  console.log(" ✓ Landing Page assembled to dist/");
}

// 2. Copy CRM to dist/app and dist/crm
if (fs.existsSync(crmDist)) {
  copyDirSync(crmDist, path.join(distDir, "app"));
  copyDirSync(crmDist, path.join(distDir, "crm"));
  console.log(" ✓ CRM Merchant App assembled to dist/app/ and dist/crm/");
}

// 3. Copy Admin Panel to dist/admin
if (fs.existsSync(adminDist)) {
  copyDirSync(adminDist, path.join(distDir, "admin"));
  console.log(" ✓ SuperAdmin Panel assembled to dist/admin/");
}

// 4. Merge all frontend assets into the root dist/assets/ folder
// so absolute /assets/... script and style references from all apps resolve immediately
const rootAssetsDir = path.join(distDir, "assets");
fs.mkdirSync(rootAssetsDir, { recursive: true });

for (const appDist of [landingDist, crmDist, adminDist]) {
  const appAssetsDir = path.join(appDist, "assets");
  if (fs.existsSync(appAssetsDir)) {
    copyDirSync(appAssetsDir, rootAssetsDir);
  }
}
console.log(" ✓ Merged shared asset bundles into dist/assets/");

// 5. Generate _redirects files for Static Hosts (Render, Netlify, Cloudflare Pages)
const rootRedirects = [
  "/admin/* /admin/index.html 200",
  "/admin /admin/index.html 200",
  "/app/* /app/index.html 200",
  "/app /app/index.html 200",
  "/crm/* /crm/index.html 200",
  "/crm /crm/index.html 200",
  "/login /app/index.html 200",
  "/register /app/index.html 200",
  "/forgot /app/index.html 200",
  "/pos /app/index.html 200",
  "/sales /app/index.html 200",
  "/billing /app/index.html 200",
  "/customers /app/index.html 200",
  "/suppliers /app/index.html 200",
  "/products /app/index.html 200",
  "/inventory /app/index.html 200",
  "/dashboard /app/index.html 200",
  "/* /index.html 200",
].join("\n");

fs.writeFileSync(path.join(distDir, "_redirects"), rootRedirects, "utf8");

const appRedirects = "/app/* /app/index.html 200\n/* /app/index.html 200\n";
const crmRedirects = "/crm/* /crm/index.html 200\n/* /crm/index.html 200\n";
const adminRedirects = "/admin/* /admin/index.html 200\n/* /admin/index.html 200\n";

if (fs.existsSync(path.join(distDir, "app"))) {
  fs.writeFileSync(path.join(distDir, "app", "_redirects"), appRedirects, "utf8");
}
if (fs.existsSync(path.join(distDir, "crm"))) {
  fs.writeFileSync(path.join(distDir, "crm", "_redirects"), crmRedirects, "utf8");
}
if (fs.existsSync(path.join(distDir, "admin"))) {
  fs.writeFileSync(path.join(distDir, "admin", "_redirects"), adminRedirects, "utf8");
}
console.log(" ✓ Generated routing _redirects for Render, Netlify, and Cloudflare Pages");

console.log("[BUILD-ROOT] Unified production bundle created successfully in dist/.");

