import app from "./app.js";
import connectDB from "./config/db.js";
import seedAdmin from "./seed/admin.js";
import seedSubscriptionPlans from "./seed/seedPlans.js";
import migrateExistingUserTrials from "./seed/migrateTrials.js";
import mongoose from "mongoose";

const port = process.env.PORT || 5000;

// Start HTTP server immediately so port is listening and responsive
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Backend server successfully listening on port ${port} (http://0.0.0.0:${port}, http://localhost:${port}, http://127.0.0.1:${port})`);
});

// Initialize MongoDB connection and idempotent seeds asynchronously
(async () => {
  try {
    await connectDB();
    await seedAdmin();
    await seedSubscriptionPlans();
    await migrateExistingUserTrials();
    console.log("[INIT] Database connected and bootstrap seeds completed successfully.");
  } catch (err) {
    console.error("[INIT] Database initialization warning:", err.message);
  }
})();

// Graceful shutdown handling for container termination
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log("HTTP server closed.");
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close(false);
        console.log("MongoDB connection closed.");
      }
      process.exit(0);
    } catch (err) {
      console.error("Error closing MongoDB connection:", err);
      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default app;