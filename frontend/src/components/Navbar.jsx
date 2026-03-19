import React, { useEffect, useRef, useState } from "react";
import image from "../assets/bsgbrandinglogoshort.png";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiLogOut,
  FiUser,
  FiMenu,
  FiX,
  FiChevronDown,
  FiEdit,
} from "react-icons/fi";
import { session, userApi, adminApi, getUploadUrl } from "../api/api";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";

const NAV_LINKS = [
  { label: "Register Here", href: "/register" },
  { label: "Login", href: "/login" },
];

const USER_PAGES = ["user-dashboard", "admin-dashboard", "form"];

const Navbar = ({ title = "" }) => {
  const [currentPage, setCurrentPage] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const currLocation = useLocation();
  const navigate = useNavigate();

  const user = session.getUser();
  const isLoggedIn = session.isLoggedIn();

  // Fetch full details for the profile section (choose userApi or adminApi)
  const { data: meData } = useQuery({
    queryKey: ["profileMe", user?.role],
    queryFn: () => (["admin", "superadmin"].includes(user?.role) ? adminApi.getMe() : userApi.getMe()),
    enabled: isLoggedIn && !!user?.role,
  });

  const detail = meData?.detail;
  const photoUrl = detail?.photo_path ? getUploadUrl(detail.photo_path) : null;
  const displayName = detail?.name || meData?.user?.name || user?.email?.split("@")[0] || "User";
  const section = detail?.section || user?.section || "Member";

  useEffect(() => {
    setCurrentPage(currLocation.pathname.split("/")[1]);
  }, [currLocation.pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isUserPage = USER_PAGES.includes(currentPage);

  const handleLogout = () => {
    Swal.fire({
      title: "Sign Out?",
      text: "Do you really want to sign out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Sign Out",
      cancelButtonText: "Stay",
    }).then((result) => {
      if (result.isConfirmed) {
        session.clear();
        navigate("/login");
      }
    });
  };

  const handleUpdateProfile = () => {
    setProfileOpen(false);
    navigate("/form");
  };



  return (
    <div className="mx-auto w-full">
      <nav className="mx-4 md:mx-8">
        {/* Main bar */}
        <div className="flex items-center  bg-[#1D57A5] px-4 py-2 shadow-lg md:px-6">
          {/* LEFT — Logo */}
          <div className="flex shrink-0 items-center justify-start sm:w-44 md:w-56 ">
            <img
              src={image}
              alt="BSG-logo"
              className="h-10 w-auto cursor-pointer object-contain transition-opacity duration-200 sm:h-14"
              onClick={() => navigate("/")}
            />
          </div>

          {/* CENTER — Title */}
          <div className="flex flex-1 items-center justify-center px-2">
            {title && (
              <h1 className="text-center text-base font-extrabold tracking-wide text-white uppercase drop-shadow-sm sm:text-xl md:text-2xl lg:text-3xl">
                {title}
              </h1>
            )}
          </div>

          {/* RIGHT — Profile or Links */}
          <div className="flex shrink-0 items-center justify-end  sm:w-44 md:w-56">
            {isLoggedIn ? (
              <div
                className="group relative flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-white/5 p-2 transition-all hover:bg-white/10"
                onMouseEnter={() => setProfileOpen(true)}
                onMouseLeave={() => setProfileOpen(false)}
              >
                {/* Info (Visible on desktop) */}
                <div className="hidden flex-col text-right md:flex">
                  <span className="max-w-[120px] truncate text-xs font-bold text-white leading-tight text-left form">
                    {["admin", "superadmin"].includes(user?.role) ? "ADMIN" : displayName}
                  </span>
                  <span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">
                    {["admin", "superadmin"].includes(user?.role) ? (detail?.bsg_uid || "DASHBOARD") : section}
                  </span>
                </div>

                {/* Profile Pic (Hidden for Admins if requested) */}
                {user?.role !== "admin" && (
                  <div className="h-8 w-8 overflow-hidden rounded-full border border-white/30 bg-white/20 sm:h-10 sm:w-10">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white">
                        <FiUser size={18} />
                      </div>
                    )}
                  </div>
                )}
                {user?.role === "admin" && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white sm:h-10 sm:w-10 border border-white/30">
                     <FiUser size={18} />
                  </div>
                )}

                {/* Hover Modal */}
                {profileOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl transition-all animate-in fade-in slide-in-from-top-2 before:absolute before:-top-4 before:left-0 before:right-0 before:h-4 before:content-['']">
                    {/* Header: Photo + Info */}
                    <div className={`mb-4 flex flex-col items-center border-b border-gray-50 pb-4 text-center ${user?.role === "admin" ? "pt-2" : ""}`}>
                      {user?.role !== "admin" ? (
                        <>
                          <div className="mb-2 h-16 w-16 overflow-hidden rounded-full border-2 border-[#1D57A5]/20 bg-gray-50 shadow-inner">
                            {photoUrl ? (
                              <img src={photoUrl} alt="User" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-300">
                                <FiUser size={30} />
                              </div>
                            )}
                          </div>
                          <span className="inline-flex items-center rounded-full bg-[#1D57A5]/10 px-2 py-0.5 text-[10px] font-bold text-[#1D57A5] uppercase">
                            {section}
                          </span>
                          <p className="mt-1 text-base font-bold text-gray-800">{displayName}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-base font-bold text-gray-800 uppercase tracking-tight">{user?.role === "admin" ? "Administrator" : displayName}</p>
                          <span className="mt-1 inline-flex items-center rounded-full bg-[#1D57A5]/10 px-3 py-0.5 text-[10px] font-bold text-[#1D57A5] uppercase">
                            BSGUID: {detail?.bsg_uid || "ADM-001"}
                          </span>
                        </>
                      )}
                      <p className="text-xs text-gray-400 font-medium mt-1">{user?.email}</p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      {currentPage === "form" ? (
                        <button
                          onClick={() => { navigate(user?.role === "admin" ? "/admin-dashboard" : "/user-dashboard"); setProfileOpen(false); }}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D57A5] py-2 text-sm font-bold text-white shadow-md transition hover:bg-[#163f7a] active:scale-95"
                        >
                          Dashboard
                        </button>
                      ) : (
                        <button
                          onClick={() => { navigate("/form"); setProfileOpen(false); }}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D57A5] py-2 text-sm font-bold text-white shadow-md transition hover:bg-[#163f7a] active:scale-95"
                        >
                          {user?.role === "admin" ? "Admin Panel" : "Update Profile"}
                        </button>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100 active:scale-95"
                      >
                        <FiLogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Public mode — nav links */
              <>
                <div className="hidden items-center gap-1 md:flex">
                  {NAV_LINKS.map(({ label, href }) => (
                    <button
                      key={label}
                      onClick={() => navigate(href)}
                      className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white/90 transition-all duration-200 hover:bg-white/15 hover:text-white active:scale-95"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  className="ml-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20 md:hidden"
                  onClick={() => setMobileOpen((v) => !v)}
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile dropdown */}
        <div
          className={`mx-1 overflow-hidden rounded-b-xl bg-[#163f7a] transition-all duration-300 ${
            mobileOpen ? "max-h-64 py-2" : "max-h-0"
          }`}
        >
          {isUserPage ? (
            <div className="space-y-2 px-5 py-3">
              <p className="text-sm font-semibold text-white">{displayName}</p>
              {user?.role === "user" && (
                <button
                  onClick={() => {
                    handleUpdateProfile();
                    setMobileOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  <FiEdit size={14} /> Update Profile
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg bg-red-500/80 px-3 py-2 text-sm font-bold text-white transition hover:bg-red-600"
              >
                <FiLogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            NAV_LINKS.map(({ label, href }) => (
              <button
                key={label}
                onClick={() => {
                  navigate(href);
                  setMobileOpen(false);
                }}
                className="block w-full px-6 py-2.5 text-left text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
              >
                {label}
              </button>
            ))
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
