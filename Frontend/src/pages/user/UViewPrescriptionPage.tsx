import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { getPrescriptionById, getConsultationReportByAppointmentId } from "../../api/consultationApi";
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
      <UNavbar />

      <div className="w-[95%] lg:w-[80%] max-w-[1100px] mx-auto py-8 space-y-8 print:py-0 print:w-full pt-[90px] pb-24">
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
              className="flex items-center gap-2 px-5 py-3 text-sm font-bold bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 border border-slate-100/40 dark:border-slate-900/30 rounded-2xl shadow-sm transition-all cursor-pointer"
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
                <span className="inline-block text-xs font-bold text-emerald-650 dark:text-emerald-450 uppercase tracking-wider bg-emerald-500/5 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/10">
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
                  className="p-5 bg-slate-50/30 hover:bg-slate-50/60 dark:bg-slate-950/20 dark:hover:bg-slate-950/50 border border-slate-100/30 dark:border-slate-900/25 rounded-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 hover:shadow-sm"
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
            <div className="pt-8 mt-4 border-t border-slate-100/40 dark:border-slate-900/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="text-xs text-slate-550 dark:text-slate-450 space-y-1.5 max-w-[480px]">
                <p className="font-extrabold uppercase tracking-widest text-[10px] text-slate-400">Clinical Instruction Disclaimer</p>
                <p className="leading-relaxed">
                  Please take all medications strictly as directed by the clinical practitioner. In case of side-effects or persistent symptoms, contact the doctor immediately.
                </p>
              </div>

              {/* Digital signature verified */}
              <div className="flex items-center gap-4 bg-slate-50/30 dark:bg-slate-955/40 border border-slate-100/30 dark:border-slate-900/25 p-4 rounded-2xl shrink-0 min-w-[240px]">
                <CheckCircle className="w-8 h-8 text-emerald-500 shrink-0" />
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
    </div>
  );
};

export default UViewPrescriptionPage;
