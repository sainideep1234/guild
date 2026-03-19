import { model, Schema } from "mongoose";

const AdminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["admin", "superadmin"],
      default: "admin",
    },
    bsg_uid: String,
    otp: { type: String },
    otp_expiresAt: { type: Number },
    otp_verified: { type: Boolean, default: false },
    reset_token: { type: String },
    reset_token_expiresAt: { type: Number },
  },
  { timestamps: true },
);

const Admin = model("Admin", AdminSchema);
export default Admin;
