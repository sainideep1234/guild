import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import image from "../assets/bsglogo.png";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { userApi, adminApi, session } from "../api/api";
import Swal from "sweetalert2";
import { FiEye, FiEyeOff } from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [step, setStep] = useState(1); // 1 = credentials, 2 = OTP
  const [form, setForm] = useState({ email: "", password: "", otp: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (session.isLoggedIn()) {
      const user = session.getUser();
      if (user?.role === "admin" || user?.role === "superadmin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    }
  }, [navigate]);

  // Resend OTP timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  // User login — now sends OTP
  const signinMutation = useMutation({
    mutationFn: () =>
      userApi.signin({ email: form.email, password: form.password }),
    onSuccess: (data) => {
      Swal.fire({
        icon: "info",
        title: "OTP Sent",
        text: data.message,
        confirmButtonColor: "#1D57A5",
        timer: 2000,
        showConfirmButton: false,
      });
      setStep(2);
      setResendTimer(300);
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: err.message,
        confirmButtonColor: "#1D57A5",
      });
    },
  });

  // User OTP verification after login
  const userVerifyMutation = useMutation({
    mutationFn: () => userApi.signinVerifyOtp(form.email, form.otp),
    onSuccess: (data) => {
      session.setUser(data.token, data.user);
      if (data.user.hasFilledForm) {
        navigate("/user-dashboard");
      } else {
        navigate("/form");
      }
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "OTP Failed",
        text: err.message,
        confirmButtonColor: "#1D57A5",
      });
    },
  });

  // Admin Login Step 1
  const adminLoginMutation = useMutation({
    mutationFn: () =>
      adminApi.login({ email: form.email, password: form.password }),
    onSuccess: (data) => {
      Swal.fire({
        icon: "info",
        title: "OTP Sent",
        text: data.message,
        confirmButtonColor: "#1D57A5",
        timer: 2000,
        showConfirmButton: false,
      });
      setStep(2);
      setResendTimer(300);
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: err.message,
        confirmButtonColor: "#1D57A5",
      });
    },
  });

  // Admin Login Step 2 (OTP)
  const adminVerifyMutation = useMutation({
    mutationFn: () => adminApi.verifyOtp(form.email, form.otp),
    onSuccess: (data) => {
      session.setUser(data.token, data.admin);
      navigate("/admin-dashboard");
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "OTP Failed",
        text: err.message,
        confirmButtonColor: "#1D57A5",
      });
    },
  });

  // Resend OTP
  const resendOtpMutation = useMutation({
    mutationFn: () =>
      role === "admin"
        ? adminApi.resendOtp(form.email)
        : userApi.resendOtp(form.email),
    onSuccess: () => {
      setResendTimer(300);
      Swal.fire({
        icon: "success",
        title: "OTP Resent",
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

  const forgotMutation = useMutation({
    mutationFn: () =>
      role === "admin"
        ? adminApi.forgotPassword(forgotEmail)
        : userApi.forgotPassword(forgotEmail),
    onSuccess: () => {
      setShowForgot(false);
      Swal.fire({
        icon: "info",
        title: "Check your email",
        text: "If this email is registered, a password reset link has been sent.",
        confirmButtonColor: "#1D57A5",
      });
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
        confirmButtonColor: "#1D57A5",
      });
    },
  });

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email is required";
    if (!form.password) errs.password = "Password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = () => {
    if (step === 1) {
      if (validate()) {
        if (role === "admin") adminLoginMutation.mutate();
        else signinMutation.mutate();
      }
    } else if (step === 2) {
      if (!form.otp) setErrors({ otp: "OTP is required" });
      else {
        if (role === "admin") adminVerifyMutation.mutate();
        else userVerifyMutation.mutate();
      }
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#1D57A5] focus:ring-2 focus:ring-[#1D57A5]/20 transition-all";
  const errCls = "text-xs text-red-500 mt-0.5";

  return (
    <div className="flex min-h-screen flex-col bg-gray-200">
      <div className="pt-2">
        <Navbar title={"Login"} />
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-2xl sm:px-8 sm:py-6">
          <img src={image} alt="Guild-logo" className="mx-auto mb-3 w-14" />
          <h2 className="mb-3 text-center text-base font-bold text-[#1D57A5] sm:mb-4 sm:text-lg">
            Welcome Back
          </h2>

          {/* Role Toggle */}
          {step === 1 && (
            <div className="mb-5 flex rounded-lg bg-gray-100 p-1">
              <button
                className={`flex-1 rounded-md py-1.5 text-sm font-semibold transition-all ${
                  role === "user"
                    ? "bg-white text-[#1D57A5] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => {
                  setRole("user");
                  setErrors({});
                }}
              >
                User
              </button>
              <button
                className={`flex-1 rounded-md py-1.5 text-sm font-semibold transition-all ${
                  role === "admin"
                    ? "bg-white text-[#1D57A5] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => {
                  setRole("admin");
                  setErrors({});
                }}
              >
                Admin
              </button>
            </div>
          )}

          {step === 1 ? (
            <>
              {/* Email */}
              <div className="mb-3">
                <label className="mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="yourname@example.com"
                  value={form.email}
                  onChange={set("email")}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className={inputCls}
                />
                {errors.email && <p className={errCls}>{errors.email}</p>}
              </div>

              {/* Password with toggle */}
              <div className="mb-1">
                <label className="mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={set("password")}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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
                {errors.password && (
                  <p className={errCls}>{errors.password}</p>
                )}
              </div>

              {/* Forgot password */}
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => setShowForgot(true)}
                  className="text-xs font-semibold text-[#1D57A5] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </>
          ) : (
            // OTP Step
            <div className="mb-4">
              <label className="mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Enter OTP
              </label>
              <input
                type="text"
                placeholder="6-digit OTP"
                maxLength={6}
                value={form.otp}
                onChange={set("otp")}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className={`${inputCls} text-center tracking-[0.3em]`}
              />
              {errors.otp && <p className={errCls}>{errors.otp}</p>}

              {/* Resend OTP */}
              <div className="mt-3 flex items-center justify-between">
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
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={
              signinMutation.isPending ||
              adminLoginMutation.isPending ||
              adminVerifyMutation.isPending ||
              userVerifyMutation.isPending
            }
            className="w-full rounded-lg bg-[#1D57A5] py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#163f7a] active:scale-95 disabled:opacity-60"
          >
            {signinMutation.isPending ||
            adminLoginMutation.isPending ||
            adminVerifyMutation.isPending ||
            userVerifyMutation.isPending
              ? "Processing..."
              : step === 1
                ? "Login"
                : "Verify OTP"}
          </button>

          {step === 2 && (
            <button
              onClick={() => {
                setStep(1);
                setForm((p) => ({ ...p, otp: "" }));
                setResendTimer(0);
              }}
              className="mt-3 w-full text-center text-sm font-semibold text-gray-500 hover:text-gray-700"
            >
              Back to Login
            </button>
          )}

          <p className="mt-4 text-center text-xs text-gray-500">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="font-semibold text-[#1D57A5] hover:underline"
            >
              Register
            </button>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-2 text-lg font-bold text-[#1D57A5]">
              Reset Password
            </h3>
            <p className="mb-4 text-xs text-gray-500">
              Enter your registered email address and we'll send you a reset
              link.
            </p>
            <input
              type="email"
              placeholder="yourname@example.com"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className={inputCls + " mb-4"}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowForgot(false)}
                className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => forgotMutation.mutate()}
                disabled={forgotMutation.isPending || !forgotEmail}
                className="flex-1 rounded-lg bg-[#1D57A5] py-2 text-sm font-bold text-white transition hover:bg-[#163f7a] disabled:opacity-60"
              >
                {forgotMutation.isPending ? "Sending..." : "Send Link"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Login;
