import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { getPrescriptionById, getConsultationReportByAppointmentId } from "../../api/consultationApi";
import { ClipboardList, Calendar, User, ArrowLeft, ArrowRight, Briefcase, Clock, Pill, Printer, FileText } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";

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
          navigate("/appointments");
        }
      } catch (error: any) {
        toast.error("Failed to load prescription.");
        navigate("/appointments");
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
    <div className="w-[95%] lg:w-[80%] max-w-[1000px] mx-auto py-8 space-y-6 print:py-0 print:w-full pt-[70px]">
      {/* Header / Actions bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden pt-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white dark:bg-slate-900 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-350" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-darkGreen" />
              My Prescription
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Prescription ID: {prescription.id}
            </p>
          </div>
        </div>

        {/* Cross linking actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl transition-all"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Rx</span>
          </button>

          <button
            onClick={() => navigate(`/appointments/${prescription.appointmentId}`)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl transition-all"
          >
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>View Appointment</span>
          </button>

          {reportId ? (
            <button
              onClick={() => navigate(`/reports/${reportId}`)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-darkGreen hover:bg-darkGreen/90 text-white rounded-xl shadow-md transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>View Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold px-3 py-2 bg-slate-100 dark:bg-slate-800/40 rounded-xl">
              No Report Linked
            </span>
          )}
        </div>
      </div>

      {/* Prescription Slip Card */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-lg rounded-3xl overflow-hidden print:border-none print:shadow-none">

        {/* Sleek Top Banner */}
        <div className="bg-gradient-to-r from-darkGreen to-emerald-600 dark:from-slate-850 dark:to-slate-800 px-8 py-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Pill className="w-7 h-7" />
              <span className="text-2xl font-bold tracking-tight">Rx Prescription</span>
            </div>
            <p className="text-xs text-emerald-100 dark:text-slate-400 mt-1 uppercase tracking-widest font-semibold">
              HealthHub Consultation Outcome
            </p>
          </div>
          <div className="text-left sm:text-right text-emerald-55 mt-1 sm:mt-0 space-y-0.5">
            <p className="text-xs">Date of Issue</p>
            <p className="font-bold text-sm">
              {dayjs(prescription.createdAt).format("DD MMM YYYY")}
            </p>
          </div>
        </div>

        {/* Doctor and Patient Summary Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80">
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-500" /> Prescribing Clinician
            </h4>
            <div>
              <p className="font-bold text-gray-800 dark:text-white text-base">
                Dr. {prescription.doctorName || "Unknown"}
              </p>
              <p className="text-xs text-emerald-650 dark:text-emerald-450 font-bold mt-0.5">
                {prescription.doctorSpecialization || "General Medicine"}
              </p>
            </div>
          </div>

          <div className="space-y-3 md:border-l md:border-slate-100 dark:md:border-slate-800 md:pl-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-darkGreen" /> Recipient / Patient
            </h4>
            <div>
              <p className="font-bold text-gray-800 dark:text-white text-base">
                {prescription.patientName || "Sarah Connor"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Registered HealthHub Member
              </p>
            </div>
          </div>
        </div>

        {/* Medicines List */}
        <div className="p-8 space-y-6">
          <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Pill className="w-4 h-4 text-emerald-500" /> Medication Plan
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
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
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
            <div className="text-xs text-slate-450 space-y-1">
              <p className="font-bold uppercase tracking-wider text-[10px]">Important Note</p>
              <p className="max-w-[400px]">
                Please take all medications strictly as directed by the clinical practitioner. In case of side-effects or persistent symptoms, contact the doctor immediately.
              </p>
            </div>
            <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 sm:pl-6 pt-4 sm:pt-0 shrink-0 min-w-[200px]">
              <div className="font-bold text-slate-800 dark:text-white italic text-base leading-none">
                Dr. {prescription.doctorName || "Unknown"}
              </div>
              <div className="h-0.5 bg-slate-300 dark:bg-slate-700 w-32 ml-auto my-2.5 print:block hidden"></div>
              <p className="text-[10px] text-slate-450 uppercase font-bold tracking-widest">
                Digital Signature Verified
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UViewPrescriptionPage;
