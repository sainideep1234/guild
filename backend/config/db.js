import mongoose from "mongoose";
import "dotenv/config";


export async function connectToDb() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("Mongo DB connected");
  } catch (error) {
    console.log("Mongo DB failed to connect ");
  }
}
