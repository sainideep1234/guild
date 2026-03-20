import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { userApi, session } from "../api/api";
import Swal from "sweetalert2";

import {
  FaUser,
  FaMedal,
  FaClipboardList,
  FaCloudUploadAlt,
  FaCheckCircle,
  FaEye,
  FaPaperPlane,
  FaTimes,
  FaCamera,
} from "react-icons/fa";
import { MdOutlineInfo } from "react-icons/md";

// ── India state / district data ──────────────────────────────────────────
import { INDIA_STATES, getDistricts, BSG_STATES, getBsgDistricts } from "../data/indiaStates";

const TSHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const SECTIONS = ["Scout", "Guide", "Rover", "Ranger"];

// ── Shared style tokens ───────────────────────────────────────────────────
const inputCls =
  "w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none transition-all duration-200 focus:border-[#1D57A5] focus:bg-white focus:ring-2 focus:ring-[#1D57A5]/20 hover:border-gray-400";

const labelCls =
  "mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500";
const errCls = "mt-1 flex items-center gap-1 text-xs text-red-500";

// ── Reusable field wrapper ────────────────────────────────────────────────
const FieldGroup = ({ label, required, children, error }) => (
  <div className="flex flex-col">
    <label className={labelCls}>
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <p className={errCls}>
        <MdOutlineInfo size={13} /> {error}
      </p>
    )}
  </div>
);

// ── Section header card ───────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1D57A5]/10 text-[#1D57A5]">
      <Icon size={20} />
    </div>
    <div>
      <h2 className="text-base font-bold text-[#1D57A5]">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  </div>
);

