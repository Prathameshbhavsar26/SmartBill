/**
 * Dynamic URL Resolution Utility for Multi-App SmartBill Architecture.
 * Resolves URLs dynamically based on environment variables (e.g. VITE_ADMIN_URL, VITE_CRM_URL, VITE_LANDING_URL)
 * or intelligent runtime detection, eliminating broken localhost URLs in cloud/production deployments.
 */

export const sanitizeUrl = (val) => {
  if (!val) return "";
  let str = String(val).trim();
  if (str.includes("\n")) {
    const lines = str.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
    const found = lines.find((l) => l.includes("http://") || l.includes("https://"));
    if (found) {
      str = found.includes("=") ? found.split("=").slice(1).join("=") : found;
    } else {
      str = lines[0] || "";
    }
  }
  const httpMatch = str.match(/https?:\/\/[^\s"']+/);
  if (httpMatch) {
    str = httpMatch[0];
  }
  return str.replace(/#.*$/, "").trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");
};

export const getLandingUrl = () => {
  if (typeof window === "undefined") return "/";
  const rawLanding = sanitizeUrl(import.meta.env?.VITE_LANDING_URL);
  if (rawLanding) {
    return rawLanding;
  }
  // In development, default to port 5173 if running on localhost
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return `${window.location.protocol}//${window.location.hostname}:5173/`;
  }
  return "/";
};

export const getCrmUrl = (path = "") => {
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  const rawCrm = sanitizeUrl(import.meta.env?.VITE_CRM_URL);
  if (rawCrm) {
    return `${rawCrm}${cleanPath}`;
  }
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return `${window.location.protocol}//${window.location.hostname}:5174${cleanPath}`;
  }
  if (cleanPath.startsWith("/app") || cleanPath.startsWith("/crm")) {
    return cleanPath;
  }
  if (cleanPath === "/login" || cleanPath === "/register" || cleanPath === "/forgot") {
    return cleanPath;
  }
  return `/app${cleanPath}`;
};

export const getAdminUrl = (path = "") => {
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  const rawAdmin = sanitizeUrl(import.meta.env?.VITE_ADMIN_URL);
  if (rawAdmin) {
    return `${rawAdmin}${cleanPath}`;
  }
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return `${window.location.protocol}//${window.location.hostname}:5175${cleanPath}`;
  }
  if (cleanPath.startsWith("/admin")) {
    return cleanPath;
  }
  return `/admin${cleanPath}`;
};
