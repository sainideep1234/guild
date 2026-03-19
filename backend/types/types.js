import { z } from "zod";

// ── Admin Auth ──────────────────────────────────────────────────────────────

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const adminOtpVerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

// ── User Auth ───────────────────────────────────────────────────────────────

export const userSignUpSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
  mobile_no: z.string().min(10).max(15),
  section: z.enum(["Scout", "Guide", "Rover", "Ranger"]),
});

export const userSignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const userSendOtpSchema = z.object({
  email: z.string().email(),
});

export const userVerifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

// ── Password Reset ──────────────────────────────────────────────────────────

export const forgotPasswordRequestSchema = z.object({
  email: z.string().email(),
});

export const forgotPasswordResetSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6),
});

// ── Form Submission ─────────────────────────────────────────────────────────

export const formSubmitSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  mobile: z.string().min(10),
  revenueState: z.string().min(1),
  revenueDistrict: z.string().min(1),
  pinCode: z.string().length(6),
  bsgState: z.string().min(1),
  bsgDistrict: z.string().min(1),
  address: z.string().min(5),
  dob: z.string().min(1),
  qualification: z.string().min(1),
  professionalQualification: z.string().min(1),
  aadhaar: z.string().min(12),
  tshirtSize: z.string().min(1),
  section: z.string().min(1),
  awardYear: z.string().min(4),
  certificateNo: z.string().min(1),
  souvenir: z.string().min(1),
});

// ── Admin Review ────────────────────────────────────────────────────────────

export const adminApproveFormSchema = z.object({
  userId: z.string().min(1),
});

export const adminRejectFormSchema = z.object({
  userId: z.string().min(1),
  reason: z.string().min(5, "Please provide a reason (min 5 characters)"),
});

// ── Admin Filter ────────────────────────────────────────────────────────────

export const adminFilterSchema = z.object({
  state: z.string().optional(),
  district: z.string().optional(),
  section: z.string().optional(),
  year: z.string().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});
