const BASE_URL = "http://localhost:3000/api";

// ── Generic fetch wrapper ────────────────────────────────────────────────────
async function apiRequest(endpoint, options = {}) {
  const token = sessionStorage.getItem("token");
  const headers = {
    ...(options.body && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    body:
      options.body instanceof FormData
        ? options.body
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// ── User Auth APIs ────────────────────────────────────────────────────────────
export const userApi = {
  sendOtp: (email) =>
    apiRequest("/user/send-otp", { method: "POST", body: { email } }),

  resendOtp: (email) =>
    apiRequest("/user/resend-otp", { method: "POST", body: { email } }),

  verifyOtp: (email, otp) =>
    apiRequest("/user/verify-otp", { method: "POST", body: { email, otp } }),

  signup: (payload) =>
    apiRequest("/user/signup", { method: "POST", body: payload }),

  signin: (payload) =>
    apiRequest("/user/signin", { method: "POST", body: payload }),

  signinVerifyOtp: (email, otp) =>
    apiRequest("/user/signin-verify-otp", {
      method: "POST",
      body: { email, otp },
    }),

  forgotPassword: (email) =>
    apiRequest("/user/forgot-password", { method: "POST", body: { email } }),

  resetPassword: (token, newPassword) =>
    apiRequest("/user/reset-password", {
      method: "POST",
      body: { token, newPassword },
    }),

  getMe: () => apiRequest("/user/me"),

  getFormStatus: () => apiRequest("/user/form-status"),

  submitForm: (formData) =>
    apiRequest("/user/submit-form", { method: "POST", body: formData }),

  verifyBsgUid: (uid) =>
    apiRequest("/user/verify-bsg-uid", { method: "POST", body: { uid } }),
};

// ── Admin Auth APIs ───────────────────────────────────────────────────────────
export const adminApi = {
  login: (payload) =>
    apiRequest("/admin/login", { method: "POST", body: payload }),

  resendOtp: (email) =>
    apiRequest("/admin/resend-otp", { method: "POST", body: { email } }),

  verifyOtp: (email, otp) =>
    apiRequest("/admin/verify-otp", { method: "POST", body: { email, otp } }),

  forgotPassword: (email) =>
    apiRequest("/admin/forgot-password", { method: "POST", body: { email } }),

  resetPassword: (token, newPassword) =>
    apiRequest("/admin/reset-password", {
      method: "POST",
      body: { token, newPassword },
    }),

  getSubmissions: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    const qs = params.toString();
    return apiRequest(`/admin/submissions${qs ? "?" + qs : ""}`);
  },

  getSubmission: (userId) => apiRequest(`/admin/submission/${userId}`),

  approveUser: (userId) =>
    apiRequest(`/admin/approve/${userId}`, { method: "POST" }),

  rejectUser: (userId, reason) =>
    apiRequest(`/admin/reject/${userId}`, { method: "POST", body: { reason } }),

  getStats: () => apiRequest("/admin/stats"),
  getMe: () => apiRequest("/admin/me"),
};

// ── Session helpers ───────────────────────────────────────────────────────────
export const session = {
  setUser(token, user) {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(user));
  },
  getUser() {
    const u = sessionStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  },
  getToken() {
    return sessionStorage.getItem("token");
  },
  clear() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  },
  isLoggedIn() {
    return !!sessionStorage.getItem("token");
  },
};

export const getUploadUrl = (filename) =>
  filename ? `http://localhost:3000/uploads/${filename}` : null;
