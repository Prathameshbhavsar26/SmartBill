import mongoose from "mongoose";

const dropLegacyIndexes = async () => {
  try {
    const collections = await mongoose.connection.db.listCollections({ name: "users" }).toArray();
    if (collections.length > 0) {
      const indexes = await mongoose.connection.db.collection("users").indexes();
      const hasPhoneIndex = indexes.some((idx) => idx.name === "phone_1");
      if (hasPhoneIndex) {
        await mongoose.connection.db.collection("users").dropIndex("phone_1");
        console.log("[DB] Successfully dropped legacy phone_1 unique index from users collection.");
      }
    }
  } catch (err) {
    console.warn("[DB] Index cleanup notice:", err.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await dropLegacyIndexes();
  } catch (error) {
    console.warn("MongoDB Atlas Connection failed:", error.message);
    console.log("Attempting fallback to local MongoDB...");
    try {
      const conn = await mongoose.connect("mongodb://127.0.0.1:27017/smartbill", {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`Local MongoDB Connected: ${conn.connection.host}`);
      await dropLegacyIndexes();
    } catch (localErr) {
      console.error("MongoDB Connection Failed: Please ensure your IP address is whitelisted in MongoDB Atlas Network Access settings (https://cloud.mongodb.com).");
      process.exit(1);
    }
  }
};

export default connectDB;