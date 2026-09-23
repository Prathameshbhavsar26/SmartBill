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

console.log("[BUILD-ROOT] Unified production bundle created successfully in dist/.");
