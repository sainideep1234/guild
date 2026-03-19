import React from "react";
import logo from "../assets/bsglogo.png";
import { getUploadUrl } from "../api/api";

const PrintTemplate = ({ detail, user, verification }) => {
  if (!detail) return null;

  const photoUrl = detail.photo_path ? getUploadUrl(detail.photo_path) : null;
  const aadhaarDocUrl = detail.adhar_doc_path
    ? getUploadUrl(detail.adhar_doc_path)
    : null;
  const certDocUrl = detail.rashtrapati_certificate_path
    ? getUploadUrl(detail.rashtrapati_certificate_path)
    : null;

  /* ── Shared cell styles ───────────────────────────────────────── */
  const labelCell =
    "px-3 py-2 text-xs font-bold text-gray-600 uppercase bg-[#F5F7FB] border-r border-b border-gray-300 flex items-center";
  const valueCell =
    "px-3 py-2 text-sm border-r border-b border-gray-300 flex items-center";
  const valueCellLast =
    "px-3 py-2 text-sm border-b border-gray-300 flex items-center";

  /* 4-column grid for paired rows */
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "120px 1fr 120px 1fr",
  };

  return (
    <>
      <style>
        {`
          @media print {
            @page { margin: 0; size: A4 portrait; }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body { margin: 0; }
            .print-template { font-size: 11px; }
          }
        `}
      </style>

      <div className="print-template hidden min-h-screen w-full bg-white font-sans text-black print:block">
        <div
          className="mx-auto"
          style={{ maxWidth: "210mm", padding: "8mm 10mm" }}
        >
          {/* ═══════════ HEADER ═══════════ */}
          <div
            className="grid border-b-4 border-[#1D57A5]"
            style={{
              gridTemplateColumns: "90px 1fr",
              gap: "16px",
              padding: "16px 20px",
              background: "#1D57A5",
            }}
          >
            <div className="flex items-center justify-center">
              <img
                src={logo}
                alt="BSG Logo"
                className="h-20 w-auto rounded bg-white p-1"
              />
            </div>
            <div className="flex flex-col justify-center text-right text-white">
              <h1 className="text-2xl leading-tight font-black tracking-wider uppercase">
                The Bharat Scouts and Guides
              </h1>
              <p className="mt-0.5 text-base font-semibold">
                National Headquarters, New Delhi
              </p>
              <p className="mt-0.5 text-xs opacity-80">
                Lakshmi Mazumdar Bhawan, 16 M.G. Marg, I.P. Estate, New Delhi –
                110002
              </p>
            </div>
          </div>

          {/* ═══════════ TITLE BAR ═══════════ */}
          <div
            className="border-b-2 border-[#1D57A5] py-2.5 text-center text-sm font-bold tracking-[0.2em] uppercase"
            style={{ background: "#EBF0F9", color: "#1D57A5" }}
          >
            Rashtrapati {detail.section || user?.section || "Scout/Guide"} Award
            — Guild Application Form
          </div>

          {/* ═══════════ TOP META (with Photo) ═══════════ */}
          <div className="grid" style={{ gridTemplateColumns: "1fr 160px" }}>
            {/* Left side: 4-column info grid */}
            <div style={gridStyle}>
              {/* Row 1: App No + Status */}
              <div className={labelCell}>App No.</div>
              <div className={valueCell + " font-semibold text-[#1D57A5]"}>
                {verification?.application_no || "—"}
              </div>
              <div className={labelCell}>Status</div>
              <div className={valueCellLast}>
                <span
                  className={`inline-block rounded py-0.5 text-xs font-black tracking-wide uppercase`}
                >
                  {verification?.status || "PENDING"}
                </span>
              </div>

              {/* Row 2: Full Name + Section */}
              <div className={labelCell}>Full Name</div>
              <div className={valueCell + " font-semibold"}>{detail.name}</div>
              <div className={labelCell}>Section</div>
              <div className={valueCellLast + " font-semibold"}>
                {detail.section || user?.section || "—"}
              </div>

              {/* Row 3: BSG State + BSG District */}
              <div className={labelCell}>BSG State</div>
              <div className={valueCell}>{detail.bsg_state || "—"}</div>
              <div className={labelCell}>BSG District</div>
              <div className={valueCellLast}>{detail.bsg_district || "—"}</div>

              {/* Row 4: Revenue State + Revenue District */}
              <div className={labelCell}>Rev. State</div>
              <div className={valueCell}>
                {detail.address?.revenue_state || "—"}
              </div>
              <div className={labelCell}>Rev. District</div>
              <div className={valueCellLast}>
                {detail.address?.revenue_district || "—"}
              </div>
            </div>

            {/* Right side: Passport Photo */}
            <div className="flex items-center justify-center border-b border-l-2 border-[#1D57A5] border-gray-300 bg-[#FAFBFD] p-3">
              <div className="flex h-[150px] w-[125px] items-center justify-center overflow-hidden border-2 border-gray-300 bg-white shadow-sm">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Applicant"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="px-2 text-center text-xs text-gray-400">
                    Passport
                    <br />
                    Photo
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ═══════════ SECTION 1 — Personal Details ═══════════ */}
          <div className="bg-[#1D57A5] px-4 py-1.5 text-xs font-bold tracking-widest text-white uppercase">
            Section 1 — Personal Details
          </div>

          <div style={gridStyle}>
            {/* Row 1 */}
            <div className={labelCell}>Email</div>
            <div className={valueCell + " break-all"}>
              {user?.email || detail.email || "—"}
            </div>
            <div className={labelCell}>Contact No.</div>
            <div className={valueCellLast}>
              {detail.mobile_no || user?.mobile_no || "—"}
            </div>

            {/* Row 2 */}
            <div className={labelCell}>Aadhaar No.</div>
            <div className={valueCell + " font-mono tracking-wide"}>
              {detail.aadhaar_no || "—"}
            </div>
            <div className={labelCell}>Date of Birth</div>
            <div className={valueCellLast}>{detail.dob || "—"}</div>

            {/* Row 3 */}
            <div className={labelCell}>Address</div>
            <div className={valueCell}>{detail.address?.house_no || "—"}</div>
            <div className={labelCell}>Pin Code</div>
            <div className={valueCellLast}>
              {detail.address?.pincode || "—"}
            </div>

            {/* Row 4 */}
            <div className={labelCell}>Qualification</div>
            <div className={valueCell}>
              {detail.highest_qualification || "—"}
            </div>
            <div className={labelCell}>Profession</div>
            <div className={valueCellLast}>
              {detail.professional_qualification || "—"}
            </div>

            {/* Row 5 */}
            <div className={labelCell}>T-Shirt Size</div>
            <div className={valueCell + " font-semibold"}>
              {detail.tshirt_size || "—"}
            </div>
            <div
              className="border-b border-gray-300"
              style={{ gridColumn: "span 2" }}
            ></div>
          </div>

          {/* ═══════════ SECTION 2 — Scouting / Guiding Details ═══════════ */}
          <div className="bg-[#1D57A5] px-4 py-1.5 text-xs font-bold tracking-widest text-white uppercase">
            Section 2 — Scouting / Guiding Details
          </div>

          <div style={gridStyle}>
            {/* Row 1 */}
            <div className={labelCell}>Section</div>
            <div className={valueCell + " font-semibold"}>
              {detail.section || user?.section || "—"}
            </div>
            <div className={labelCell}>Award Year</div>
            <div className={valueCellLast + " font-semibold"}>
              {detail.year_of_rastrapati || "—"}
            </div>

            {/* Row 2 */}
            <div className={labelCell}>Certificate No.</div>
            <div className={valueCell + " font-mono"}>
              {detail.certificate_no || "—"}
            </div>
            <div className={labelCell}>Souvenir</div>
            <div className={valueCellLast}>{detail.souvenir || "—"}</div>
          </div>

          {/* ═══════════ SECTION 3 — Uploaded Documents ═══════════ */}
          <div className="bg-[#1D57A5] px-4 py-1.5 text-xs font-bold tracking-widest text-white uppercase">
            Section 3 — Uploaded Documents
          </div>

          <div style={gridStyle}>
            <div className={labelCell}>Aadhaar Doc</div>
            <div className={valueCell}>
              {aadhaarDocUrl ? (
                <a
                  href={aadhaarDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#1D57A5] uppercase underline"
                >
                  Link
                </a>
              ) : (
                <span className="text-xs text-gray-400">Not uploaded</span>
              )}
            </div>
            <div className={labelCell}>RP Certificate</div>
            <div className={valueCellLast}>
              {certDocUrl ? (
                <a
                  href={certDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#1D57A5] uppercase underline"
                >
                  Link
                </a>
              ) : (
                <span className="text-xs text-gray-400">Not uploaded</span>
              )}
            </div>
          </div>

          {/* ═══════════ DECLARATION ═══════════ */}
          <div className="bg-[#1D57A5] px-4 py-1.5 text-xs font-bold tracking-widest text-white uppercase">
            Declaration
          </div>
          <div
            className="border-b border-gray-300 px-4 py-4 text-justify text-xs leading-relaxed"
            style={{ background: "#FCFCFD" }}
          >
            I, <strong>{detail.name}</strong>, hereby solemnly declare that all
            the information furnished above is true, complete, and correct to
            the best of my knowledge and belief. I understand that in the event
            of any information being found false or incorrect at any stage, my
            application / award is liable to be rejected / cancelled.
          </div>

          {/* ═══════════ SIGNATURE SECTION ═══════════ */}
          {/* <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "80px" }}>
            <div className="flex flex-col justify-between border-r border-b border-gray-300 px-4 py-3">
              <p className="text-xs font-semibold text-gray-500 uppercase">Date & Place</p>
              <div className="mt-auto mb-2 w-3/4 border-b border-dashed border-gray-400"></div>
            </div>
            <div className="flex flex-col justify-between border-b border-gray-300 px-4 py-3">
              <p className="text-xs font-semibold text-gray-500 uppercase">Signature of Applicant</p>
              <div className="mt-auto mb-2 ml-auto w-3/4 border-b border-dashed border-gray-400"></div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "70px" }}>
            <div className="flex flex-col justify-between border-r border-gray-300 bg-[#F5F7FB] px-4 py-3">
              <p className="text-xs font-semibold text-gray-500 uppercase">For Office Use Only</p>
              <div className="mt-auto mb-2 w-3/4 border-b border-dashed border-gray-400"></div>
            </div>
            <div className="flex flex-col justify-between bg-[#F5F7FB] px-4 py-3">
              <p className="text-xs font-semibold text-gray-500 uppercase">Authorized Signatory & Seal</p>
              <div className="mt-auto mb-2 ml-auto w-3/4 border-b border-dashed border-gray-400"></div>
            </div>
          </div> */}

          {/* ═══════════ FOOTER ═══════════ */}
          <div className="bg-[#1D57A5] py-1.5 text-center text-[9px] font-semibold tracking-wider text-white uppercase">
            The Bharat Scouts and Guides — National Headquarters, New Delhi
            &nbsp;|&nbsp; www.bsgindia.live
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintTemplate;
