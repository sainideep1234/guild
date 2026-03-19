import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import PrintTemplate from "../components/PrintTemplate";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { userApi, session, getUploadUrl } from "../api/api";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiAward,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiPrinter,
  FiExternalLink,
} from "react-icons/fi";

/* ── Status config ─────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  PENDING: {
    bg: "bg-amber-50 border-2 border-amber-400",
    text: "text-amber-700",
    icon: <FiClock size={18} />,
    label: "PENDING",
  },
  APPROVED: {
    bg: "bg-emerald-50 border-2 border-emerald-500",
    text: "text-emerald-700",
    icon: <FiCheckCircle size={18} />,
    label: "APPROVED",
  },
  REJECTED: {
    bg: "bg-rose-50 border-2 border-rose-500",
    text: "text-rose-700",
    icon: <FiXCircle size={18} />,
    label: "REJECTED",
  },
  NOT_SUBMITTED: {
    bg: "bg-gray-50 border-2 border-gray-400",
    text: "text-gray-700",
    icon: <FiClock size={18} />,
    label: "NOT SUBMITTED",
  },
};

/* ── Info row helper ───────────────────────────────────────────────────── */
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex flex-col gap-0.5 rounded-xl bg-gray-50/80 px-4 py-3">
    <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
      <Icon size={12} /> {label}
    </span>
    <span className="text-sm font-semibold text-gray-800">{value || "—"}</span>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════ */
const UserDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!session.isLoggedIn()) navigate("/login");
  }, [navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["userMe"],
    queryFn: userApi.getMe,
    enabled: session.isLoggedIn(),
  });

  if (isLoading) return <Loader fullScreen text="Loading your dashboard..." />;

  const user = data?.user;
  const detail = data?.detail;
  const verification = data?.verification;
  const status = verification?.status || "NOT_SUBMITTED";
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.NOT_SUBMITTED;
  const hasFilledForm = !!detail;

  const photoUrl = detail?.photo_path ? getUploadUrl(detail.photo_path) : null;
  const displayName = detail?.name || user?.name || user?.email?.split("@")[0] || "User";

  const aadhaarDocUrl = detail?.adhar_doc_path
    ? getUploadUrl(detail.adhar_doc_path)
    : null;
  const certDocUrl = detail?.rashtrapati_certificate_path
    ? getUploadUrl(detail.rashtrapati_certificate_path)
    : null;

  return (
    <>
      <div className="print:hidden flex min-h-screen flex-col bg-[#F4F7FE] font-sans">
        <div className="pt-2">
          <Navbar title="USER DASHBOARD" />
        </div>

        <div className="mx-3 mt-4 flex-1 space-y-5 pb-8 sm:mx-4 sm:mt-6 sm:pb-10 md:mx-8">
          {/* ── Top Action Bar ───────── */}
          <div className="rounded-2xl border border-white/60 bg-white/80 p-3 shadow-sm backdrop-blur-md sm:p-4">
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Connect to OYMS */}
              <button
                onClick={() =>
                  window.open("https://oyms.bsgindia.org", "_blank")
                }
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#1D57A5] bg-[#1D57A5]/5 px-5 py-2.5 text-sm font-bold text-[#1D57A5] shadow-sm transition-all duration-300 hover:bg-[#1D57A5] hover:text-white hover:shadow-md active:scale-95"
              >
                <FiExternalLink size={16} />
                Connect to OYMS
              </button>

              {/* Status Badge */}
              <div
                className={`flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-extrabold tracking-wider shadow-md ${statusCfg.bg} ${statusCfg.text}`}
              >
                {statusCfg.icon}
                <span>Status : {statusCfg.label}</span>
              </div>

              {/* Print — only shown if form is filled */}
              {hasFilledForm && (
                <button
                  onClick={() => window.print()}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-green-500 bg-green-50 px-5 py-2.5 text-sm font-bold text-green-600 shadow-sm transition-all duration-300 hover:bg-green-500 hover:text-white hover:shadow-md active:scale-95"
                >
                  <FiPrinter size={16} />
                  Print
                </button>
              )}
            </div>

            {/* Application No — only when approved */}
            {status === "APPROVED" && verification?.application_no && (
              <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-center">
                <FiAward size={16} className="text-green-600" />
                <span className="text-sm font-semibold text-gray-600">
                  Application No:
                </span>
                <span className="text-sm font-extrabold text-green-700">
                  {verification.application_no}
                </span>
              </div>
            )}
          </div>

          {/* ── Rejection Reason ────────────────────── */}
          {status === "REJECTED" && verification?.admin_remarks && (
            <div className="relative overflow-hidden rounded-2xl border-l-[6px] border-[#1D57A5] bg-white p-5 shadow-lg">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#1D57A5]/5 blur-2xl"></div>
              <div className="relative flex items-start gap-4">
                <div className="mt-0.5 flex shrink-0 items-center justify-center rounded-full bg-[#1D57A5]/10 p-2.5 shadow-sm">
                  <FiFileText className="text-[#1D57A5]" size={22} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold tracking-widest text-[#1D57A5] uppercase">
                    Application Notice
                  </p>
                  <div className="mt-1.5 rounded-lg bg-gray-50 p-3 shadow-inner">
                    <p className="text-sm leading-relaxed text-gray-700">
                      <span className="font-semibold italic text-gray-900">
                        Note:
                      </span>{" "}
                      {verification.admin_remarks}
                    </p>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => navigate("/form")}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#1D57A5] px-5 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-[#163f7a] hover:shadow-lg active:scale-95"
                    >
                      Update & Resubmit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Profile Card ────────────────────────── */}
          <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur-md sm:p-6">
            {/* Header — Photo + Name (Always visible) */}
            <div className={`flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5 ${detail ? "mb-5 border-b border-gray-100 pb-5" : "pb-2"}`}>
              <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-[#1D57A5]/20 bg-gray-100 shadow-lg sm:h-24 sm:w-24">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300">
                    <FiUser size={36} />
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
                  {displayName}
                </h2>
                <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#1D57A5]/10 px-3 py-1 text-xs font-bold text-[#1D57A5]">
                    <FiAward size={12} />
                    {detail?.section || user?.section || "—"}
                  </span>
                  {detail?.year_of_rastrapati && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                      <FiCalendar size={12} />
                      {detail.year_of_rastrapati}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500 font-medium italic">
                  {user?.email}
                </p>
              </div>
            </div>

            {detail ? (
              /* Detail Grid */
              <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                <InfoRow
                  icon={FiPhone}
                  label="Contact No"
                  value={detail.mobile_no || user?.mobile_no}
                />
                <InfoRow
                  icon={FiCalendar}
                  label="Date of Birth"
                  value={detail.dob}
                />
                <InfoRow
                  icon={FiMapPin}
                  label="Revenue State"
                  value={detail.address?.revenue_state}
                />
                <InfoRow
                  icon={FiMapPin}
                  label="Revenue District"
                  value={detail.address?.revenue_district}
                />
                <InfoRow
                  icon={FiMapPin}
                  label="Pincode"
                  value={detail.address?.pincode}
                />
                <InfoRow
                  icon={FiMapPin}
                  label="Address"
                  value={detail.address?.house_no}
                />
                <InfoRow
                  icon={FiMapPin}
                  label="BSG State"
                  value={detail.bsg_state}
                />
                <InfoRow
                  icon={FiMapPin}
                  label="BSG District"
                  value={detail.bsg_district}
                />
                <InfoRow
                  icon={FiAward}
                  label="Certificate No"
                  value={detail.certificate_no}
                />
                <InfoRow
                  icon={FiFileText}
                  label="Qualification"
                  value={detail.highest_qualification}
                />
                <InfoRow
                  icon={FiFileText}
                  label="Profession"
                  value={detail.professional_qualification}
                />
                <InfoRow
                  icon={FiFileText}
                  label="Aadhaar No"
                  value={detail.aadhaar_no}
                />
                <InfoRow
                  icon={FiFileText}
                  label="T-Shirt Size"
                  value={detail.tshirt_size}
                />
                <InfoRow
                  icon={FiFileText}
                  label="Souvenir"
                  value={detail.souvenir}
                />

                {/* ── Document Links ── */}
                {aadhaarDocUrl && (
                  <a
                    href={aadhaarDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col gap-0.5 rounded-xl bg-[#1D57A5] px-4 py-3 shadow-md transition-all hover:bg-[#163f7a] active:scale-95 text-white"
                  >
                    <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-white/80 uppercase">
                      <FiFileText size={12} /> Aadhaar
                    </span>
                    <span className="flex items-center gap-2 text-sm font-bold">
                      View Document <FiExternalLink size={14} className="opacity-70" />
                    </span>
                  </a>
                )}
                {certDocUrl && (
                  <a
                    href={certDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col gap-0.5 rounded-xl bg-[#1D57A5] px-4 py-3 shadow-md transition-all hover:bg-[#163f7a] active:scale-95 text-white"
                  >
                    <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-white/80 uppercase">
                      <FiAward size={12} /> Certificate
                    </span>
                    <span className="flex items-center gap-2 text-sm font-bold">
                      View Certificate <FiExternalLink size={14} className="opacity-70" />
                    </span>
                  </a>
                )}
              </div>
            ) : (
              /* ── Empty State message ── */
              <div className="flex flex-col items-center justify-center gap-3 py-6 mt-4 border-t border-gray-100 text-center">
                <p className="text-base font-semibold text-gray-600">
                  Application Not Submitted
                </p>
                <p className="max-w-sm text-xs text-gray-400">
                  Please fill in your application form to register for the Rashtrapati Award Guild.
                </p>
                <button
                  onClick={() => navigate("/form")}
                  className="mt-2 rounded-xl bg-[#1D57A5] px-8 py-2.5 text-xs font-bold text-white shadow-lg transition-all duration-300 hover:bg-[#163f7a] active:scale-95"
                >
                  Fill Application Form
                </button>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
      <PrintTemplate detail={detail} user={user} verification={verification} />
    </>
  );
};

export default UserDashboard;
