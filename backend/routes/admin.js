import { Router } from "express";

import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import "dotenv/config";

import {
  adminLoginSchema,
  adminOtpVerifySchema,
  adminApproveFormSchema,
  adminRejectFormSchema,
  adminFilterSchema,
  forgotPasswordRequestSchema,
  forgotPasswordResetSchema,
} from "../types/types.js";

import Admin from "../models/admin.js";
import Registration from "../models/user.js";
import UserDetail from "../models/userDetail.js";
import { generateOtp } from "../utils/otp.js";
import { sendOtpEmail, sendPasswordResetEmail } from "../config/mail.js";
import { adminMiddleware } from "../middleware/user.js";

const adminRouter = Router();

// ── Helper: sign JWT ─────────────────────────────────────────────────────────
function signAdminToken(admin) {
  return jwt.sign(
    { id: admin._id, role: admin.role, email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

// ── Helper: generate application number ─────────────────────────────────────
async function generateApplicationNo() {
  const currentYear = new Date().getFullYear();
  const prefix = `BSG/${currentYear}/`;

  const lastReg = await Registration.findOne({
    application_no: new RegExp(`^${prefix}`),
  }).sort({ application_no: -1 });

  let counter = 1;
  if (lastReg && lastReg.application_no) {
    const parts = lastReg.application_no.split("/");
    if (parts.length === 3) {
      const lastCounter = parseInt(parts[2], 10);
      if (!isNaN(lastCounter)) {
        counter = lastCounter + 1;
      }
    }
  }

  return `${prefix}${counter.toString().padStart(2, "0")}`;
}

// ── POST /api/admin/login ────────────────────────────────────────────────────
adminRouter.post("/login", async (req, res) => {
  try {
    const { success, data } = adminLoginSchema.safeParse(req.body);
    if (!success) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const { email, password } = data;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res
        .status(404)
        .json({ message: "No admin account found with this email." });
    }

    const isMatch = password === admin.password;
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    const otp = generateOtp();
    admin.otp = otp;
    admin.otp_expiresAt = Date.now() + 5 * 60 * 1000;
    admin.otp_verified = false;
    await admin.save();

    const sent = await sendOtpEmail(email, otp);
    if (!sent) {
      return res
        .status(500)
        .json({ message: "Failed to send OTP. Please try again." });
    }

    return res
      .status(200)
      .json({ message: "OTP sent to your registered email.", email });
  } catch (error) {
    console.log("[ERROR admin/login]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ── POST /api/admin/resend-otp ───────────────────────────────────────────────
adminRouter.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found." });

    const otp = generateOtp();
    admin.otp = otp;
    admin.otp_expiresAt = Date.now() + 5 * 60 * 1000;
    await admin.save();

    const sent = await sendOtpEmail(email, otp);
    if (!sent) {
      return res.status(500).json({ message: "Failed to resend OTP." });
    }

    return res.status(200).json({ message: "OTP resent to your email.", email });
  } catch (error) {
    console.log("[ERROR admin/resend-otp]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ── POST /api/admin/verify-otp ───────────────────────────────────────────────
adminRouter.post("/verify-otp", async (req, res) => {
  try {
    const { success, data } = adminOtpVerifySchema.safeParse(req.body);
    if (!success) {
      return res.status(400).json({ message: "Please provide email and OTP" });
    }

    const { email, otp } = data;
    const admin = await Admin.findOne({ email });

    if (!admin) return res.status(404).json({ message: "Admin not found." });
    if (admin.otp !== otp) return res.status(400).json({ message: "Invalid OTP." });
    if (admin.otp_expiresAt < Date.now()) return res.status(400).json({ message: "OTP has expired." });

    admin.otp_verified = true;
    admin.otp = null;
    admin.otp_expiresAt = null;
    await admin.save();

    const token = signAdminToken(admin);

    return res.status(200).json({
      message: "Login successful",
      token,
      admin: { id: admin._id, email: admin.email, role: admin.role },
    });
  } catch (error) {
    console.log("[ERROR admin/verify-otp]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ── POST /api/admin/forgot-password ──────────────────────────────────────────
adminRouter.post("/forgot-password", async (req, res) => {
  try {
    const { success, data } = forgotPasswordRequestSchema.safeParse(req.body);
    if (!success) return res.status(400).json({ message: "Provide a valid email" });

    const { email } = data;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(200).json({ message: "If this email exists, a reset link has been sent." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    admin.reset_token = hashedToken;
    admin.reset_token_expiresAt = Date.now() + 30 * 60 * 1000;
    await admin.save();

    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}&role=admin`;
    await sendPasswordResetEmail(email, resetLink);

    return res.status(200).json({ message: "If this email exists, a reset link has been sent." });
  } catch (error) {
    console.log("[ERROR admin/forgot-password]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ── POST /api/admin/reset-password ───────────────────────────────────────────
adminRouter.post("/reset-password", async (req, res) => {
  try {
    const { success, data } = forgotPasswordResetSchema.safeParse(req.body);
    if (!success) return res.status(400).json({ message: "Invalid request" });

    const { token, newPassword } = data;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const admin = await Admin.findOne({ reset_token: hashedToken, reset_token_expiresAt: { $gt: Date.now() } });
    if (!admin) return res.status(400).json({ message: "Reset link is invalid or has expired." });

    admin.password = newPassword;
    admin.reset_token = null;
    admin.reset_token_expiresAt = null;
    await admin.save();

    return res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.log("[ERROR admin/reset-password]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ── GET /api/admin/submissions ───────────────────────────────────────────────
adminRouter.get("/submissions", adminMiddleware, async (req, res) => {
  try {
    const { state, district, section, year, status } = req.query;

    const detailFilter = {};
    if (state) detailFilter["address.revenue_state"] = state;
    if (district) detailFilter["address.revenue_district"] = district;
    if (section) detailFilter.section = section;
    if (year) detailFilter.year_of_rastrapati = year;

    let matchingUserIds = null;
    if (Object.keys(detailFilter).length > 0) {
      const details = await UserDetail.find(detailFilter).select("account");
      matchingUserIds = details.map((d) => d.account.toString());
    }

    // Build registration filter — only show users with submitted forms
    const regFilter = { application_submission_date: { $ne: null } };
    if (status) regFilter.status = status;
    if (matchingUserIds) regFilter._id = { $in: matchingUserIds };

    const registrations = await Registration.find(regFilter).sort({ createdAt: -1 });

    const enriched = await Promise.all(
      registrations.map(async (reg) => {
        const detail = await UserDetail.findOne({ account: reg._id });
        return {
          _id: reg._id,
          user_id: reg._id,
          status: reg.status,
          application_no: reg.application_no,
          admin_remarks: reg.admin_remarks,
          createdAt: reg.createdAt,
          updatedAt: reg.updatedAt,
          name: detail?.name || "N/A",
          email: detail?.email || reg.email || "N/A",
          mobile: detail?.mobile_no || reg.mobile_no || "N/A",
          section: detail?.section || reg.section || "N/A",
          state: detail?.address?.revenue_state || "N/A",
          district: detail?.address?.revenue_district || "N/A",
          bsg_state: detail?.bsg_state || "N/A",
          bsg_district: detail?.bsg_district || "N/A",
          year: detail?.year_of_rastrapati || "N/A",
          dob: detail?.dob || "N/A",
          certificate_no: detail?.certificate_no || "N/A",
          tshirt_size: detail?.tshirt_size || "N/A",
          souvenir: detail?.souvenir || "N/A",
          highest_qualification: detail?.highest_qualification || "N/A",
          professional_qualification: detail?.professional_qualification || "N/A",
          aadhaar_no: detail?.aadhaar_no || "N/A",
          address: detail?.address?.house_no || "N/A",
          pincode: detail?.address?.pincode || "N/A",
          photo_path: detail?.photo_path || null,
          adhar_doc_path: detail?.adhar_doc_path || null,
          rashtrapati_certificate_path: detail?.rashtrapati_certificate_path || null,
        };
      }),
    );

    // Stats
    const total = await Registration.countDocuments({ application_submission_date: { $ne: null } });
    const pending = await Registration.countDocuments({ application_submission_date: { $ne: null }, status: "PENDING" });
    const approved = await Registration.countDocuments({ application_submission_date: { $ne: null }, status: "APPROVED" });
    const rejected = await Registration.countDocuments({ application_submission_date: { $ne: null }, status: "REJECTED" });

    let availableYears = await UserDetail.distinct("year_of_rastrapati");
    availableYears = availableYears.filter(Boolean).sort((a, b) => parseInt(b) - parseInt(a));

    return res.status(200).json({
      submissions: enriched,
      stats: { total, pending, approved, rejected },
      availableYears,
    });
  } catch (error) {
    console.log("[ERROR admin/submissions]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ── GET /api/admin/submission/:userId ─────────────────────────────────────────
adminRouter.get("/submission/:userId", adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const detail = await UserDetail.findOne({ account: userId });
    const reg = await Registration.findById(userId).select("-password -otp -reset_token");

    if (!detail && !reg) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ detail, user: reg });
  } catch (error) {
    console.log("[ERROR admin/submission]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ── POST /api/admin/approve/:userId ──────────────────────────────────────────
adminRouter.post("/approve/:userId", adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const reg = await Registration.findById(userId);
    if (!reg) return res.status(404).json({ message: "No submission found." });
    if (reg.status === "APPROVED") return res.status(400).json({ message: "Already approved." });

    const appNo = await generateApplicationNo();
    reg.status = "APPROVED";
    reg.admin_id = req.user.id;
    reg.admin_remarks = null;
    reg.application_no = appNo;
    await reg.save();

    return res.status(200).json({ message: "Application approved successfully.", application_no: appNo });
  } catch (error) {
    console.log("[ERROR admin/approve]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ── POST /api/admin/reject/:userId ───────────────────────────────────────────
adminRouter.post("/reject/:userId", adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { success, data } = adminRejectFormSchema.safeParse({
      userId,
      reason: req.body.reason,
    });

    if (!success) {
      return res.status(400).json({ message: "Please provide a rejection reason (min 5 chars)." });
    }

    const reg = await Registration.findById(userId);
    if (!reg) return res.status(404).json({ message: "No submission found." });

    reg.status = "REJECTED";
    reg.admin_id = req.user.id;
    reg.admin_remarks = data.reason;
    reg.application_no = null;
    await reg.save();

    return res.status(200).json({ message: "Application rejected.", reason: data.reason });
  } catch (error) {
    console.log("[ERROR admin/reject]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ── GET /api/admin/stats ─────────────────────────────────────────────────────
adminRouter.get("/stats", adminMiddleware, async (req, res) => {
  try {
    const total = await Registration.countDocuments({ application_submission_date: { $ne: null } });
    const pending = await Registration.countDocuments({ application_submission_date: { $ne: null }, status: "PENDING" });
    const approved = await Registration.countDocuments({ application_submission_date: { $ne: null }, status: "APPROVED" });
    const rejected = await Registration.countDocuments({ application_submission_date: { $ne: null }, status: "REJECTED" });

    return res.status(200).json({ total, pending, approved, rejected });
  } catch (error) {
    console.log("[ERROR admin/stats]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ── GET /api/admin/me ────────────────────────────────────────────────────────
adminRouter.get("/me", adminMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password -otp -reset_token");
    if (!admin) return res.status(404).json({ message: "Admin not found." });

    return res.status(200).json({
      user: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
      detail: {
        bsg_uid: admin.bsg_uid,
      },
    });
  } catch (error) {
    console.log("[ERROR admin/me]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default adminRouter;
