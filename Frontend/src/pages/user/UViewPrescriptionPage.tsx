import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { getPrescriptionById } from "../../api/consultationApi";
import { ClipboardList, User, ArrowLeft, ArrowRight, Briefcase, Clock, Pill, Printer, FileText, CheckCircle } from "lucide-react";
import dayjs from "dayjs";
import UNavbar from "../../components/user/UNavbar";

export const UViewPrescriptionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState<any>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptionData = async () => {
      try {
        if (!id) return;
        const res = await getPrescriptionById(id);
        if (res.success && res.data) {
          setPrescription(res.data);
          if (res.data.consultationReportId) {
            setReportId(res.data.consultationReportId);
          }
        } else {
          navigate("/404");
        }
      } catch (error: any) {
        if (error.response?.status === 403) {
          navigate("/403");
        } else {
          navigate("/404");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptionData();
  }, [id, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-darkGreen"></div>
      </div>
    );
  }

  if (!prescription) return null;

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 0mm; /* Completely removes browser default headers & footers (Page URL) */
          }
          body {
            background: white !important;
            color: black !important;
            margin: 0px !important;
          }
          nav, header, footer, button, .no-print, [class*="print:hidden"], [class*="fixed"], .fixed {
            display: none !important;
          }
          .print-page-padding {
            padding: 15mm 15mm 15mm 15mm !important;
          }
        }
      `}</style>

      <div className="print:hidden no-print">
        <UNavbar />
      </div>

      {/* WEB VIEW (SCREEN ONLY) */}
      <div className="w-[95%] lg:w-[80%] max-w-[1100px] mx-auto py-8 space-y-8 print:hidden pt-[90px] pb-24">
        {/* Header & Navigation Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden pt-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100/40 dark:border-slate-900/30 text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ClipboardList className="w-7 h-7 text-darkGreen dark:text-emerald-500 animate-pulse" />
                Prescription Details
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                Prescription ID: {prescription.id}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-3 text-sm font-bold bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-770 dark:text-slate-350 border border-slate-100/40 dark:border-slate-900/30 rounded-2xl shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4.5 h-4.5" />
              <span>Print Rx</span>
            </button>

            <button
              onClick={() => navigate(`/appointments/${prescription.appointmentId}`)}
              className="flex items-center gap-2 px-5 py-3 text-sm font-bold bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-750 dark:text-slate-250 border border-slate-100/40 dark:border-slate-900/30 rounded-2xl shadow-sm transition-all cursor-pointer"
            >
              <Clock className="w-4.5 h-4.5 text-emerald-500" />
              <span>View Appointment</span>
            </button>

            {reportId ? (
              <button
                onClick={() => navigate(`/reports/${reportId}`)}
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold bg-darkGreen hover:bg-darkGreen/90 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <FileText className="w-4.5 h-4.5" />
                <span>View Report</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
            ) : (
              <span className="text-xs text-slate-400 dark:text-slate-550 font-bold px-4 py-3 bg-slate-100 dark:bg-slate-800/40 rounded-2xl">
                No Report Linked
              </span>
            )}
          </div>
        </div>

        {/* Prescription Details Card Wrapper */}
        <div className="bg-white dark:bg-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100/40 dark:border-slate-900/20 rounded-3xl overflow-hidden print:border-none print:shadow-none">

          {/* Top banner / header */}
          <div className="bg-gradient-to-r from-darkGreen to-emerald-600 dark:from-slate-800 dark:to-slate-750 px-8 py-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <Pill className="w-8 h-8 text-emerald-350" />
                <span className="text-3xl font-extrabold tracking-tight">Rx Prescription</span>
              </div>
              <p className="text-xs text-emerald-100/80 dark:text-slate-350 mt-1 uppercase tracking-widest font-semibold">
                HealthHub Electronic Health Record
              </p>
              <div className="flex flex-wrap items-center gap-2.5 mt-3">
                <span className="text-[10px] font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-md border border-white/10 uppercase tracking-wider">
                  No: {prescription.prescriptionNumber || "N/A"}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${prescription.status === "Revoked"
                  ? "bg-rose-500/20 text-rose-105 border-rose-500/30"
                  : prescription.status === "Expired"
                    ? "bg-amber-500/20 text-amber-105 border-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-105 border-emerald-500/30"
                  }`}>
                  {prescription.status || "Valid"}
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right text-emerald-100 space-y-1">
              <p className="text-xs uppercase tracking-wider font-bold text-emerald-250">Date of Issue</p>
              <p className="font-extrabold text-lg text-white">
                {dayjs(prescription.createdAt).format("DD MMM YYYY")}
              </p>
            </div>
          </div>

          {/* Grid for Doctor & Patient details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50/40 dark:bg-slate-900/20 border-b border-slate-100/30 dark:border-slate-900/30">
            <div className="flex gap-4">
              <div className="p-3.5 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 rounded-2xl h-fit border border-emerald-500/5">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest">
                  Prescribing Doctor
                </h4>
                <p className="font-extrabold text-slate-900 dark:text-white text-lg leading-snug">
                  Dr. {prescription.doctorName || "Unknown Doctor"}
                </p>
                <span className="inline-block text-xs font-bold text-emerald-600 dark:text-emerald-450 uppercase tracking-wider bg-emerald-500/5 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/10">
                  {prescription.doctorSpecialization || "General Medicine"}
                </span>
              </div>
            </div>

            <div className="flex gap-4 md:border-l md:border-slate-100/30 dark:md:border-slate-900/30 md:pl-8">
              <div className="p-3.5 bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-450 rounded-2xl h-fit border border-indigo-500/5">
                <User className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest">
                  Recipient Patient
                </h4>
                <p className="font-extrabold text-slate-900 dark:text-white text-lg leading-snug">
                  {prescription.patientName || "Sarah Connor"}
                </p>
                <p className="text-sm text-slate-550 dark:text-slate-400 font-semibold">
                  Registered HealthHub Member
                </p>
              </div>
            </div>
          </div>

          {/* Medicines Plan List */}
          <div className="p-8 space-y-6">
            <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-500" /> Medication Plan
            </h3>

            {/* Premium Card-based list for medicines */}
            <div className="flex flex-col gap-4">
              {prescription.medicines.map((med: any, index: number) => (
                <div
                  key={index}
                  className="p-5 bg-slate-50/30 hover:bg-slate-50/60 dark:bg-slate-955/20 dark:hover:bg-slate-955/50 border border-slate-100/30 dark:border-slate-900/25 rounded-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 hover:shadow-sm"
                >
                  {/* Medicine Name */}
                  <div className="flex items-center gap-4 md:w-1/3">
                    <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-450 rounded-xl">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug">
                        {med.medicine}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 font-bold">MEDICATION #{index + 1}</p>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-semibold">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 dark:text-slate-550 uppercase tracking-widest block font-bold">Dosage</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold text-sm">{med.dosage}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 dark:text-slate-550 uppercase tracking-widest block font-bold">Frequency</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold text-sm">{med.frequency}</span>
                    </div>
                    <div className="space-y-0.5 col-span-1">
                      <span className="text-[10px] text-slate-400 dark:text-slate-550 uppercase tracking-widest block font-bold">Timing</span>
                      <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full mt-0.5 ${med.timing === "After Food"
                        ? "bg-amber-500/5 text-amber-600 dark:text-amber-400 border border-amber-500/15"
                        : "bg-blue-500/5 text-blue-600 dark:text-blue-400 border border-blue-500/15"
                        }`}>
                        {med.timing}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 dark:text-slate-550 uppercase tracking-widest block font-bold">Duration</span>
                      <span className="text-slate-900 dark:text-white font-extrabold text-sm">{med.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer and Signatures */}
            <div className="pt-8 mt-4 border-t border-slate-100/40 dark:border-slate-900/30 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="text-xs text-slate-550 dark:text-slate-450 space-y-1.5 max-w-[420px]">
                <p className="font-extrabold uppercase tracking-widest text-[10px] text-slate-400">Clinical Instruction Disclaimer</p>
                <p className="leading-relaxed">
                  Please take all medications strictly as directed by the clinical practitioner. In case of side-effects or persistent symptoms, contact the doctor immediately.
                </p>
              </div>

              {/* QR Code and Verification Instruction */}
              {prescription.verificationToken && (
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(
                      `${window.location.origin}/prescription/verify/${prescription.verificationToken}`
                    )}`}
                    alt="Verification QR Code"
                    className="w-20 h-20 object-contain bg-white p-1 rounded-lg shadow-sm"
                  />
                  <div className="max-w-[140px]">
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold leading-snug">
                      Verify this prescription by scanning the QR code.
                    </p>
                  </div>
                </div>
              )}

              {/* Digital signature verified */}
              <div className="flex items-center gap-4 bg-slate-50/30 dark:bg-slate-950/40 border border-slate-100/30 dark:border-slate-900/25 p-4 rounded-2xl shrink-0 min-w-[240px]">
                {prescription.signatureUrl ? (
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200 max-w-[100px] shadow-sm">
                    <img
                      src={prescription.signatureUrl}
                      alt="Doctor Signature"
                      className="max-h-12 object-contain"
                    />
                  </div>
                ) : (
                  <CheckCircle className="w-8 h-8 text-emerald-500 shrink-0" />
                )}
                <div>
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                    Dr. {prescription.doctorName || "Unknown"}
                  </p>
                  <p className="text-[9px] text-emerald-600 dark:text-emerald-450 uppercase font-extrabold tracking-widest mt-0.5">
                    Digitally Signed & Verified
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* PRINT-ONLY COMPACT SINGLE PAGE LAYOUT */}
      <div className="hidden print:block w-full text-slate-900 bg-white font-sans text-[11px] p-2 leading-relaxed print-page-padding">
        {/* Branding & Letterhead */}
        <div className="flex justify-between items-start border-b-2 border-emerald-600 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded flex items-center justify-center text-white font-bold text-base">
              <img src="/HealthHub_logo.png" alt="" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-slate-900">HealthHub</h2>
              <p className="text-[8px] text-slate-500 uppercase tracking-widest font-semibold">Digital Healthcare Portal</p>
            </div>
          </div>

          <div className="text-right space-y-0.5">
            <h1 className="text-sm font-extrabold text-slate-955">Dr. {prescription.doctorName || "Unknown Doctor"}</h1>
            <p className="text-[9px] text-slate-700 font-semibold leading-tight">
              {prescription.doctorQualifications || "MBBS / Medical Practitioner"}
            </p>
            <p className="text-[9px] text-slate-600">{prescription.doctorSpecialization || "General Medicine"}</p>
            <p className="text-[8px] text-slate-500 font-bold">
              Email: {prescription.doctorEmail || "info@healthhub.com"}
            </p>
            {prescription.doctorPhone && (
              <p className="text-[8px] text-slate-500 font-bold">Phone: {prescription.doctorPhone}</p>
            )}
          </div>
        </div>

        {/* Organization / Location details */}
        {prescription.organizationName && (
          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl mb-4 text-[9px] leading-snug">
            <p className="font-bold text-slate-800">Practice Clinic / Location:</p>
            <p className="font-extrabold text-slate-950 mt-0.5 text-[10px]">{prescription.organizationName}</p>
            <p className="text-slate-600 font-medium mt-0.5">{prescription.organizationAddress}</p>
          </div>
        )}

        {/* Patient and Issue Details Info Box */}
        <div className="grid grid-cols-2 gap-3 border border-slate-150 p-2.5 rounded-xl mb-4 bg-slate-50/50">
          <div className="space-y-0.5">
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Patient Recipient</span>
            <span className="font-extrabold text-slate-950 text-xs">{prescription.patientName}</span>
          </div>
          <div className="space-y-0.5 text-right">
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Date of Issue</span>
            <span className="font-extrabold text-slate-950 text-[11px]">
              {dayjs(prescription.createdAt).format("DD MMM YYYY")}
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Rx Number</span>
            <span className="font-bold text-slate-800 text-[10px]">{prescription.prescriptionNumber || "N/A"}</span>
          </div>
          <div className="space-y-0.5 text-right">
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Status</span>
            <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded ${prescription.status === "Revoked"
              ? "bg-rose-100 text-rose-800 border border-rose-200"
              : "bg-emerald-100 text-emerald-800 border border-emerald-250"
              }`}>
              {prescription.status || "Valid"}
            </span>
          </div>
        </div>

        {/* Medication Table */}
        <div className="mb-5">
          <h3 className="text-[9px] font-bold text-slate-450 uppercase tracking-widest mb-2 border-b pb-1">
            Prescribed Medication Plan
          </h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[8px] text-slate-400 uppercase tracking-wider">
                <th className="py-1.5 font-bold w-1/3">Medicine Name</th>
                <th className="py-1.5 font-bold">Dosage</th>
                <th className="py-1.5 font-bold">Frequency</th>
                <th className="py-1.5 font-bold">Timing</th>
                <th className="py-1.5 font-bold text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prescription.medicines.map((med: any, index: number) => (
                <tr key={index} className="text-slate-800 text-[10px] font-semibold">
                  <td className="py-2 font-extrabold text-slate-950">{med.medicine}</td>
                  <td className="py-2 text-slate-700">{med.dosage}</td>
                  <td className="py-2 text-slate-700">{med.frequency}</td>
                  <td className="py-2">
                    <span className="px-1.5 py-0.5 text-[8px] font-bold bg-slate-50 border border-slate-200 rounded text-slate-700">
                      {med.timing}
                    </span>
                  </td>
                  <td className="py-2 text-right font-extrabold text-slate-950">{med.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Clinical Disclaimer */}
        <div className="text-[8.5px] text-slate-500 border-t pt-2.5 mb-5 leading-normal">
          <span className="font-bold uppercase tracking-wider text-[8px] text-slate-400 block mb-0.5">Clinical Disclaimer</span>
          Please take all medications strictly as directed by the clinical practitioner. In case of side-effects or persistent symptoms, contact the prescribing physician immediately.
        </div>

        {/* Verification QR Code and Signature */}
        <div className="flex justify-between items-end border-t pt-3">
          {prescription.verificationToken && (
            <div className="flex items-center gap-2">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=72x72&data=${encodeURIComponent(
                  `${window.location.origin}/prescription/verify/${prescription.verificationToken}`
                )}`}
                alt="Verification QR Code"
                className="w-14 h-14 object-contain bg-white border p-0.5 rounded shadow-sm"
              />
              <div className="max-w-[150px] leading-tight">
                <p className="text-[8.5px] font-bold text-slate-850">Scan to Verify Rx Authenticity</p>
                <p className="text-[7.5px] text-slate-500 mt-0.5">
                  Secure digital signature verification powered by HealthHub.
                </p>
              </div>
            </div>
          )}

          <div className="text-right space-y-0.5 shrink-0">
            {prescription.signatureUrl ? (
              <div className="inline-block bg-white p-1 rounded border border-slate-150 max-w-[80px] shadow-sm mb-1">
                <img
                  src={prescription.signatureUrl}
                  alt="Doctor Signature"
                  className="max-h-8 object-contain mx-auto"
                />
              </div>
            ) : (
              <div className="w-8 h-8 border border-slate-200 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-1 text-[11px] font-bold">
                ✓
              </div>
            )}
            <p className="font-extrabold text-slate-955 text-[10px]">Dr. {prescription.doctorName || "Unknown Doctor"}</p>
            <p className="text-[8px] text-emerald-700 uppercase font-extrabold tracking-widest leading-none">
              Digitally Signed & Verified
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UViewPrescriptionPage;
