import express from "express";
import cors from "cors";
import "dotenv/config";
import dns from "node:dns";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import seedAdmin from "./seed/admin.js";
import seedSubscriptionPlans from "./seed/seedPlans.js";
import migrateExistingUserTrials from "./seed/migrateTrials.js";
import productRoutes from "./routes/productRoutes.js";
import customizationRoutes from "./routes/customizationRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import purchaseReturnRoutes from "./routes/purchaseReturnRoutes.js";
import businessSettingsRoutes from "./routes/businessSettingsRoutes.js";
import transactionSettingsRoutes from "./routes/transactionSettingsRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import invoiceSettingsRoutes from "./routes/invoiceSettingsRoutes.js";
import partySettingsRoutes from "./routes/partySettingsRoutes.js";
import accountingSettingsRoutes from "./routes/accountingSettingsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import paymentSettingsRoutes from "./routes/paymentSettingsRoutes.js";
import subscriptionPlanRoutes from "./routes/subscriptionPlanRoutes.js";
import inventorySettingsRoutes from "./routes/inventorySettingsRoutes.js";
import subscriptionPublicRoutes from "./routes/subscriptionPublicRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import cashVoucherRoutes from "./routes/cashVoucherRoutes.js";

import {
  securityHeaders,
  authLimiter,
  apiLimiter,
  configuredCors,
} from "./middleware/security.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Trust reverse proxy (needed for accurate IP rate limiting on Vercel / Render / Railway / Cloudflare)
app.set("trust proxy", 1);

// Use reliable public DNS servers for Node's resolver.
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (err) {
  // Silent catch in serverless environments
}

// 1. Apply Helmet Security Headers
app.use(securityHeaders);

// 2. Apply Production / Dev CORS
app.use(configuredCors());

// 3. Serverless DB Connection Middleware for all API routes
let isSeeded = false;
export const ensureDatabase = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    if (!isSeeded) {
      isSeeded = true;
      // Trigger background seeds idempotently without blocking request flow
      Promise.all([
        seedAdmin(),
        seedSubscriptionPlans(),
        migrateExistingUserTrials(),
      ]).catch((err) => {
        console.warn("[INIT] Background seed notice:", err.message);
      });
    }
    next();
  } catch (err) {
    console.error("[DB Middleware Error]", err.message);
    // Continue so health checks or unauthenticated error handlers can respond
    next();
  }
};

app.use("/api", ensureDatabase);

// 4. Global API Rate Limiter
app.use("/api", apiLimiter);

// 5. Cloud Health Check Endpoints
const healthHandler = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
  } catch (err) {
    // Database connection error captured in dbStatus
  }
  const isDbConnected = mongoose.connection.readyState === 1;
  const isDbConnecting = mongoose.connection.readyState === 2;
  const dbStatus = isDbConnected ? "connected" : isDbConnecting ? "connecting" : "disconnected";

  res.status(200).json({
    success: true,
    message: "SmartBill API is operating normally.",
    status: isDbConnected ? "healthy" : "degraded",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbStatus,
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
};

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Public routes
app.use("/api/subscription-plans", subscriptionPublicRoutes);

// Routes (with dedicated Auth Limiter for login/register protection)
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/products", productRoutes);
app.use("/api/settings/customization", customizationRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/purchase-returns", purchaseReturnRoutes);
app.use("/api/settings/business", businessSettingsRoutes);
app.use("/api/settings/invoice", invoiceSettingsRoutes);
app.use("/api/settings/party", partySettingsRoutes);
app.use("/api/settings/transaction", transactionSettingsRoutes);
app.use("/api/settings/payment", paymentSettingsRoutes);
app.use("/api/settings/accounting", accountingSettingsRoutes);
app.use("/api/settings/inventory", inventorySettingsRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/admin/coupons", couponRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin/subscription-plans", subscriptionPlanRoutes);
app.use("/api/cash-vouchers", cashVoucherRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "SmartBill API is operating normally.", status: "running" });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use(errorHandler);

export default app;
