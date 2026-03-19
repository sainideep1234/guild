import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import image from "../assets/bsglogo.png";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { userApi, session } from "../api/api";
import Swal from "sweetalert2";
import { FiEye, FiEyeOff } from "react-icons/fi";

const SECTIONS = ["Scout", "Guide", "Rover", "Ranger"];

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    name: "",
    otp: "",
    mobile_no: "",
    password: "",
    confirmPassword: "",
    section: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Resend OTP countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const set = (key) => (e) => {
    let value = e.target.value;
    // Mobile: only allow digits, max 10
    if (key === "mobile_no") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ── Send OTP ──
  const sendOtpMutation = useMutation({
    mutationFn: () => userApi.sendOtp(form.email),
    onSuccess: () => {
      setStep(2);
      setResendTimer(300);
      Swal.fire({
        icon: "success",
        title: "OTP Sent!",
        html: `We've sent a 6-digit OTP to <strong>${form.email}</strong>. Please check your inbox.`,
        confirmButtonColor: "#1D57A5",
        confirmButtonText: "Got it",
      });
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Failed to send OTP",
        text: err.message,
        confirmButtonColor: "#1D57A5",
      });
    },
  });

  // ── Resend OTP ──
  const resendOtpMutation = useMutation({
    mutationFn: () => userApi.resendOtp(form.email),
    onSuccess: () => {
      setResendTimer(300);
      Swal.fire({
        icon: "success",
        title: "OTP Resent!",
        text: "A new OTP has been sent to your email.",
        confirmButtonColor: "#1D57A5",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.message,
        confirmButtonColor: "#1D57A5",
      });
    },
  });

  // ── Verify OTP ──
  const verifyOtpMutation = useMutation({
    mutationFn: () => userApi.verifyOtp(form.email, form.otp),
    onSuccess: () => {
      setStep(3);
      Swal.fire({
        icon: "success",
        title: "Email Verified!",
        text: "Now complete your registration details.",
        confirmButtonColor: "#1D57A5",
        timer: 2000,
        showConfirmButton: false,
      });
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "OTP Error",
        text: err.message,
        confirmButtonColor: "#1D57A5",
      });
    },
  });

  // ── Signup ──
  const signupMutation = useMutation({
    mutationFn: () =>
      userApi.signup({
        email: form.email,
        name: form.name,
        password: form.password,
        mobile_no: form.mobile_no,
        section: form.section,
      }),
    onSuccess: (data) => {
      session.setUser(data.token, data.user);
      Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        text: "Your account has been created. Please fill your application form now.",
        confirmButtonColor: "#1D57A5",
        confirmButtonText: "Fill Application Form",
      }).then(() => navigate("/form"));
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: err.message,
        confirmButtonColor: "#1D57A5",
      });
    },
  });

  const validateStep3 = () => {
    const errs = {};
    if (!form.mobile_no || form.mobile_no.length !== 10)
      errs.mobile_no = "Mobile number must be exactly 10 digits";
    if (!form.section) errs.section = "Please select a section";
    if (!form.password || form.password.length < 6)
      errs.password = "Min 6 characters";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (validateStep3()) signupMutation.mutate();
  };

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#1D57A5] focus:ring-2 focus:ring-[#1D57A5]/20 transition-all";
  const errCls = "text-xs text-red-500 mt-0.5";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-200">
      <div className="pt-2">
        <Navbar title={"Register"} />
      </div>
      <div className="flex flex-1 items-center justify-center overflow-auto p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-2xl sm:px-8 sm:py-6">
          <img src={image} alt="Guild-logo" className="mx-auto mb-3 w-14" />
          <h2 className="mb-1 text-center text-base font-bold text-[#1D57A5] sm:text-lg">
            Create Account
          </h2>

          {/* Step indicator */}
          <div className="mb-5 flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-1">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${step >= s ? "bg-[#1D57A5] text-white" : "bg-gray-200 text-gray-500"}`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`h-0.5 w-8 transition-all ${step > s ? "bg-[#1D57A5]" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* STEP 1: Email + Send OTP */}
          {step >= 1 && (
            <div className="mb-3">
              <label className="mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Section
              </label>
              <select
                value={form.section}
                onChange={set("section")}
                disabled={step > 1}
                className={
                  inputCls + (step > 1 ? " cursor-not-allowed bg-gray-100" : "")
                }
              >
                <option value="">Please select a section</option>
                {SECTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <div className="mt-3">
                <label className="mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={set("name")}
                  disabled={step > 1}
                  className={
                    inputCls + (step > 1 ? " cursor-not-allowed bg-gray-100" : "")
                  }
                />
              </div>
              <div className="mt-3">
                <label className="mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="yourname@example.com"
                    value={form.email}
                    onChange={set("email")}
                    disabled={step > 1}
                    className={
                      inputCls +
                      " flex-1" +
                      (step > 1 ? " cursor-not-allowed bg-gray-100" : "")
                    }
                  />
                  {step === 1 && (
                    <button
                      onClick={() => {
                        if (!form.name) {
                          setErrors({ name: "Name required" });
                          return;
                        }
                        if (!form.email) {
                          setErrors({ email: "Email required" });
                          return;
                        }
                        if (!form.section) {
                          setErrors({ section: "Select section first" });
                          return;
                        }
                        sendOtpMutation.mutate();
                      }}
                      disabled={sendOtpMutation.isPending}
                      className="rounded-lg bg-[#1D57A5] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#163f7a] disabled:opacity-60"
                    >
                      {sendOtpMutation.isPending ? "Sending..." : "Send OTP"}
                    </button>
                  )}
                </div>
                {errors.email && <p className={errCls}>{errors.email}</p>}
                {errors.section && <p className={errCls}>{errors.section}</p>}
              </div>
            </div>
          )}

          {/* STEP 2: OTP Verify */}
          {step >= 2 && (
            <div className="mb-3">
              <label className="mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Enter OTP
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="6-digit OTP"
                  maxLength={6}
                  value={form.otp}
                  onChange={set("otp")}
                  disabled={step > 2}
                  className={
                    inputCls +
                    " flex-1 text-center tracking-[0.3em]" +
                    (step > 2 ? " cursor-not-allowed bg-gray-100" : "")
                  }
                />
                {step === 2 && (
                  <button
                    onClick={() => verifyOtpMutation.mutate()}
                    disabled={verifyOtpMutation.isPending}
                    className="rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-60"
                  >
                    {verifyOtpMutation.isPending ? "Verifying..." : "Verify"}
                  </button>
                )}
              </div>
              {/* Resend OTP button */}
              {step === 2 && (
                <div className="mt-2 flex items-center justify-between">
                  <button
                    onClick={() => resendOtpMutation.mutate()}
                    disabled={resendTimer > 0 || resendOtpMutation.isPending}
                    className={`text-xs font-semibold transition-all ${
                      resendTimer > 0
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-[#1D57A5] hover:underline"
                    }`}
                  >
                    {resendOtpMutation.isPending
                      ? "Sending..."
                      : resendTimer > 0
                        ? `Resend OTP in ${formatTimer(resendTimer)}`
                        : "Resend OTP"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Password + Mobile */}
          {step >= 3 && (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Mobile No
                </label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={form.mobile_no}
                  onChange={set("mobile_no")}
                  maxLength={10}
                  className={inputCls}
                />
                {errors.mobile_no && (
                  <p className={errCls}>{errors.mobile_no}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={set("password")}
                    className={inputCls + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1D57A5] transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.password && <p className={errCls}>{errors.password}</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={set("confirmPassword")}
                    className={inputCls + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1D57A5] transition-colors"
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className={errCls}>{errors.confirmPassword}</p>
                )}
              </div>
              <button
                onClick={handleSubmit}
                disabled={signupMutation.isPending}
                className="w-full rounded-lg bg-[#1D57A5] py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#163f7a] active:scale-95 disabled:opacity-60"
              >
                {signupMutation.isPending
                  ? "Creating Account..."
                  : "Create Account"}
              </button>
            </div>
          )}

          <p className="mt-4 text-center text-xs text-gray-500">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-semibold text-[#1D57A5] hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
