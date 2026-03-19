import React from "react";
import logo from "../assets/bsglogo.png";
import { getUploadUrl } from "../api/api";

const PrintTemplate = ({ detail, user, verification }) => {
  if (!detail) return null;

  const photoUrl = detail.photo_path ? getUploadUrl(detail.photo_path) : null;
  const aadhaarDocUrl = detail.adhar_doc_path ? getUploadUrl(detail.adhar_doc_path) : null;
  const certDocUrl = detail.rashtrapati_certificate_path ? getUploadUrl(detail.rashtrapati_certificate_path) : null;

  const Row = ({ label1, value1, label2, value2 }) => (
    <div className="flex border-b border-black">
      <div className="flex w-1/2 min-h-12">
        <div className="w-1/3 border-r border-black p-3 font-bold text-sm bg-gray-50/50">{label1}</div>
        <div className="w-2/3 border-r border-black p-3 text-sm">{value1}</div>
      </div>
      <div className="flex w-1/2 min-h-12">
        <div className="w-1/3 border-r border-black p-3 font-bold text-sm bg-gray-50/50">{label2}</div>
        <div className="w-2/3 p-3 text-sm">{value2}</div>
      </div>
    </div>
  );

  return (
    <>
      <style>
        {`
          @media print {
            @page { margin: 0; }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body {
              margin: 1cm;
            }
          }
        `}
      </style>
      <div className="hidden print:block w-full bg-white text-black p-8 font-serif min-h-screen">
      <div className="flex flex-col border-[3px] border-[#1D57A5] min-h-[90vh]">
          <div className="flex items-center justify-between bg-[#1D57A5] text-white p-6">
            <img src={logo} alt="BSG Logo" className="h-28 w-auto bg-white p-1 rounded" />
            <div className="flex-1 text-right pl-4">
              <h1 className="text-3xl font-black uppercase tracking-wider text-right">The Bharat Scouts and Guides</h1>
              <p className="text-xl font-semibold text-right mt-1">Creating - Better India</p>
              <p className="text-sm text-right">Since 1909</p>
            </div>
          </div>

          <div className="bg-white border-t-2 border-[#1D57A5] text-[#1D57A5] py-4 text-center text-2xl font-bold uppercase tracking-widest">
            Rashtrapati Award Application Form - {detail.section || user?.section || "SECTION"}
          </div>

          {/* Top Section with Photo */}
          <div className="flex border-t-[3px] border-[#1D57A5]">
            <div className="flex flex-col w-3/4">
              <div className="flex border-b border-black min-h-12">
                <div className="w-1/2 border-r border-black flex items-center p-3 text-sm">
                  <span className="font-bold mr-3 uppercase text-xs">App No:</span> {verification?.application_no || "N/A"}
                </div>
                <div className="w-1/2 border-r border-black flex items-center p-3 text-sm capitalize">
                  <span className="font-bold mr-3 uppercase text-xs">Status:</span> {verification?.status || "PENDING"}
                </div>
              </div>
              <div className="flex border-b border-black min-h-12">
                <div className="w-full border-r border-black flex items-center p-3 text-sm">
                  <span className="font-bold mr-3 uppercase text-xs">Full Name:</span> {detail.name}
                </div>
              </div>
              <div className="flex border-b border-black min-h-12">
                <div className="w-1/2 border-r border-black flex items-center p-3 text-sm">
                  <span className="font-bold mr-3 uppercase text-xs">BSG State:</span> {detail.bsg_state}
                </div>
                <div className="w-1/2 border-r border-black flex items-center p-3 text-sm">
                  <span className="font-bold mr-3 uppercase text-xs">BSG Dist:</span> {detail.bsg_district}
                </div>
              </div>
              <div className="flex min-h-12">
                <div className="w-1/2 border-r border-black flex items-center p-3 text-sm">
                  <span className="font-bold mr-3 uppercase text-xs">Rev State:</span> {detail.address?.revenue_state}
                </div>
                <div className="w-1/2 border-r border-black flex items-center p-3 text-sm">
                  <span className="font-bold mr-3 uppercase text-xs">Rev Dist:</span> {detail.address?.revenue_district}
                </div>
              </div>
            </div>
            <div className="w-1/4 flex items-center justify-center p-3 border-l-2 border-[#1D57A5]">
              <div className="w-40 h-48 border-2 border-gray-300 flex items-center justify-center bg-gray-100 overflow-hidden shadow-sm">
                {photoUrl ? (
                  <img src={photoUrl} alt="Applicant" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-sm">Photo</span>
                )}
              </div>
            </div>
          </div>



          {/* Section 1 */}
          <div className="bg-gray-100 p-2 border-t-[3px] border-b-2 border-[#1D57A5] font-bold text-sm text-[#1D57A5] uppercase tracking-wider">
            1. Personal Details
          </div>
          <Row label1="Email:" value1={user?.email || detail.email} label2="Contact Number:" value2={detail.mobile_no || user?.mobile_no} />
          <Row label1="Aadhaar No:" value1={detail.aadhaar_no} label2="Date Of Birth:" value2={detail.dob} />
          <Row label1="Address:" value1={detail.address?.house_no} label2="Pin Code:" value2={detail.address?.pincode} />
          <Row label1="Qualification:" value1={detail.highest_qualification} label2="T-Shirt Size:" value2={detail.tshirt_size} />
          <div className="flex border-b border-black">
             <div className="flex w-1/2 min-h-12">
                <div className="w-1/3 border-r border-black p-3 font-bold text-sm bg-gray-50/50">Profession:</div>
                <div className="w-2/3 border-r border-black p-3 text-sm">{detail.professional_qualification}</div>
             </div>
             <div className="flex w-1/2 min-h-12 bg-gray-50/20"></div>
          </div>

          {/* Section 2 */}
          <div className="bg-gray-100 p-2 border-t-[3px] border-b-2 border-[#1D57A5] font-bold text-sm text-[#1D57A5] uppercase tracking-wider">
            2. Details of Scouting / Guiding
          </div>
          <Row label1="Section:" value1={detail.section || user?.section} label2="Year of Award:" value2={detail.year_of_rastrapati} />
          <Row label1="Certificate Number:" value1={detail.certificate_no} label2="Souvenir Required:" value2={detail.souvenir} />

          {/* Section 3 — Documents */}
          <div className="bg-gray-100 p-2 border-t-[3px] border-b-2 border-[#1D57A5] font-bold text-sm text-[#1D57A5] uppercase tracking-wider">
            3. Uploaded Documents
          </div>
          <div className="flex border-b border-black min-h-12">
            <div className="w-1/6 border-r border-black p-3 font-bold text-sm bg-gray-50/50">Aadhaar Doc:</div>
            <div className="w-5/6 p-3 text-sm">
              {aadhaarDocUrl ? (
                <a href={aadhaarDocUrl} target="_blank" rel="noopener noreferrer" className="text-[#1D57A5] underline font-black">
                  VIEW DOCUMENT LINK
                </a>
              ) : "Not uploaded"}
            </div>
          </div>
          <div className="flex border-b border-black min-h-12">
            <div className="w-1/6 border-r border-black p-3 font-bold text-sm bg-gray-50/50">Certificate:</div>
            <div className="w-5/6 p-3 text-sm">
              {certDocUrl ? (
                <a href={certDocUrl} target="_blank" rel="noopener noreferrer" className="text-[#1D57A5] underline font-black">
                  VIEW CERTIFICATE LINK
                </a>
              ) : "Not uploaded"}
            </div>
          </div>

          <div className="flex-1 p-6 border-t-[3px] border-[#1D57A5] text-sm text-justify italic bg-gray-50/30">
            <span className="font-bold mr-2 uppercase not-italic">Declaration:</span>
            I hereby declare that all the information furnished above is true, complete and correct to the best of my knowledge and belief. I understand that in the event of any information being found false or incorrect at any stage, my application/award is liable to be rejected/cancelled.
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintTemplate;
