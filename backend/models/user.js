import { model, Schema } from "mongoose";

const RegistrationSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    password: { type: String },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    mobile_no: { type: String },
    section: { type: String },
    otp: { type: String },
    otp_expiresAt: { type: Number },
    otp_verified: { type: Boolean, default: false },
    reset_token: { type: String },
    reset_token_expiresAt: { type: Number },

    // Verification fields (merged from Verification model)
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    admin_id: { type: Schema.Types.ObjectId, ref: "Admin" },
    admin_remarks: { type: String },
    application_no: { type: String, unique: true, sparse: true },

    // Date tracking
    registration_date: { type: Date },
    application_submission_date: { type: Date },
  },
  { timestamps: true },
);

const Registration = model("Registration", RegistrationSchema);

export default Registration;