// ── Upload field — card style ────────────────────────────────────────────
const UploadField = ({ id, label, file, onChange, accept, required }) => (
  <div className="flex flex-col">
    <label className={labelCls}>
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
    <label
      htmlFor={id}
      className={`group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 transition-all duration-200 active:scale-[0.98] ${
        file
          ? "border-green-400 bg-green-50"
          : "border-[#1D57A5]/30 bg-[#1D57A5]/5 hover:border-[#1D57A5] hover:bg-[#1D57A5]/10"
      }`}
    >
      {/* Icon circle */}
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
          file
            ? "bg-green-100 text-green-600"
            : "bg-[#1D57A5]/10 text-[#1D57A5] group-hover:bg-[#1D57A5]/20"
        }`}
      >
        {file ? <FaCheckCircle size={22} /> : <FaCloudUploadAlt size={22} />}
      </div>

      {/* Text */}
      <div className="text-center">
        <p
          className={`text-sm font-bold ${file ? "text-green-700" : "text-[#1D57A5]"}`}
        >
          {file ? "File Selected" : "Click to Upload"}
        </p>
        <p className="mt-0.5 max-w-[180px] truncate text-xs text-gray-400">
          {file ? file.name : "JPG, PNG, PDF · max 2 MB"}
        </p>
      </div>
    </label>
    <input
      id={id}
      type="file"
      accept={accept}
      className="hidden"
      onChange={onChange}
    />
  </div>
);

// ── Preview Card Modal ────────────────────────────────────────────────────
const PreviewCard = ({ data, onClose, onSubmit, isSubmitting }) => {
  const rows = [
    ["Full Name", data.fullName],
    ["Email ID", data.email],
    ["Mobile No", data.mobile],
    ["Revenue State", data.revenueState],
    ["Revenue District", data.revenueDistrict],
    ["Pin Code", data.pinCode],
    ["BSG State", data.bsgState],
    ["BSG District", data.bsgDistrict],
    ["Date of Birth", data.dob],
    ["Correspondence Address", data.address],
    ["Highest Qualification", data.qualification],
    ["Aadhaar No", data.aadhaar],
    ["Professional Qualification", data.professionalQualification],
    ["T-Shirt Size", data.tshirtSize],
    ["Section", data.section],
    ["Year of Rashtrapati Award", data.awardYear],
    ["Certificate No", data.certificateNo],
    ["Souvenir Interest", data.souvenir],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm sm:p-4">
      <div className="relative flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-2xl">
        {/* Sticky header */}
        <div className="flex shrink-0 items-center justify-between bg-[#1D57A5] px-4 py-3 sm:px-6 sm:py-4">
          <h2 className="text-lg font-bold text-white">Application Preview</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/40 active:scale-95"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto p-4 sm:p-6">
          {/* Photo + name */}
          <div className="mb-6 flex flex-col items-center gap-2">
            <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-[#1D57A5]/30 bg-gray-100 shadow-lg sm:h-24 sm:w-24">
              {data.photo ? (
                <img
                  src={URL.createObjectURL(data.photo)}
                  alt="User"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-300">
                  <FaUser size={36} />
                </div>
              )}
            </div>
            <p className="text-lg font-bold text-gray-800">
              {data.fullName || "—"}
            </p>
            <span className="rounded-full bg-[#1D57A5]/10 px-3 py-0.5 text-xs font-semibold text-[#1D57A5]">
              {data.section || "—"} · {data.awardYear || "—"}
            </span>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2">
            {rows.map(([key, val]) => (
              <div key={key} className="rounded-lg bg-gray-50 px-3 py-2">
                <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  {key}
                </p>
                <p className="mt-0.5 text-sm font-medium wrap-break-word text-gray-800">
                  {val || "—"}
                </p>
              </div>
            ))}
          </div>

          {/* Uploaded files */}
          <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2">
            {[
              ["Aadhaar Document", data.aadhaarFile],
              ["Rashtrapati Certificate", data.certFile],
            ].map(([k, f]) => (
              <div
                key={k}
                className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2"
              >
                <FaCloudUploadAlt className="shrink-0 text-[#1D57A5]" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                    {k}
                  </p>
                  <p className="truncate text-sm font-medium text-[#1D57A5]">
                    {f ? f.name : "Not uploaded"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Declaration badge */}
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <FaCheckCircle className="shrink-0 text-green-500" />
            <p className="text-xs text-green-700">
              Declaration accepted — The applicant has certified that the
              information provided is true and correct.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 active:scale-95"
            >
              Edit
            </button>
            <button
              className="flex items-center gap-2 rounded-lg bg-[#1D57A5] px-6 py-2 text-sm font-bold text-white shadow-md transition hover:bg-[#163f7a] active:scale-95 disabled:opacity-60"
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              <FaPaperPlane size={13} /> Submit Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Form ─────────────────────────────────────────────────────────────
const Form = () => {
  const navigate = useNavigate();
  const sessionUser = session.getUser();

  const [form, setForm] = useState({
    photo: null,
    fullName: "",
    email: sessionUser?.email || "",
    mobile: sessionUser?.mobile_no || "",
    revenueState: "",
    revenueDistrict: "",
    pinCode: "",
    bsgState: "",
    bsgDistrict: "",
    address: "",
    dob: "",
    qualification: "",
    aadhaar: "",
    professionalQualification: "",
    tshirtSize: "",
    section: sessionUser?.section || "",
    awardYear: "",
    certificateNo: "",
    souvenir: "",
    aadhaarFile: null,
    certFile: null,
    declared: false,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if not logged in
  useEffect(() => {
    if (!session.isLoggedIn()) navigate("/login");
  }, [navigate]);

  // Fetch existing form data to pre-fill
  const { data: meData, isLoading: meLoading } = useQuery({
    queryKey: ["userMe"],
    queryFn: userApi.getMe,
    enabled: session.isLoggedIn(),
  });

  // Pre-fill form when data loads
  useEffect(() => {
    if (!meData) return;
    const u = meData.user;
    const d = meData.detail;

    // Normalise the DOB to YYYY-MM-DD for the HTML date input
    let dobValue = d?.dob || "";
    if (dobValue && dobValue.includes("T")) {
      dobValue = dobValue.split("T")[0]; // "2000-01-15T00:00:00.000Z" → "2000-01-15"
    }

    setForm((prev) => ({
      ...prev,
      email: u?.email || prev.email,
      mobile: d?.mobile_no || u?.mobile_no || prev.mobile,
      section: d?.section || u?.section || prev.section,
      fullName: d?.name || u?.name || prev.fullName,
      dob: dobValue || prev.dob,
      revenueState: d?.address?.revenue_state || prev.revenueState,
      revenueDistrict: d?.address?.revenue_district || prev.revenueDistrict,
      pinCode: d?.address?.pincode || prev.pinCode,
      address: d?.address?.house_no || prev.address,
      bsgState: d?.bsg_state || prev.bsgState,
      bsgDistrict: d?.bsg_district || prev.bsgDistrict,
      qualification: d?.highest_qualification || prev.qualification,
      professionalQualification:
        d?.professional_qualification || prev.professionalQualification,
      tshirtSize: d?.tshirt_size || prev.tshirtSize,
      awardYear: d?.year_of_rastrapati || prev.awardYear,
      certificateNo: d?.certificate_no || prev.certificateNo,
      souvenir: d?.souvenir || prev.souvenir,
      aadhaar: d?.aadhaar_no || prev.aadhaar,
    }));
  }, [meData]);

  // Per-field file size limits (in bytes)
  const FILE_SIZE_LIMITS = {
    photo: 100 * 1024,       // 100 KB
    aadhaarFile: 200 * 1024,  // 200 KB
    certFile: 200 * 1024,     // 200 KB
  };

  // Text-only fields: no numbers, no special chars, max 25 chars
  const TEXT_ONLY_FIELDS = ["fullName", "qualification", "professionalQualification"];

  const set = (key) => (e) => {
    if (e.target.type === "file") {
      const file = e.target.files[0];
      if (!file) return;

      const limit = FILE_SIZE_LIMITS[key];
      if (limit && file.size > limit) {
        const limitKB = Math.round(limit / 1024);
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          html: `<b>Max allowed:</b> ${limitKB}KB<br><b>Your file:</b> ${Math.round(file.size / 1024)}KB`,
          confirmButtonColor: "#1D57A5",
        });
        e.target.value = "";
        return;
      }

      setForm((prev) => ({ ...prev, [key]: file }));
      setErrors((prev) => ({ ...prev, [key]: "" }));

      // Show upload success popup
      Swal.fire({
        icon: "success",
        title: "Document Uploaded",
        html: `<b>File:</b> ${file.name}<br><b>Size:</b> ${Math.round(file.size / 1024)}KB<br><b>Max Allowed:</b> ${Math.round((FILE_SIZE_LIMITS[key] || 200 * 1024) / 1024)}KB`,
        confirmButtonColor: "#1D57A5",
        timer: 2500,
        showConfirmButton: false,
      });
      return;
    }

    let value = e.target.type === "checkbox" ? e.target.checked : e.target.value;

    // Aadhaar: only allow digits, max 12
    if (key === "aadhaar") {
      value = value.replace(/\D/g, "").slice(0, 12);
    }

    // Text-only fields: no numbers or special chars, max 25
    if (TEXT_ONLY_FIELDS.includes(key)) {
      value = value.replace(/[^a-zA-Z\s]/g, "").slice(0, 25);
    }

    // Address: allow all chars, max 50
    if (key === "address") {
      value = value.slice(0, 50);
    }

    // Certificate No: max 15 characters
    if (key === "certificateNo") {
      value = value.slice(0, 15);
    }

    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.photo && !meData?.detail?.photo_path)
      errs.photo = "Photo is required";
    if (!(form.fullName || "").trim()) errs.fullName = "Full name is required";
    if (!(form.email || "").trim()) errs.email = "Email is required";
    // Mobile is auto-fetched, disabled & read-only — skip validation
    if (!form.revenueState) errs.revenueState = "Revenue State is required";
    if (!form.revenueDistrict)
      errs.revenueDistrict = "Revenue District is required";
    if (!(form.pinCode || "").trim()) errs.pinCode = "Pin Code is required";
    if (!form.bsgState) errs.bsgState = "BSG State is required";
    if (!form.bsgDistrict) errs.bsgDistrict = "BSG District is required";
    if (!form.dob) errs.dob = "Date of Birth is required";
    if (!(form.address || "").trim()) errs.address = "Address is required";
    if (!(form.qualification || "").trim())
      errs.qualification = "Qualification is required";
    if (!(form.professionalQualification || "").trim())
      errs.professionalQualification = "Professional Qualification is required";
    const aadhaarVal = (form.aadhaar || "").replace(/\D/g, "");
    if (!aadhaarVal) {
      errs.aadhaar = "Aadhaar No is required";
    } else if (aadhaarVal.length !== 12) {
      errs.aadhaar = "Aadhaar No must be exactly 12 digits";
    }
    if (!form.aadhaarFile && !meData?.detail)
      errs.aadhaarFile = "Aadhaar Document is required";
    if (!form.tshirtSize) errs.tshirtSize = "T-Shirt Size is required";
    if (!form.section) errs.section = "Section is required";
    if (!form.awardYear) errs.awardYear = "Award Year is required";
    if (!(form.certificateNo || "").trim())
      errs.certificateNo = "Certificate No is required";
    else if ((form.certificateNo || "").trim().length > 15)
      errs.certificateNo = "Certificate No must not exceed 15 characters";
    if (!form.souvenir) errs.souvenir = "Souvenir preference is required";
    if (!form.certFile && !meData?.detail)
      errs.certFile = "Certificate Document is required";
    if (!form.declared) errs.declared = "You must accept the declaration";
    return errs;
  };

  const handlePreview = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      Swal.fire({
        icon: "error",
        title: "Incomplete Form",
        text: "Please fill all required fields correctly before previewing.",
        confirmButtonColor: "#1D57A5",
      });
      return;
    }
    setShowPreview(true);
  };

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append("fullName", form.fullName);
      fd.append("email", form.email);
      fd.append("mobile", form.mobile);
      fd.append("revenueState", form.revenueState);
      fd.append("revenueDistrict", form.revenueDistrict);
      fd.append("pinCode", form.pinCode);
      fd.append("bsgState", form.bsgState);
      fd.append("bsgDistrict", form.bsgDistrict);
      fd.append("address", form.address);
      fd.append("dob", form.dob);
      fd.append("qualification", form.qualification);
      fd.append("professionalQualification", form.professionalQualification);
      fd.append("aadhaar", form.aadhaar);
      fd.append("tshirtSize", form.tshirtSize);
      fd.append("section", form.section);
      fd.append("awardYear", form.awardYear);
      fd.append("certificateNo", form.certificateNo);
      fd.append("souvenir", form.souvenir);
      if (form.photo) fd.append("photo", form.photo);
      if (form.aadhaarFile) fd.append("aadhaarFile", form.aadhaarFile);
      if (form.certFile) fd.append("certFile", form.certFile);
      return userApi.submitForm(fd);
    },
    onSuccess: () => {
      setShowPreview(false);
      Swal.fire({
        icon: "success",
        title: "Application Submitted!",
        text: "Your application has been submitted successfully and is pending review.",
        confirmButtonColor: "#1D57A5",
        confirmButtonText: "Go to Dashboard",
      }).then(() => navigate("/user-dashboard"));
    },
    onError: (err) => {
      setShowPreview(false);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: err.message,
        confirmButtonColor: "#1D57A5",
      });
    },
  });

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setShowPreview(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    submitMutation.mutate();
  };

  if (meLoading) return <Loader fullScreen text="Loading your details..." />;

  return (
    <div className="flex min-h-screen flex-col bg-gray-200">
      <div className="pt-2">
        <Navbar title={"Registration Form"} />
      </div>

      <main className="flex-1 px-3 py-4 sm:px-4 sm:py-6 md:px-12 lg:px-20">
        {/* ── Photo Upload ── */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <label
            htmlFor="photo-upload"
            className="group relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-dashed border-[#1D57A5]/50 bg-white shadow-lg transition-all duration-200 hover:border-[#1D57A5] hover:shadow-xl active:scale-95 sm:h-28 sm:w-28"
          >
            {form.photo ? (
              <img
                src={URL.createObjectURL(form.photo)}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-1 text-gray-400 transition-colors group-hover:text-[#1D57A5]">
                <FaCamera size={26} />
              </div>
            )}
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={set("photo")}
          />
          <p className="text-sm font-semibold text-gray-600">
            Upload Photo in Uniform <span className="text-red-500">*</span>
          </p>
          <p className="text-xs text-gray-400">
            Accepted: JPG, PNG · max 100KB
          </p>
          {errors.photo && (
            <p className={errCls}>
              <MdOutlineInfo size={13} /> {errors.photo}
            </p>
          )}
        </div>

        {/* ════════════════════════════════════════════════
            SECTION 1 — Personal Information
        ════════════════════════════════════════════════ */}
        <div className="mb-4 rounded-xl bg-white p-4 shadow-md sm:mb-5 sm:rounded-2xl sm:p-6">
          <SectionHeader
            icon={FaUser}
            title="Personal Information"
            subtitle="Fill in your complete personal details"
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            <FieldGroup label="Full Name" required error={errors.fullName}>
              <input
                className={
                  inputCls + " cursor-not-allowed bg-gray-100 text-gray-500"
                }
                placeholder="e.g. Deepanshu Saini"
                value={form.fullName}
                onChange={set("fullName")}
                disabled
                readOnly
              />
            </FieldGroup>

            <FieldGroup label="Email ID" required error={errors.email}>
              <input
                className={
                  inputCls + " cursor-not-allowed bg-gray-100 text-gray-500"
                }
                type="email"
                placeholder="example@domain.com"
                value={form.email}
                onChange={set("email")}
                disabled
                readOnly
              />
            </FieldGroup>

            <FieldGroup label="Mobile No" required error={errors.mobile}>
              <input
                className={
                  inputCls + " cursor-not-allowed bg-gray-100 text-gray-500"
                }
                type="tel"
                placeholder="+91 98765 43210"
                value={form.mobile}
                onChange={set("mobile")}
                disabled
                readOnly
              />
            </FieldGroup>

            <FieldGroup
              label="Revenue State"
              required
              error={errors.revenueState}
            >
              <select
                className={inputCls}
                value={form.revenueState}
                onChange={(e) => {
                  set("revenueState")(e);
                  setForm((p) => ({ ...p, revenueDistrict: "" }));
                }}
              >
                <option value="">-- Select State --</option>
                {INDIA_STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </FieldGroup>

            <FieldGroup
              label="Revenue District"
              required
              error={errors.revenueDistrict}
            >
              <select
                className={inputCls}
                value={form.revenueDistrict}
                onChange={set("revenueDistrict")}
                disabled={!form.revenueState}
              >
                <option value="">-- Select District --</option>
                {getDistricts(form.revenueState).map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </FieldGroup>

            <FieldGroup label="Pin Code" required error={errors.pinCode}>
              <input
                className={inputCls}
                placeholder="110001"
                maxLength={6}
                value={form.pinCode}
                onChange={set("pinCode")}
              />
            </FieldGroup>

            <FieldGroup label="BSG State" required error={errors.bsgState}>
              <select
                className={inputCls}
                value={form.bsgState}
                onChange={(e) => {
                  set("bsgState")(e);
                  setForm((p) => ({ ...p, bsgDistrict: "" }));
                }}
              >
                <option value="">-- Select BSG State --</option>
                {BSG_STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </FieldGroup>

            <FieldGroup
              label="BSG District"
              required
              error={errors.bsgDistrict}
            >
              <select
                className={inputCls}
                value={form.bsgDistrict}
                onChange={set("bsgDistrict")}
                disabled={!form.bsgState}
              >
                <option value="">-- Select BSG District --</option>
                {getBsgDistricts(form.bsgState).map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </FieldGroup>

            <FieldGroup label="Date of Birth" required error={errors.dob}>
              <input
                className={inputCls}
                type="date"
                value={form.dob}
                onChange={set("dob")}
              />
            </FieldGroup>

            <FieldGroup
              label="Correspondence Address"
              required
              error={errors.address}
            >
              <input
                className={inputCls}
                placeholder="House No, Street, Area, City, State, Pincode"
                maxLength={50}
                value={form.address}
                onChange={set("address")}
              />
            </FieldGroup>

            <FieldGroup
              label="Highest Qualification"
              required
              error={errors.qualification}
            >
              <input
                className={inputCls}
                placeholder="e.g. B.A., M.Sc., Ph.D."
                value={form.qualification}
                onChange={set("qualification")}
              />
            </FieldGroup>

            <FieldGroup
              label="Professional / Occupation"
              required
              error={errors.professionalQualification}
            >
              <input
                className={inputCls}
                placeholder="e.g. Engineer, CA, Teacher"
                value={form.professionalQualification}
                onChange={set("professionalQualification")}
              />
            </FieldGroup>

            <FieldGroup label="Aadhaar No" required error={errors.aadhaar}>
              <input
                className={inputCls}
                placeholder="123456789012"
                maxLength={12}
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.aadhaar}
                onChange={set("aadhaar")}
              />
            </FieldGroup>

            {/* Upload Aadhaar — stays in the 3-col grid */}
            <div className="flex flex-col">
              <label className={labelCls}>
                Upload Aadhaar <span className="text-red-500">*</span>
              </label>
              <label
                htmlFor="aadhaar-upload"
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-all duration-200 active:scale-[0.99] ${
                  form.aadhaarFile
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-[#1D57A5]/40 bg-[#1D57A5]/5 text-[#1D57A5] hover:border-[#1D57A5] hover:bg-[#1D57A5]/10"
                }`}
              >
                {form.aadhaarFile ? (
                  <FaCheckCircle size={15} className="shrink-0" />
                ) : (
                  <FaCloudUploadAlt size={15} className="shrink-0" />
                )}
                <span className="flex-1 truncate font-semibold">
                  {form.aadhaarFile
                    ? form.aadhaarFile.name
                    : "Click to upload Aadhaar"}
                </span>
                {!form.aadhaarFile && (
                  <span className="shrink-0 rounded border border-[#1D57A5]/40 bg-white px-2 py-0.5 text-xs font-semibold text-[#1D57A5]">
                    Browse
                  </span>
                )}
              </label>
              <input
                id="aadhaar-upload"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={set("aadhaarFile")}
              />
              {errors.aadhaarFile && (
                <p className={errCls}>
                  <MdOutlineInfo size={13} /> {errors.aadhaarFile}
                </p>
              )}
            </div>
            <FieldGroup label="T-Shirt Size" required error={errors.tshirtSize}>
              <select
                className={inputCls}
                value={form.tshirtSize}
                onChange={set("tshirtSize")}
              >
                <option value="">-- Select Size --</option>
                {TSHIRT_SIZES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </FieldGroup>
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            SECTION 2 — Rashtrapati Award
        ════════════════════════════════════════════════ */}
        <div className="mb-4 rounded-xl bg-white p-4 shadow-md sm:mb-5 sm:rounded-2xl sm:p-6">
          <SectionHeader
            icon={FaMedal}
            title="Rashtrapati Award Information"
            subtitle="Details about your Rashtrapati award"
          />

          {/* Row 1: Section badge + year + cert no */}
          <div className="mb-3 grid grid-cols-1 gap-3 sm:mb-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {/* Section — disabled input, auto-fetched */}
            <FieldGroup label="Section" required>
              <input
                className={
                  inputCls + " cursor-not-allowed bg-gray-100 text-gray-500"
                }
                value={form.section || "Scout"}
                disabled
                readOnly
              />
            </FieldGroup>

            <FieldGroup
              label="Year of Rashtrapati Award"
              required
              error={errors.awardYear}
            >
              <input
                className={inputCls}
                type="text"
                placeholder="e.g. 2023"
                maxLength={4}
                inputMode="numeric"
                value={form.awardYear}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setForm((prev) => ({ ...prev, awardYear: val }));
                  setErrors((prev) => ({ ...prev, awardYear: "" }));
                }}
              />
            </FieldGroup>

            <FieldGroup
              label="Certificate No"
              required
              error={errors.certificateNo}
            >
              <input
                className={inputCls}
                placeholder="e.g. RA/2023/12345"
                maxLength={15}
                value={form.certificateNo}
                onChange={set("certificateNo")}
              />
            </FieldGroup>
          </div>

          {/* Upload cert row — removed separate col, now in the row below */}

          {/* Bottom row: Souvenir question (left) + Certificate upload (right) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {/* Souvenir question — left col */}
            <div className="flex flex-col rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="mb-3 text-sm font-semibold text-gray-700">
                Do you wish to have your Rashtrapati Guild Souvenir at cost?{" "}
                <span className="text-red-500">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {["Yes", "No", "Maybe"].map((opt) => (
                  <label
                    key={opt}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg border-2 px-4 py-1.5 text-sm font-semibold transition-all duration-200 select-none ${
                      form.souvenir === opt
                        ? "border-[#1D57A5] bg-[#1D57A5]/10 text-[#1D57A5] shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:border-[#1D57A5]/50 hover:text-[#1D57A5]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="souvenir"
                      value={opt}
                      checked={form.souvenir === opt}
                      onChange={set("souvenir")}
                      className="accent-[#1D57A5]"
                    />
                    {opt}
                  </label>
                ))}
              </div>
              {errors.souvenir && (
                <p className={errCls + " mt-2"}>
                  <MdOutlineInfo size={13} /> {errors.souvenir}
                </p>
              )}
            </div>

            {/* Upload Rashtrapati Certificate — right col */}
            <div className="flex flex-col justify-center">
              <label className={labelCls}>
                Upload Rashtrapati Certificate{" "}
                <span className="text-red-500">*</span>
              </label>
              <label
                htmlFor="cert-upload"
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-all duration-200 active:scale-[0.99] ${
                  form.certFile
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-[#1D57A5]/40 bg-[#1D57A5]/5 text-[#1D57A5] hover:border-[#1D57A5] hover:bg-[#1D57A5]/10"
                }`}
              >
                {form.certFile ? (
                  <FaCheckCircle size={15} className="shrink-0" />
                ) : (
                  <FaMedal size={15} className="shrink-0" />
                )}
                <span className="flex-1 truncate font-semibold">
                  {form.certFile
                    ? form.certFile.name
                    : "Click to upload certificate"}
                </span>
                {!form.certFile && (
                  <span className="shrink-0 rounded border border-[#1D57A5]/40 bg-white px-2 py-0.5 text-xs font-semibold text-[#1D57A5]">
                    Browse
                  </span>
                )}
              </label>
              <input
                id="cert-upload"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={set("certFile")}
              />
              <div className="mt-1.5 flex flex-col">
                <p className="text-xs text-gray-400">
                  JPG, PNG, PDF · max 200KB
                </p>
                {errors.certFile && (
                  <p className={errCls}>
                    <MdOutlineInfo size={13} /> {errors.certFile}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            SECTION 3 — Declaration
        ════════════════════════════════════════════════ */}
        <div className="mb-4 rounded-xl bg-white p-4 shadow-md sm:mb-6 sm:rounded-2xl sm:p-6">
          <SectionHeader
            icon={FaClipboardList}
            title="Declaration"
            subtitle="Please read carefully and accept before submitting"
          />

          <label
            className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all duration-200 select-none ${
              form.declared
                ? "border-green-400 bg-green-50"
                : "border-gray-200 hover:border-[#1D57A5]/40"
            }`}
          >
            <input
              type="checkbox"
              checked={form.declared}
              onChange={set("declared")}
              className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[#1D57A5]"
            />
            <span className="text-sm leading-relaxed text-gray-700">
              I hereby declare that the information provided by me is true and
              correct to the best of my knowledge. I confirm that I have
              fulfilled all the requirements for the Rashtrapati Guide Award as
              per the rules of The Bharat Scouts and Guides. I understand that
              any false information may lead to rejection of my application.{" "}
              <span className="text-red-500">*</span>
            </span>
          </label>
          {errors.declared && (
            <p className={errCls + " mt-2"}>
              <MdOutlineInfo size={13} /> {errors.declared}
            </p>
          )}
        </div>

        {/* ── Action Buttons — centered ── */}
        <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={handlePreview}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#1D57A5] px-10 py-3 text-sm font-bold text-[#1D57A5] transition-all duration-200 hover:bg-[#1D57A5]/10 active:scale-95 sm:w-auto"
          >
            <FaEye size={15} /> Preview Application
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D57A5] px-10 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:bg-[#163f7a] active:scale-95 disabled:opacity-60 sm:w-auto"
          >
            <FaPaperPlane size={13} />{" "}
            {submitMutation.isPending ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </main>

      <Footer />

      {showPreview && (
        <PreviewCard
          data={form}
          onClose={() => setShowPreview(false)}
          onSubmit={handleSubmit}
          isSubmitting={submitMutation.isPending}
        />
      )}
    </div>
  );
};

export default Form;
