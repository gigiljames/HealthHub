import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { getConsultationReportById, getPrescriptionByAppointmentId } from "../../api/consultationApi";
import { FileText, Calendar, User, ArrowLeft, ArrowRight, ClipboardList, Briefcase, Clock, FileCheck } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";

export const UViewReportPage: React.FC = () => {
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
    <div className="w-[95%] lg:w-[80%] max-w-[1000px] mx-auto py-8 space-y-6 pt-[70px]">
      {/* Header / Actions bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white dark:bg-slate-900 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-350" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-darkGreen" />
              My Consultation Report
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Record ID: {report.id}
            </p>
          </div>
        </div>

        {/* Cross linking actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate(`/appointments/${report.appointmentId}`)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl transition-all"
          >
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>View Appointment</span>
          </button>

          {prescriptionId ? (
            <button
              onClick={() => navigate(`/prescriptions/${prescriptionId}`)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-darkGreen hover:bg-darkGreen/90 text-white rounded-xl shadow-md transition-all"
            >
              <ClipboardList className="w-4 h-4" />
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
              <User className="w-4 h-4 text-darkGreen" /> Patient Info
            </h3>
            <div>
              <p className="text-xs text-gray-500">Patient Name</p>
              <p className="font-bold text-gray-800 dark:text-white text-base mt-0.5">
                {report.patientName || "Sarah Connor"}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <p className="text-xs text-gray-500">Consultation Date</p>
              <p className="font-semibold text-gray-700 dark:text-slate-200 text-sm mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                {dayjs(report.createdAt).format("DD MMM YYYY, hh:mm A")}
              </p>
            </div>
          </div>

          {/* Doctor details */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-500" /> Consulting Provider
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
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm rounded-2xl p-6 md:p-8 space-y-6">

            {/* Chief Complaint */}
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Chief Complaint
              </h2>
              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                  "{report.chiefComplaint}"
                </p>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Diagnosis
              </h2>
              <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/10">
                <p className="text-sm text-slate-800 dark:text-slate-100 font-bold leading-relaxed">
                  {report.diagnosis}
                </p>
              </div>
            </div>

            {/* Clinical Notes */}
            {report.clinicalNotes && (
              <div className="space-y-2">
                <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Clinical Assessment & Notes
                </h2>
                <div className="p-4 bg-white dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {report.clinicalNotes}
                  </p>
                </div>
              </div>
            )}

            {/* Follow-up Plan */}
            {(report.followUpDate || report.followUpNotes) && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/60 space-y-4">
                <h2 className="text-sm font-bold text-amber-600 dark:text-amber-450 uppercase tracking-widest">
                  Follow-up Action Plan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {report.followUpDate && (
                    <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 rounded-xl">
                      <p className="text-xs text-amber-700 dark:text-amber-450 font-bold">Planned Return Date</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        {dayjs(report.followUpDate).format("DD MMM YYYY")}
                      </p>
                    </div>
                  )}
                  {report.followUpNotes && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-xl sm:col-span-1">
                      <p className="text-xs text-slate-405 font-bold">Instructions</p>
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

export default UViewReportPage;
