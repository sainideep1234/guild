import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import image from "../assets/bsglogo.png";
import { useMutation } from "@tanstack/react-query";
import { userApi, adminApi } from "../api/api";
import Swal from "sweetalert2";
import { FiEye, FiEyeOff } from "react-icons/fi";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");
  const role = params.get("role"); // "admin" or undefined (user)
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const resetMutation = useMutation({
    mutationFn: () =>
      role === "admin"
        ? adminApi.resetPassword(token, password)
        : userApi.resetPassword(token, password),
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Password Reset!",
        text: "Your password has been reset successfully. Please login.",
        confirmButtonColor: "#1D57A5",
      }).then(() => navigate("/login"));
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

  const handleSubmit = () => {
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    resetMutation.mutate();
  };

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#1D57A5] focus:ring-2 focus:ring-[#1D57A5]/20 transition-all";

  return (
    <div className="flex min-h-screen flex-col bg-gray-200">
      <div className="pt-2">
        <Navbar title={"Reset Password"} />
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-2xl sm:px-8 sm:py-6">
          <img src={image} alt="Guild-logo" className="mx-auto mb-3 w-14" />
          <h2 className="mb-3 text-center text-base font-bold text-[#1D57A5] sm:mb-4 sm:text-lg">
            Set New Password
          </h2>
          {!token ? (
            <p className="text-center text-sm text-red-500">
              Invalid or missing reset token. Please request a fresh reset link.
            </p>
          ) : (
            <>
              <div className="mb-3">
                <label className="mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>
              <div className="mb-3">
                <label className="mb-1 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={inputCls + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1D57A5] transition-colors"
                  >
                    {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
              {error && <p className="mb-3 text-xs text-red-500">{error}</p>}
              <button
                onClick={handleSubmit}
                disabled={resetMutation.isPending}
                className="w-full rounded-lg bg-[#1D57A5] py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#163f7a] disabled:opacity-60"
              >
                {resetMutation.isPending ? "Resetting..." : "Reset Password"}
              </button>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword;
