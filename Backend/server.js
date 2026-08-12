import express from "express";
import cors from "cors";
import "dotenv/config";
import dns from "node:dns";
import connectDB from "./config/db.js";
import authRoutes from "./routes/Auth Routes.js";
import customerRoutes from "./routes/customerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import seedAdmin from "./seed/admin.js";
import productRoutes from "./routes/productRoutes.js";
import customizationRoutes from "./routes/customizationRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import businessSettingsRoutes from "./routes/businessSettingsRoutes.js";

const app = express();
const port = process.env.PORT || 5000;

// Use reliable public DNS servers for Node's resolver.
// Workaround: Node's c-ares auto-detection can pick a dead/unreachable DNS
// path from a disconnected VPN/TAP adapter, causing "querySrv ECONNREFUSED"
// even though the system DNS works fine.
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (err) {
  console.warn("Could not set custom DNS servers:", err.message);
}

// Connect to MongoDB
await connectDB();

// Seed the default Super Admin account (idempotent).
await seedAdmin();

// CORS - allow local development origins and configured client origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  ...(process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
    : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Postman, curl, mobile apps, same-origin)
      if (!origin) return callback(null, true);

      // Allow any localhost / 127.0.0.1 origin or explicitly listed client origins
      const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

      if (isLocalhost || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`[CORS Blocked] Request from origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/products", productRoutes);
app.use("/api/settings/customization", customizationRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/settings/business", businessSettingsRoutes);

app.get("/", (req, res) => {
  res.send("API working");
});

// 404 handler for unknown API routes
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.message);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});