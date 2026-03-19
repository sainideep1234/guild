import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import PrintTemplate from "../components/PrintTemplate";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, session, getUploadUrl } from "../api/api";
import Swal from "sweetalert2";
import {
  FiList,
  FiGrid,
  FiEye,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiDownload,
  FiPrinter,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { INDIA_STATES, getDistricts } from "../data/indiaStates";

const SECTIONS = ["Scout", "Guide", "Rover", "Ranger"];
const STATUSES = ["PENDING", "APPROVED", "REJECTED"];
const PAGE_SIZE_OPTIONS = [25, 50, 75, 100];

const StatusBadge = ({ status }) => {
  const cfg = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${cfg[status] || "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
};

// ── Excel Download Utility ────────────────────────────────────────────────
function downloadExcel(data) {
  const columns = [
    "NAME", "EMAIL", "MOBILE NO", "SECTION", "YEAR OF RASTRAPATI", "STATUS",
    "REVENUE STATE", "REVENUE DISTRICT", "BSG STATE", "BSG DISTRICT",
    "AADHAAR NO", "RASHTRAPATI CERTIFICATE NO", "HIGHEST QUALIFICATION", "PROFESSIONAL QUALIFICATION",
    "TSHIRT SIZE", "SOUVENIR", "PINCODE", "ADDRESS", "APPLICATION NO",
  ];

  const rows = data.map((item) => [
    item.name, item.email, item.mobile, item.section, item.year, item.status,
    item.state, item.district, item.bsg_state, item.bsg_district,
    item.aadhaar_no, item.certificate_no, item.highest_qualification,
    item.professional_qualification, item.tshirt_size, item.souvenir,
    item.pincode, item.address, item.application_no || "",
  ]);

  // Build CSV (Excel compatible)
  const escape = (v) => `"${String(v || "").replace(/"/g, '""')}"`;
  const csv = [columns.join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `BSG_Submissions_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isGridView, setIsGridView] = useState(false);
  const [activeTab, setActiveTab] = useState("application");
  const [filters, setFilters] = useState({
    state: "",
    district: "",
    section: "",
    year: "",
    status: "",
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Print in modal
  const [printUser, setPrintUser] = useState(null);

  useEffect(() => {
    const u = session.getUser();
    if (!u || (u.role !== "admin" && u.role !== "superadmin"))
      navigate("/login");
  }, [navigate]);

  // Reset page when tab or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filters]);

  // Derive status filter from active tab
  const queryFilters = {
    ...filters,
    ...(activeTab === "pending" ? { status: "PENDING" } : {}),
    ...(activeTab === "update" ? { status: "" } : {}),
  };

  const { data, isLoading } = useQuery({
    queryKey: ["adminSubmissions", queryFilters],
    queryFn: () => adminApi.getSubmissions(queryFilters),
    enabled: session.isLoggedIn(),
  });

  const submissions = data?.submissions || [];
  const stats = data?.stats || {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  // Paginated data
  const totalPages = Math.max(1, Math.ceil(submissions.length / pageSize));
  const paginatedSubmissions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return submissions.slice(start, start + pageSize);
  }, [submissions, currentPage, pageSize]);

  const approveMutation = useMutation({
    mutationFn: (userId) => adminApi.approveUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminSubmissions"]);
      Swal.fire({
        icon: "success",
        title: "Approved!",
        confirmButtonColor: "#1D57A5",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) =>
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
        confirmButtonColor: "#1D57A5",
      }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ userId, reason }) => adminApi.rejectUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminSubmissions"]);
      Swal.fire({
        icon: "success",
        title: "Rejected",
        confirmButtonColor: "#1D57A5",
        timer: 1500,
        showConfirmButton: false,
      });
    },
    onError: (err) =>
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
        confirmButtonColor: "#1D57A5",
      }),
  });

  const handleApprove = (item) => {
    Swal.fire({
      title: "Accept Application?",
      html: `<p class="text-sm text-gray-600">Approve application of <strong>${item.name}</strong>?</p>`,
      showCancelButton: true,
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Accept",
    }).then((result) => {
      if (result.isConfirmed) approveMutation.mutate(item.user_id);
    });
  };

  const handleReject = (item) => {
    Swal.fire({
      title: "Reject Application",
      html: `<p class="text-sm text-gray-600 mb-2">Rejecting application of <strong>${item.name}</strong></p>
             <label class="block text-left text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Reason for Rejection <span class="text-red-500">*</span></label>
             <textarea id="swal-reason" class="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-red-400" rows="3" placeholder="Provide a clear reason..."></textarea>`,
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Reject",
      preConfirm: () => {
        const reason = document.getElementById("swal-reason").value.trim();
        if (!reason || reason.length < 5) {
          Swal.showValidationMessage(
            "Please provide a reason (min 5 characters)",
          );
          return false;
        }
        return reason;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        rejectMutation.mutate({ userId: item.user_id, reason: result.value });
      }
    });
  };

  const handleView = (item) => {
    setSelectedUser(item);
    setShowDetailModal(true);
  };

  const resetFilters = () =>
    setFilters({ state: "", district: "", section: "", year: "", status: "" });

  const selectCls =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 transition-all outline-none hover:border-gray-300 focus:border-[#1D57A5] focus:ring-2 focus:ring-[#1D57A5]/20 sm:min-w-[110px] sm:flex-1";

  return (
    <>
    <div className="print:hidden flex min-h-screen flex-col bg-[#F4F7FE] font-sans">
      <div className="pt-2">
        <Navbar title="ADMIN DASHBOARD" />
      </div>

      <div className="mx-3 mt-4 flex-1 space-y-4 pb-8 sm:mx-4 sm:mt-6 sm:space-y-6 sm:pb-10 md:mx-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4">
          {[
            { label: "Total Application", value: stats.total, color: "text-[#1D57A5]" },
            { label: "Pending", value: stats.pending, color: "text-yellow-500" },
            { label: "Rejected", value: stats.rejected, color: "text-red-500" },
            { label: "Approved", value: stats.approved, color: "text-green-500" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-xl border border-white/60 bg-white/80 p-3 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-md sm:rounded-2xl sm:p-5"
            >
              <p className="text-xs font-medium text-gray-500 sm:text-sm">{label}</p>
              <p className={`mt-1 text-2xl font-bold sm:mt-2 sm:text-3xl ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div className="mx-auto flex w-full max-w-6xl flex-col justify-center gap-2 sm:grid sm:grid-cols-3 sm:gap-4">
          {[
            { id: "application", label: "All Applications" },
            { id: "pending", label: "Pending Dashboard" },
            { id: "update", label: "Update User" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`group flex min-h-14 flex-col items-center justify-center rounded-xl border px-4 py-3 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-95 sm:min-h-20 sm:rounded-2xl sm:px-6 sm:py-4 ${activeTab === id ? "border-[#1D57A5] bg-[#1D57A5] text-white shadow-lg shadow-blue-900/30" : "border-white/60 bg-white/80 text-gray-600 shadow-sm backdrop-blur-md hover:bg-white hover:text-[#1D57A5]"}`}
            >
              <span className="text-sm font-bold tracking-wide sm:text-base md:text-lg">{label}</span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="rounded-2xl border border-white/60 bg-white/70 p-3 shadow-xl backdrop-blur-xl sm:rounded-3xl sm:p-4 md:p-6">
          {/* Filters */}
          <div className="mb-4 rounded-xl border border-gray-100 bg-white/50 p-3 shadow-sm sm:mb-6 sm:rounded-2xl sm:p-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <select
                value={filters.state}
                onChange={(e) => setFilters((p) => ({ ...p, state: e.target.value, district: "" }))}
                className={selectCls}
              >
                <option value="">All States</option>
                {INDIA_STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <select
                value={filters.district}
                onChange={(e) => setFilters((p) => ({ ...p, district: e.target.value }))}
                className={selectCls}
                disabled={!filters.state}
              >
                <option value="">All Districts</option>
                {getDistricts(filters.state).map((d) => <option key={d}>{d}</option>)}
              </select>
              <select
                value={filters.section}
                onChange={(e) => setFilters((p) => ({ ...p, section: e.target.value }))}
                className={selectCls}
              >
                <option value="">Section</option>
                {SECTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
              <select
                value={filters.year}
                onChange={(e) => setFilters((p) => ({ ...p, year: e.target.value }))}
                className={selectCls}
              >
                <option value="">Year</option>
                {(data?.availableYears || []).map((y) => <option key={y}>{y}</option>)}
              </select>
              {activeTab === "application" && (
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                  className={selectCls}
                >
                  <option value="">All Status</option>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              )}

              {/* Clear + Download + Grid/List */}
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-200 active:scale-95 sm:px-4"
                >
                  <FiRefreshCw className="h-4 w-4" /> Clear
                </button>
                <button
                  onClick={() => downloadExcel(submissions)}
                  className="flex items-center gap-2 rounded-xl bg-green-500 px-3 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-green-600 active:scale-95 sm:px-4"
                  title="Download Excel"
                >
                  <FiDownload className="h-4 w-4" /> Excel
                </button>
                <button
                  onClick={() => setIsGridView(!isGridView)}
                  className="group flex items-center gap-2 rounded-xl bg-[#1D57A5] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-900/20 transition-all duration-300 hover:bg-[#163f7a] hover:shadow-lg active:scale-95"
                >
                  {isGridView ? (
                    <><FiList className="h-5 w-5" /><span>List</span></>
                  ) : (
                    <><FiGrid className="h-5 w-5" /><span>Grid</span></>
                  )}
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <Loader text="Loading submissions..." />
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <FiList size={40} className="text-gray-300" />
              <p className="font-semibold text-gray-500">No submissions found.</p>
            </div>
          ) : isGridView ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedSubmissions.map((item, idx) => (
                <div
                  key={item._id}
                  className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="mb-4 flex items-center justify-between border-b border-gray-50 pb-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#1D57A5]">
                      #{(currentPage - 1) * pageSize + idx + 1}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-gray-800">{item.name}</h3>
                    <div className="space-y-1.5 rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
                      <div className="flex justify-between"><span className="font-semibold text-gray-500">Section:</span><span>{item.section}</span></div>
                      <div className="flex justify-between"><span className="font-semibold text-gray-500">State:</span><span>{item.state}</span></div>
                      <div className="flex justify-between"><span className="font-semibold text-gray-500">District:</span><span>{item.district}</span></div>
                      <div className="flex justify-between"><span className="font-semibold text-gray-500">Year:</span><span>{item.year}</span></div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleView(item)}
                      className="flex flex-col items-center justify-center rounded-xl bg-blue-50 py-2 text-blue-600 transition hover:bg-blue-600 hover:text-white active:scale-95"
                      title="Preview"
                    >
                      <FiEye className="mb-1 h-4 w-4" />
                      <span className="text-[10px] font-bold uppercase">View</span>
                    </button>
                    {item.status !== "APPROVED" && (
                      <button
                        onClick={() => handleApprove(item)}
                        className="flex flex-col items-center justify-center rounded-xl bg-green-50 py-2 text-green-600 transition hover:bg-green-600 hover:text-white active:scale-95"
                        title="Accept"
                      >
                        <FiCheck className="mb-1 h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase">Accept</span>
                      </button>
                    )}
                    {item.status !== "REJECTED" && (
                      <button
                        onClick={() => handleReject(item)}
                        className="flex flex-col items-center justify-center rounded-xl bg-red-50 py-2 text-red-600 transition hover:bg-red-600 hover:text-white active:scale-95"
                        title="Reject"
                      >
                        <FiX className="mb-1 h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase">Reject</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="border-b border-gray-100 bg-[#f8fafc] text-xs text-gray-500 uppercase">
                    <tr>
                      {[
                        "S.No", "Name", "State", "District", "Section", "Year", "Status",
                        ...(activeTab === "update" || activeTab === "pending" ? ["Action"] : []),
                      ].map((h) => (
                        <th key={h} className="px-4 py-4 font-bold tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginatedSubmissions.map((item, idx) => (
                      <tr key={item._id} className="transition-colors hover:bg-blue-50/40">
                        <td className="px-4 py-3 font-semibold text-gray-400">{(currentPage - 1) * pageSize + idx + 1}</td>
                        <td className="px-4 py-3 font-bold whitespace-nowrap text-gray-800">{item.name}</td>
                        <td className="px-4 py-3">{item.state}</td>
                        <td className="px-4 py-3">{item.district}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-600">{item.section}</span>
                        </td>
                        <td className="px-4 py-3">{item.year}</td>
                        <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                        {(activeTab === "update" || activeTab === "pending") && (
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleView(item)}
                                className="rounded-lg bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-600 hover:text-white active:scale-95"
                                title={activeTab === "pending" ? "Preview" : "View/Edit"}
                              >
                                <FiEye className="h-4 w-4" />
                              </button>
                              {activeTab === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleApprove(item)}
                                    className="rounded-lg bg-green-50 p-2 text-green-600 transition hover:bg-green-600 hover:text-white active:scale-95"
                                    title="Accept"
                                  >
                                    <FiCheck className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleReject(item)}
                                    className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-600 hover:text-white active:scale-95"
                                    title="Reject"
                                  >
                                    <FiX className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Pagination ── */}
          {submissions.length > 0 && (
            <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-gray-200 px-2 py-1 text-sm outline-none focus:border-[#1D57A5]"
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <span>per page</span>
                <span className="ml-2 text-gray-400">
                  ({submissions.length} total)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FiChevronLeft size={16} /> Prev
                </button>
                <span className="rounded-lg bg-[#1D57A5] px-3 py-1.5 text-sm font-bold text-white">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm sm:p-4">
          <div className="relative flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl">
            <div className="flex shrink-0 items-center justify-between bg-[#1D57A5] px-4 py-3 sm:px-6 sm:py-4">
              <h2 className="text-base font-bold text-white sm:text-lg">
                Application Detail
              </h2>
              <div className="flex items-center gap-2">
                {/* Print button in modal */}
                <button
                  onClick={() => {
                    setPrintUser(selectedUser);
                    setShowDetailModal(false);
                    setTimeout(() => window.print(), 300);
                  }}
                  className="flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/40"
                >
                  <FiPrinter size={14} /> Print
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/40"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto p-4 sm:p-6">
              <div className="mb-4 flex flex-col items-center gap-3 sm:mb-5 sm:flex-row sm:gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-[#1D57A5]/20 bg-gray-100 sm:h-20 sm:w-20">
                  {selectedUser.photo_path ? (
                    <img
                      src={getUploadUrl(selectedUser.photo_path)}
                      alt="Photo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                      <FiEye size={28} />
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-bold text-gray-800 sm:text-xl">
                    {selectedUser.name}
                  </h3>
                  <StatusBadge status={selectedUser.status} />
                  {selectedUser.application_no && (
                    <p className="mt-1 text-xs font-semibold text-[#1D57A5]">
                      App No: {selectedUser.application_no}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2">
                {[
                  ["Email", selectedUser.email],
                  ["Mobile", selectedUser.mobile],
                  ["Section", selectedUser.section],
                  ["Year", selectedUser.year],
                  ["Revenue State", selectedUser.state],
                  ["Revenue District", selectedUser.district],
                  ["BSG State", selectedUser.bsg_state],
                  ["BSG District", selectedUser.bsg_district],
                  ["Aadhaar No", selectedUser.aadhaar_no],
                  ["Certificate No", selectedUser.certificate_no],
                  ["Qualification", selectedUser.highest_qualification],
                  ["Profession", selectedUser.professional_qualification],
                  ["T-Shirt Size", selectedUser.tshirt_size],
                  ["Souvenir", selectedUser.souvenir],
                  ["Pincode", selectedUser.pincode],
                  ["Address", selectedUser.address],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-gray-50 px-3 py-2">
                    <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">{k}</p>
                    <p className="mt-0.5 text-sm font-medium text-gray-800">{v || "—"}</p>
                  </div>
                ))}
              </div>

              {/* Document links in preview */}
              {(selectedUser.adhar_doc_path || selectedUser.rashtrapati_certificate_path) && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {selectedUser.adhar_doc_path && (
                    <a
                      href={getUploadUrl(selectedUser.adhar_doc_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-lg bg-[#1D57A5] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#163f7a]"
                    >
                      Aadhaar Doc
                    </a>
                  )}
                  {selectedUser.rashtrapati_certificate_path && (
                    <a
                      href={getUploadUrl(selectedUser.rashtrapati_certificate_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-lg bg-[#1D57A5] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#163f7a]"
                    >
                      Rashtrapati Certificate
                    </a>
                  )}
                </div>
              )}

              {selectedUser.status === "REJECTED" && selectedUser.admin_remarks && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-xs font-bold text-red-600 uppercase">Rejection Reason</p>
                  <p className="mt-1 text-sm text-red-700">{selectedUser.admin_remarks}</p>
                </div>
              )}

              {/* Centered Actions */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 border-t border-gray-100 pt-5">
                {selectedUser.status !== "APPROVED" && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleApprove(selectedUser);
                    }}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-green-500 bg-green-50 px-8 py-2.5 text-sm font-bold text-green-700 shadow-sm transition hover:bg-green-500 hover:text-white hover:shadow-md active:scale-95"
                  >
                    <FiCheck className="h-4 w-4" /> Accept Application
                  </button>
                )}
                {selectedUser.status !== "REJECTED" && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleReject(selectedUser);
                    }}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-red-500 bg-red-50 px-8 py-2.5 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-500 hover:text-white hover:shadow-md active:scale-95"
                  >
                    <FiX className="h-4 w-4" /> Reject Application
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    {/* Print Template for admin — hidden, only shown when printing */}
    {printUser && (
      <PrintTemplate
        detail={{
          name: printUser.name,
          email: printUser.email,
          mobile_no: printUser.mobile,
          dob: printUser.dob,
          address: {
            revenue_state: printUser.state,
            revenue_district: printUser.district,
            pincode: printUser.pincode,
            house_no: printUser.address,
          },
          bsg_state: printUser.bsg_state,
          bsg_district: printUser.bsg_district,
          highest_qualification: printUser.highest_qualification,
          professional_qualification: printUser.professional_qualification,
          tshirt_size: printUser.tshirt_size,
          section: printUser.section,
          year_of_rastrapati: printUser.year,
          certificate_no: printUser.certificate_no,
          souvenir: printUser.souvenir,
          aadhaar_no: printUser.aadhaar_no,
          photo_path: printUser.photo_path,
          adhar_doc_path: printUser.adhar_doc_path,
          rashtrapati_certificate_path: printUser.rashtrapati_certificate_path,
        }}
        user={{ email: printUser.email }}
        verification={{
          status: printUser.status,
          application_no: printUser.application_no,
        }}
      />
    )}
    </>
  );
};

export default AdminDashboard;
