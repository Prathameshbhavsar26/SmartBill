import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn("MongoDB Atlas Connection failed:", error.message);
    console.log("Attempting fallback to local MongoDB...");
    try {
      const conn = await mongoose.connect("mongodb://127.0.0.1:27017/smartbill", {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`Local MongoDB Connected: ${conn.connection.host}`);
    } catch (localErr) {
      console.error("MongoDB Connection Failed: Please ensure your IP address is whitelisted in MongoDB Atlas Network Access settings (https://cloud.mongodb.com).");
      process.exit(1);
    }
  }
};

export default connectDB;