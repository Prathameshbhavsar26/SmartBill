import mongoose from "mongoose";
import dns from "dns";

// Fix Windows / Node.js DNS SRV resolution issue for MongoDB Atlas clusters
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (dnsErr) {
  // Silent catch in restricted serverless environments
}

let indexesChecked = false;

const dropLegacyIndexes = async () => {
  if (indexesChecked) return;
  try {
    const db = mongoose.connection.db;
    if (!db) return;
    const collections = await db.listCollections().toArray();
    const names = collections.map((c) => c.name);

    if (names.includes("users")) {
      const indexes = await db.collection("users").indexes();
      if (indexes.some((idx) => idx.name === "phone_1")) {
        await db.collection("users").dropIndex("phone_1");
        console.log("[DB] Successfully dropped legacy phone_1 index from users.");
      }
    }

    if (names.includes("accountingsettings")) {
      const indexes = await db.collection("accountingsettings").indexes();
      if (indexes.some((idx) => idx.name === "ownerId_1")) {
        await db.collection("accountingsettings").dropIndex("ownerId_1");
        console.log("[DB] Successfully dropped legacy ownerId_1 index from accountingsettings.");
      }
    }

    if (names.includes("orders")) {
      const indexes = await db.collection("orders").indexes();
      if (indexes.some((idx) => idx.name === "invoiceNo_1")) {
        await db.collection("orders").dropIndex("invoiceNo_1");
        console.log("[DB] Successfully dropped legacy global invoiceNo_1 index from orders.");
      }
    }

    if (names.includes("products")) {
      const indexes = await db.collection("products").indexes();
      if (indexes.some((idx) => idx.name === "sku_1")) {
        await db.collection("products").dropIndex("sku_1");
        console.log("[DB] Successfully dropped legacy global sku_1 index from products.");
      }
    }
    indexesChecked = true;
  } catch (err) {
    console.warn("[DB] Index cleanup notice:", err.message);
  }
};

// Global cache for Serverless Function execution environments (Vercel / AWS Lambda)
let cached = global._mongooseCached;
if (!cached) {
  cached = global._mongooseCached = { conn: null, promise: null };
}

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cached.conn && cached.conn.readyState === 1) {
    return cached.conn;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false,
    };

    if (mongoUri) {
      cached.promise = mongoose
        .connect(mongoUri, opts)
        .then((mongooseInstance) => {
          console.log(`[DB] MongoDB Connected: ${mongooseInstance.connection.host}`);
          dropLegacyIndexes().catch(() => {});
          return mongooseInstance.connection;
        })
        .catch(async (error) => {
          console.warn("[DB] MongoDB Atlas connection error:", error.message);
          // Fallback to local MongoDB in development environments only
          if (process.env.NODE_ENV !== "production") {
            try {
              console.log("[DB] Attempting fallback to local MongoDB...");
              const localConn = await mongoose.connect("mongodb://127.0.0.1:27017/smartbill", {
                serverSelectionTimeoutMS: 3000,
                bufferCommands: false,
              });
              console.log(`[DB] Local MongoDB Connected: ${localConn.connection.host}`);
              dropLegacyIndexes().catch(() => {});
              return localConn.connection;
            } catch (localErr) {
              cached.promise = null;
              throw error;
            }
          }
          cached.promise = null;
          throw error;
        });
    } else {
      console.warn("[DB] No MONGODB_URI environment variable provided.");
      if (process.env.NODE_ENV !== "production") {
        cached.promise = mongoose
          .connect("mongodb://127.0.0.1:27017/smartbill", {
            serverSelectionTimeoutMS: 3000,
            bufferCommands: false,
          })
          .then((conn) => {
            console.log(`[DB] Local MongoDB Connected: ${conn.connection.host}`);
            return conn.connection;
          })
          .catch((err) => {
            cached.promise = null;
            throw err;
          });
      }
    }
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
};

export default connectDB;