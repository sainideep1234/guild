import { Router } from "express";

import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import "dotenv/config";

import {
  userSignUpSchema,
  userSignInSchema,
  userSendOtpSchema,
  userVerifyOtpSchema,
  forgotPasswordRequestSchema,
  forgotPasswordResetSchema,
  formSubmitSchema,
} from "../types/types.js";

import Registration from "../models/user.js";
import UserDetail from "../models/userDetail.js";
import { generateOtp } from "../utils/otp.js";
import {
  sendOtpEmail,
  sendPasswordResetEmail,
  sendRegistrationEmail,
  sendFormSubmissionEmail,
} from "../config/mail.js";
import { userMiddleware } from "../middleware/user.js";
import upload, { validateFileSizes } from "../config/multer.js";

const userRouter = Router();

// ── Helper: sign JWT ─────────────────────────────────────────────────────────
function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

// ── POST /api/user/send-otp  (registration: verify email before sign-up) ────
userRouter.post("/send-otp", async (req, res) => {
  try {
    const { success, data } = userSendOtpSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).json({ message: "Please provide a valid email" });
    }

    const { email } = data;

    // Check email not already registered
    const existing = await Registration.findOne({ email });
    if (existing && existing.otp_verified) {
      return res
        .status(409)
        .json({ message: "Email is already registered. Please login." });
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    // Upsert a temporary record
    await Registration.findOneAndUpdate(
      { email },
      { otp, otp_expiresAt: expiresAt, otp_verified: false },
      { upsert: true, new: true },
    );

    const sent = await sendOtpEmail(email, otp);
    if (!sent) {
      console.log(`⚠️  [DEV] OTP for ${email}: ${otp} (email delivery failed)`);
    }

    return res
      .status(200)
      .json({ message: "OTP sent to your email address", email });
  } catch (error) {
    console.log("[ERROR user/send-otp]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ── POST /api/user/resend-otp ────────────────────────────────────────────────
userRouter.post("/resend-otp", async (req, res) => {
  try {
    const { success, data } = userSendOtpSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).json({ message: "Please provide a valid email" });
    }

    const { email } = data;
    const user = await Registration.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found. Please request OTP first." });
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    user.otp = otp;
    user.otp_expiresAt = expiresAt;
    await user.save();

    const sent = await sendOtpEmail(email, otp, user.name);
    if (!sent) {
      console.log(`⚠️  [DEV] OTP for ${email}: ${otp} (email delivery failed)`);
    }

    return res.status(200).json({ message: "OTP resent to your email address", email });
  } catch (error) {
    console.log("[ERROR user/resend-otp]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ── POST /api/user/verify-otp ────────────────────────────────────────────────
userRouter.post("/verify-otp", async (req, res) => {
  try {
    const { success, data } = userVerifyOtpSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).json({ message: "Please provide email and OTP" });
    }

    const { email, otp } = data;
    const user = await Registration.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Please request OTP first." });
    }

    if (user.otp !== otp) {
      return res
        .status(400)
        .json({ message: "Invalid OTP. Please try again." });
    }

    if (user.otp_expiresAt < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    user.otp_verified = true;
    user.otp = null;
    user.otp_expiresAt = null;
    await user.save();

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.log("[ERROR user/verify-otp]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ── POST /api/user/signup ────────────────────────────────────────────────────
userRouter.post("/signup", async (req, res) => {
  try {
    const { success, data, error } = userSignUpSchema.safeParse(req.body);
    if (!success) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: error.flatten() });
    }

    const { email, name, password, mobile_no, section } = data;

    const existingUser = await Registration.findOne({ email });
    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "Please verify your email first by sending an OTP." });
    }

    if (!existingUser.otp_verified) {
      return res
        .status(400)
        .json({ message: "Email not verified. Please verify your OTP first." });
    }

    existingUser.name = name;
    existingUser.password = password;
    existingUser.mobile_no = mobile_no;
    existingUser.section = section;
    existingUser.role = "user";
    existingUser.registration_date = new Date();
    await existingUser.save();

    // Send registration confirmation email
    sendRegistrationEmail(email, password).catch(() => {});

    const token = signToken(existingUser);

    return res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: existingUser._id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role,
        mobile_no: existingUser.mobile_no,
        section: existingUser.section,
      },
    });
  } catch (error) {
    console.log("[ERROR user/signup]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ── POST /api/user/signin ────────────────────────────────────────────────────
userRouter.post("/signin", async (req, res) => {
  try {
    const { success, data } = userSignInSchema.safeParse(req.body);
    if (!success) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const { email, password } = data;
    const user = await Registration.findOne({ email });

    if (!user || !user.password) {
      return res
        .status(404)
        .json({ message: "No account found with this email." });
    }

    const isMatch = password === user.password;
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    // Send OTP for login verification
    const otp = generateOtp();
    user.otp = otp;
    user.otp_expiresAt = Date.now() + 5 * 60 * 1000;
    user.otp_verified = false;
    await user.save();

    const sent = await sendOtpEmail(email, otp, user.name);
    if (!sent) {
      console.log(`⚠️  [DEV] OTP for ${email}: ${otp} (email delivery failed)`);
    }

    return res.status(200).json({
      message: "OTP sent to your email for verification.",
      email,
      requiresOtp: true,
    });
  } catch (error) {
    console.log("[ERROR user/signin]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ── POST /api/user/signin-verify-otp ─────────────────────────────────────────
userRouter.post("/signin-verify-otp", async (req, res) => {
  try {
    const { success, data } = userVerifyOtpSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).json({ message: "Please provide email and OTP" });
    }

    const { email, otp } = data;
    const user = await Registration.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    if (user.otp_expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP has expired. Request a new one." });
    }

    user.otp_verified = true;
    user.otp = null;
    user.otp_expiresAt = null;
    await user.save();

    const isRegistered = user.mobile_no && user.password;
    const detail = await UserDetail.findOne({ account: user._id });
    const hasFilledForm = !!detail;

    const token = signToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        mobile_no: user.mobile_no,
        section: user.section,
        isRegistered: !!isRegistered,
        hasFilledForm,
      },
    });
  } catch (error) {
    console.log("[ERROR user/signin-verify-otp]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ── POST /api/user/forgot-password ──────────────────────────────────────────
userRouter.post("/forgot-password", async (req, res) => {
  try {
    const { success, data } = forgotPasswordRequestSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).json({ message: "Please provide a valid email" });
    }

    const { email } = data;
    const user = await Registration.findOne({ email });

    if (!user) {
      return res
        .status(200)
        .json({ message: "If this email exists, a reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.reset_token = hashedToken;
    user.reset_token_expiresAt = Date.now() + 30 * 60 * 1000;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    await sendPasswordResetEmail(email, resetLink);

    return res
      .status(200)
      .json({ message: "If this email exists, a reset link has been sent." });
  } catch (error) {
    console.log("[ERROR user/forgot-password]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ── POST /api/user/reset-password ───────────────────────────────────────────
userRouter.post("/reset-password", async (req, res) => {
  try {
    const { success, data } = forgotPasswordResetSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const { token, newPassword } = data;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await Registration.findOne({
      reset_token: hashedToken,
      reset_token_expiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Reset link is invalid or has expired." });
    }

    user.password = newPassword;
    user.reset_token = null;
    user.reset_token_expiresAt = null;
    await user.save();

    return res
      .status(200)
      .json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.log("[ERROR user/reset-password]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ── GET /api/user/me ─────────────────────────────────────────────────────────
userRouter.get("/me", userMiddleware, async (req, res) => {
  try {
    const user = await Registration.findById(req.user.id).select(
      "-password -otp -reset_token",
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const detail = await UserDetail.findOne({ account: req.user.id });

    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        mobile_no: user.mobile_no,
        section: user.section,
        bsg_uid: detail?.bsg_uid || null,
      },
      detail: detail || null,
      verification: {
        status: user.status || "NOT_SUBMITTED",
        application_no: user.application_no || null,
        admin_remarks: user.admin_remarks || null,
      },
    });
  } catch (error) {
    console.log("[ERROR user/me]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ── POST /api/user/verify-bsg-uid ────────────────────────────────────────────
userRouter.post("/verify-bsg-uid", userMiddleware, async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid || typeof uid !== "string" || uid.trim().length === 0) {
      return res.status(400).json({ message: "Please provide a valid BSG UID" });
    }

    const trimmedUid = uid.trim();

    // Check if UID is already used by another user
    const existingDetail = await UserDetail.findOne({
      bsg_uid: trimmedUid,
      account: { $ne: req.user.id },
    });
    if (existingDetail) {
      return res.status(409).json({
        message: "This BSG UID is already linked to another account.",
      });
    }

    // Call the external BYOMS API to verify the UID
    const apiResponse = await fetch(
      "https://bw-districtuid.bsgindia.tech/get-leveluseruid",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "aba92403-4435-46ce-bb47-9b04941134b3",
        },
        body: JSON.stringify({ UID: trimmedUid }),
      },
    );

    const apiData = await apiResponse.json();

    if (!apiResponse.ok || !apiData) {
      return res.status(400).json({
        message: "BSG UID verification failed. Please check your UID and try again.",
      });
    }

    // Save the verified UID to UserDetail
    const detail = await UserDetail.findOne({ account: req.user.id });
    if (!detail) {
      // If no detail record yet, create a minimal one with the UID
      const regUser = await Registration.findById(req.user.id);
      await UserDetail.create({
        account: req.user.id,
        name: regUser?.name || "User",
        bsg_uid: trimmedUid,
      });
    } else {
      detail.bsg_uid = trimmedUid;
      await detail.save();
    }

    return res.status(200).json({
      message: "BSG UID verified and linked successfully!",
      bsg_uid: trimmedUid,
      byoms_data: apiData,
    });
  } catch (error) {
    console.log("[ERROR user/verify-bsg-uid]", error);
    return res.status(500).json({ message: "Verification service unavailable. Please try again later." });
  }
});

// ── POST /api/user/submit-form ───────────────────────────────────────────────
userRouter.post(
  "/submit-form",
  userMiddleware,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "aadhaarFile", maxCount: 1 },
    { name: "certFile", maxCount: 1 },
  ]),
  validateFileSizes,
  async (req, res) => {
    try {
      const regUser = await Registration.findById(req.user.id);
      if (!regUser) {
        return res.status(404).json({ message: "User not found." });
      }

      // Check if already approved — cannot re-submit
      if (regUser.status === "APPROVED") {
        return res.status(403).json({
          message: "Your form has already been approved. You cannot edit it.",
        });
      }

      const { success, data, error } = formSubmitSchema.safeParse(req.body);
      if (!success) {
        return res
          .status(400)
          .json({ message: "Validation failed", errors: error.flatten() });
      }

      const files = req.files || {};
      const photoPath = files.photo?.[0]?.filename;
      const aadhaarPath = files.aadhaarFile?.[0]?.filename;
      const certPath = files.certFile?.[0]?.filename;

      // Upsert UserDetail (now includes document paths)
      const detailData = {
        account: req.user.id,
        name: data.fullName,
        email: data.email,
        mobile_no: data.mobile,
        dob: data.dob,
        address: {
          pincode: data.pinCode,
          revenue_state: data.revenueState,
          revenue_district: data.revenueDistrict,
          house_no: data.address,
        },
        bsg_state: data.bsgState,
        bsg_district: data.bsgDistrict,
        highest_qualification: data.qualification,
        professional_qualification: data.professionalQualification,
        tshirt_size: data.tshirtSize,
        section: data.section,
        year_of_rastrapati: data.awardYear,
        certificate_no: data.certificateNo,
        souvenir: data.souvenir,
        aadhaar_no: data.aadhaar,
        ...(photoPath && { photo_path: photoPath }),
        ...(aadhaarPath && { adhar_doc_path: aadhaarPath }),
        ...(certPath && { rashtrapati_certificate_path: certPath }),
      };

      await UserDetail.findOneAndUpdate({ account: req.user.id }, detailData, {
        upsert: true,
        new: true,
      });

      // Update registration status
      if (regUser.status === "REJECTED") {
        regUser.status = "PENDING";
        regUser.admin_remarks = null;
      }
      regUser.application_submission_date = new Date();
      await regUser.save();

      // Send form submission confirmation email
      sendFormSubmissionEmail(regUser.email, data.fullName).catch(() => {});

      return res.status(200).json({ message: "Form submitted successfully" });
    } catch (error) {
      console.log("[ERROR user/submit-form]", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
);

// ── GET /api/user/form-status ────────────────────────────────────────────────
userRouter.get("/form-status", userMiddleware, async (req, res) => {
  try {
    const user = await Registration.findById(req.user.id);
    if (!user) {
      return res.status(200).json({ status: "NOT_SUBMITTED" });
    }

    return res.status(200).json({
      status: user.status || "NOT_SUBMITTED",
      application_no: user.application_no || null,
      admin_remarks: user.admin_remarks || null,
    });
  } catch (error) {
    console.log("[ERROR user/form-status]", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default userRouter;
