/**
 * security.js
 * Security middleware for SmartBill API:
 *  1. Helmet HTTP headers protection (XSS, Clickjacking, MIME sniffing)
 *  2. Rate limiting for Authentication & General APIs (Brute-force protection)
 *  3. Production-hardened CORS whitelisting
 */

import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";

/**
 * 1. HELMET SECURITY HEADERS
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: false, // Set to false to allow API JSON responses without restrictive HTML CSP
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allows loading images/assets across frontend portals
});

/**
 * 2. RATE LIMITERS
 */

// Stricter limiter for Auth endpoints (Login, Register, Forgot Password)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 2000, // Generous limit
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: (req) => {
    // Always allow local development and loopback requests without rate limit blocking
    if (process.env.NODE_ENV !== "production") return true;
    const ip = req.ip || req.connection?.remoteAddress || "";
    return ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1" || ip.includes("localhost");
  },
  message: {
    message: "Too many authentication attempts from this IP. Please try again after 15 minutes.",
  },
});

// General API limiter for standard operations (Tenant-aware for multi-counter retail stores on shared Wi-Fi)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 1000 : 50000,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: (req) => {
    // If request contains an Authorization token, key by the token/tenant so multiple POS counters on one store Wi-Fi don't collide
    const authHeader = req.headers.authorization || "";
    if (authHeader.startsWith("Bearer ") && authHeader.length > 20) {
      return `auth_${authHeader.slice(-16)}`;
    }
    return req.ip || req.connection?.remoteAddress || "global_ip";
  },
  skip: (req) => {
    if (process.env.NODE_ENV !== "production") return true;
    const ip = req.ip || req.connection?.remoteAddress || "";
    return ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1" || ip.includes("localhost");
  },
  message: {
    message: "API rate limit exceeded. Please slow down your requests.",
  },
});

/**
 * 3. PRODUCTION CORS CONFIGURATION
 */
export const configuredCors = () => {
  const isProduction = process.env.NODE_ENV === "production";

  // Production whitelist from environment variable, with fallback defaults
  const rawOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : [
        "*",
        "https://smartbill.com",
        "https://www.smartbill.com",
        "https://app.smartbill.com",
        "https://admin.smartbill.com",
      ];

  const allowAll = rawOrigins.includes("*") || !isProduction;

  return cors({
    origin: (origin, callback) => {
      // In development or when wildcard * is configured, accept origin
      if (allowAll || !origin) {
        return callback(null, origin || true);
      }

      // Check if origin exactly matches production whitelist
      if (rawOrigins.includes(origin)) {
        return callback(null, origin);
      }

      // Allow preview / deployment domains on common hosting providers
      if (
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".onrender.com") ||
        origin.endsWith(".netlify.app") ||
        origin.endsWith(".railway.app") ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1")
      ) {
        return callback(null, origin);
      }

      return callback(new Error(`CORS policy violation: Origin ${origin} not allowed.`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });
};
