/**
 * Dynamic URL Resolution Utility for Multi-App SmartBill Architecture.
 * Resolves URLs dynamically based on environment variables or intelligent runtime detection,
 * eliminating broken cross-host redirects in cloud/production deployments.
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
  // In local development, port 5173 hosts the landing page
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return `${window.location.protocol}//${window.location.hostname}:5173/`;
  }
  // In production (Vercel, custom domain, etc.), always stay on current domain root
  return "/";
};

export const getCrmUrl = (path = "") => {
  let cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  if (cleanPath.startsWith("/admin")) {
    cleanPath = cleanPath.replace(/^\/admin/, "/app");
  }
  if (!cleanPath || cleanPath === "/") {
    cleanPath = "/app";
  }
  
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // In local development, port 5174 hosts the CRM
    if (host === "localhost" || host === "127.0.0.1") {
      return `${window.location.protocol}//${host}:5174${cleanPath}`;
    }
    // In production unified deployment, stay on the same domain!
    if (cleanPath.startsWith("/app") || cleanPath.startsWith("/crm")) {
      return cleanPath;
    }
    if (cleanPath === "/login" || cleanPath === "/register" || cleanPath === "/forgot") {
      return cleanPath;
    }
    return `/app${cleanPath}`;
  }

  return cleanPath;
};

export const getAdminUrl = (path = "") => {
  let cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  if (cleanPath.startsWith("/app")) {
    cleanPath = cleanPath.replace(/^\/app/, "/admin");
  }
  if (!cleanPath || cleanPath === "/") {
    cleanPath = "/admin";
  }
  
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // In local development, port 5175 hosts the Admin Panel
    if (host === "localhost" || host === "127.0.0.1") {
      return `${window.location.protocol}//${host}:5175${cleanPath}`;
    }
    // In production unified deployment, stay on the same domain!
    if (cleanPath.startsWith("/admin")) {
      return cleanPath;
    }
    return `/admin${cleanPath}`;
  }

  return cleanPath;
};
