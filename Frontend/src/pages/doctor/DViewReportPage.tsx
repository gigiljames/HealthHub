import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { getConsultationReportById, getPrescriptionByAppointmentId } from "../../api/consultationApi";
import { FileText, Calendar, User, ArrowLeft, ArrowRight, ClipboardList, Briefcase, Clock, FileCheck } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import getIcon from "../../helpers/getIcon";

export const DViewReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        if (!id) return;
        const res = await getConsultationReportById(id);
        if (res.success && res.data) {
          setReport(res.data);

          // Fetch linked prescription by appointmentId
          try {
            const rxRes = await getPrescriptionByAppointmentId(res.data.appointmentId);
            if (rxRes.success && rxRes.data) {
              setPrescriptionId(rxRes.data.id);
            }
          } catch (err) {
            // Ignore if prescription does not exist
          }
        } else {
          toast.error(res.message || "Consultation report not found.");
          navigate("/doctor/appointments");
        }
      } catch (error: any) {
        toast.error("Failed to load consultation report.");
        navigate("/doctor/appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-darkGreen"></div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 space-y-6 w-full font-sans">
      {/* Header / Actions bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/40 pb-4 md:border-b-0 md:pb-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-705 dark:text-gray-300 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              {/* <FileCheck className="w-6 h-6 sm:w-8 sm:h-8 text-darkGreen shrink-0" /> */}
              <span>Consultation Report</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-505 dark:text-slate-400 mt-1">
              Record ID: {report.id}
            </p>
          </div>
        </div>

        {/* Cross linking actions */}
        <div className="flex flex-wrap items-center gap-2.5 md:self-center self-start pl-12 md:pl-0">
          <button
            onClick={() => navigate(`/doctor/appointments/${report.appointmentId}`)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4 text-emerald-550 shrink-0" />
            <span>View Appointment</span>
          </button>

          {prescriptionId ? (
            <button
              onClick={() => navigate(`/doctor/prescriptions/${prescriptionId}`)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-darkGreen hover:bg-darkGreen/90 text-white rounded-xl shadow-md transition-all cursor-pointer"
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span>View Prescription</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold px-3 py-2 bg-slate-100 dark:bg-slate-800/40 rounded-xl">
              No Prescription Linked
            </span>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Metadata */}
        <div className="md:col-span-1 space-y-6">
          {/* Patient summary */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <User className="w-4 h-4 text-darkGreen shrink-0" /> Patient Info
            </h3>
            <div>
              <p className="text-xs text-gray-500">Patient Name</p>
              <p className="font-bold text-gray-800 dark:text-white text-base mt-0.5">
                {report.patientName || "Sarah Connor"}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <p className="text-xs text-gray-500">Consultation Date</p>
              <p className="font-semibold text-gray-700 dark:text-slate-200 text-xs sm:text-sm mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                {dayjs(report.createdAt).format("DD MMM YYYY, hh:mm A")}
              </p>
            </div>
          </div>

          {/* Doctor details */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-500 shrink-0" /> Consulting Provider
            </h3>
            <div>
              <p className="text-xs text-gray-500">Doctor</p>
              <p className="font-bold text-gray-800 dark:text-white text-sm mt-0.5">
                Dr. {report.doctorName || "Unknown Doctor"}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <p className="text-xs text-gray-500">Specialization</p>
              <span className="inline-block text-[11px] font-bold px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-500/20 mt-1">
                {report.doctorSpecialization || "General Practitioner"}
              </span>
            </div>
          </div>
        </div>

        {/* Right column - Clinical Data */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm rounded-2xl p-5 sm:p-6 md:p-8 space-y-6">

            {/* Chief Complaint */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Chief Complaint
              </h2>
              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-800 dark:text-slate-200 font-semibold leading-relaxed break-words">
                  "{report.chiefComplaint}"
                </p>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Diagnosis
              </h2>
              <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/10">
                <p className="text-sm text-slate-800 dark:text-slate-100 font-bold leading-relaxed break-words">
                  {report.diagnosis}
                </p>
              </div>
            </div>

            {/* Clinical Notes */}
            {report.clinicalNotes && (
              <div className="space-y-2">
                <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Clinical Assessment & Notes
                </h2>
                <div className="p-4 bg-white dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line break-words">
                    {report.clinicalNotes}
                  </p>
                </div>
              </div>
            )}

            {/* Follow-up Plan */}
            {(report.followUpDate || report.followUpNotes) && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/60 space-y-4">
                <h2 className="text-xs font-bold text-amber-600 dark:text-amber-450 uppercase tracking-widest">
                  Follow-up Action Plan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {report.followUpDate && (
                    <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 rounded-xl">
                      <p className="text-xs text-amber-700 dark:text-amber-450 font-bold">Planned Return Date</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                        {dayjs(report.followUpDate).format("DD MMM YYYY")}
                      </p>
                    </div>
                  )}
                  {report.followUpNotes && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-xl sm:col-span-1">
                      <p className="text-xs text-slate-400 font-bold">Instructions</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-1 whitespace-pre-line">
                        {report.followUpNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default DViewReportPage;
