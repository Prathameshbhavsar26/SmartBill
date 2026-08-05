import express from "express";
import cors from "cors";
import "dotenv/config";
import dns from "node:dns";
import connectDB from "./config/db.js";
import authRoutes from "./routes/Auth Routes.js";
import seedAdmin from "./seed/admin.js";

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

// CORS - allow the Vite dev server (or any configured client origin)
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. Postman, curl, same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API working");
});

// 404 handler for unknown API routes
app.use((req, res) => {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
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
