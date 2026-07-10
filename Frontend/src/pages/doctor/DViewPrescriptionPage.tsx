import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { getPrescriptionById, getConsultationReportByAppointmentId, revokePrescription } from "../../api/consultationApi";
import { ClipboardList, Calendar, User, ArrowLeft, ArrowRight, Briefcase, Clock, Pill, Printer, FileText, CheckCircle, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import getIcon from "../../helpers/getIcon";

export const DViewPrescriptionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState<any>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleRevoke = async () => {
    setRevoking(true);
    try {
      if (!id) return;
      const res = await revokePrescription(id);
      if (res.success) {
        toast.success("Prescription revoked successfully.");
        setPrescription((prev: any) => ({ ...prev, status: "Revoked" }));
      } else {
        toast.error(res.message || "Failed to revoke prescription.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to revoke prescription.");
    } finally {
      setRevoking(false);
      setIsConfirmModalOpen(false);
    }
  };

  useEffect(() => {
    const fetchPrescriptionData = async () => {
      try {
        if (!id) return;
        const res = await getPrescriptionById(id);
        if (res.success && res.data) {
          setPrescription(res.data);

          // Fetch linked consultation report
          try {
            const repRes = await getConsultationReportByAppointmentId(res.data.appointmentId);
            if (repRes.success && repRes.data) {
              setReportId(repRes.data.id);
            }
          } catch (err) {
            // Ignore if report does not exist
          }
        } else {
          toast.error(res.message || "Prescription not found.");
          navigate("/doctor/appointments");
        }
      } catch (error: any) {
        toast.error("Failed to load prescription.");
        navigate("/doctor/appointments");
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 space-y-6 w-full print:py-0 print:w-full font-sans">
      {/* Header / Actions bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden border-b border-gray-200/40 pb-4 md:border-b-0 md:pb-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              {/* <ClipboardList className="w-6 h-6 sm:w-8 sm:h-8 text-darkGreen shrink-0" /> */}
              <span>Medical Prescription</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
              Prescription ID: {prescription.id}
            </p>
          </div>
        </div>

        {/* Cross linking actions */}
        <div className="flex flex-wrap items-center gap-2 md:self-center self-start pl-12 md:pl-0">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-550" />
            <span>Print Rx</span>
          </button>

          <button
            onClick={() => navigate(`/doctor/appointments/${prescription.appointmentId}`)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>View Appointment</span>
          </button>

          {reportId ? (
            <button
              onClick={() => navigate(`/doctor/reports/${reportId}`)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-darkGreen hover:bg-darkGreen/90 text-white rounded-xl shadow-md transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>View Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-550 font-semibold px-3 py-2 bg-slate-100 dark:bg-slate-800/40 rounded-xl">
              No Report Linked
            </span>
          )}

          {prescription.status === "Valid" && (
            <button
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={revoking}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{revoking ? "Revoking..." : "Revoke Rx"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Prescription Invoice/Slip Card */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-lg rounded-3xl overflow-hidden print:border-none print:shadow-none">

        {/* Sleek Top Banner */}
        <div className="bg-gradient-to-r from-darkGreen to-emerald-600 dark:from-slate-850 dark:to-slate-800 px-6 py-5 sm:px-8 sm:py-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Pill className="w-7 h-7 shrink-0" />
              <span className="text-xl sm:text-2xl font-bold tracking-tight">Rx Prescription</span>
            </div>
            <p className="text-xs text-emerald-100 dark:text-slate-400 mt-1 uppercase tracking-widest font-semibold">
              HealthHub Consultation Outcome
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-[10px] font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-md border border-white/10 uppercase tracking-wider font-mono">
                No: {prescription.prescriptionNumber || "N/A"}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${prescription.status === "Revoked"
                  ? "bg-rose-500/20 text-rose-100 border-rose-500/30"
                  : prescription.status === "Expired"
                    ? "bg-amber-500/20 text-amber-100 border-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-100 border-emerald-500/30"
                }`}>
                {prescription.status || "Valid"}
              </span>
            </div>
          </div>
          <div className="text-left sm:text-right text-emerald-50 mt-1 sm:mt-0 space-y-0.5 shrink-0">
            <p className="text-xs">Date of Issue</p>
            <p className="font-bold text-sm text-white">
              {dayjs(prescription.createdAt).format("DD MMM YYYY")}
            </p>
          </div>
        </div>

        {/* Doctor and Patient Summary Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80">
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-sans">
              <Briefcase className="w-3.5 h-3.5 text-emerald-500" /> Prescribing Clinician
            </h4>
            <div>
              <p className="font-bold text-gray-800 dark:text-white text-base">
                Dr. {prescription.doctorName || "Unknown"}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-450 font-bold mt-0.5">
                {prescription.doctorSpecialization || "General Medicine"}
              </p>
            </div>
          </div>

          <div className="space-y-2 md:border-l md:border-slate-100 dark:md:border-slate-800 md:pl-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-darkGreen" /> Recipient / Patient
            </h4>
            <div>
              <p className="font-bold text-gray-800 dark:text-white text-base">
                {prescription.patientName || "Sarah Connor"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Registered HealthHub Member
              </p>
            </div>
          </div>
        </div>

        {/* Medicines List */}
        <div className="p-6 sm:p-8 space-y-6">
          <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Pill className="w-4 h-4 text-emerald-500" /> Medication Plan
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Medicine / Drug</th>
                  <th className="pb-3">Dosage</th>
                  <th className="pb-3">Frequency</th>
                  <th className="pb-3">Timing</th>
                  <th className="pb-3 pr-2">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {prescription.medicines.map((med: any, index: number) => (
                  <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="py-4 pl-2 font-bold text-slate-850 dark:text-white">
                      {med.medicine}
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-350">
                      {med.dosage}
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-350">
                      {med.frequency}
                    </td>
                    <td className="py-4">
                      <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${med.timing === "After Food"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        }`}>
                        {med.timing}
                      </span>
                    </td>
                    <td className="py-4 pr-2 font-bold text-slate-800 dark:text-slate-200">
                      {med.duration}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer of Rx (Sig) */}
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="text-xs text-slate-400 space-y-1 max-w-[400px]">
              <p className="font-bold uppercase tracking-wider text-[10px]">Important Note</p>
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

            <div className="flex items-center gap-4 bg-slate-50/30 dark:bg-slate-955/40 border border-slate-100/30 dark:border-slate-900/25 p-4 rounded-2xl shrink-0 min-w-[240px]">
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
                <p className="font-extrabold text-slate-800 dark:text-white text-sm">
                  Dr. {prescription.doctorName || "Unknown"}
                </p>
                <p className="text-[9px] text-slate-450 uppercase font-bold tracking-widest mt-0.5">
                  Digital Signature Verified
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleRevoke}
        title="Revoke Prescription"
        message="Are you sure you want to revoke this prescription? This action cannot be undone."
        confirmText={revoking ? "Revoking..." : "Revoke"}
        isDestructive={true}
      />
    </div>
  );
};

export default DViewPrescriptionPage;
