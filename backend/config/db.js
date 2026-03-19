import mongoose from "mongoose";
import "dotenv/config";


export async function connectToDb() {
  try {
    if (!process.env.MONGO_DB_URI) {
      throw new Error("MONGO_DB_URI is not defined in .env file");
    }
    const conn = await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("✅ Mongo DB connected");
  } catch (error) {
    console.error("❌ Mongo DB failed to connect:", error.message);
  }
}
