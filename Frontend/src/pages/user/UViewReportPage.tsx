import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { getConsultationReportById } from "../../api/consultationApi";
import { Calendar, User, ArrowLeft, ArrowRight, ClipboardList, Briefcase, Clock, FileCheck } from "lucide-react";
import dayjs from "dayjs";
import UNavbar from "../../components/user/UNavbar";

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
          if (res.data.prescriptionId) {
            setPrescriptionId(res.data.prescriptionId);
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
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      <UNavbar />

      <div className="w-[95%] lg:w-[80%] max-w-[1100px] mx-auto py-8 space-y-8 pt-[90px] pb-24">
        {/* Header / Actions bar */}
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
                <FileCheck className="w-7 h-7 text-darkGreen dark:text-emerald-500 animate-pulse" />
                Consultation Report
              </h1>
              <p className="text-sm text-slate-550 dark:text-slate-400 mt-1 font-semibold">
                Record ID: {report.id}
              </p>
            </div>
          </div>

          {/* Cross linking actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate(`/appointments/${report.appointmentId}`)}
              className="flex items-center gap-2 px-5 py-3 text-sm font-bold bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-750 dark:text-slate-250 border border-slate-100/40 dark:border-slate-900/30 rounded-2xl shadow-sm transition-all cursor-pointer"
            >
              <Clock className="w-4.5 h-4.5 text-emerald-500" />
              <span>View Appointment</span>
            </button>

            {prescriptionId ? (
              <button
                onClick={() => navigate(`/prescriptions/${prescriptionId}`)}
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold bg-darkGreen hover:bg-darkGreen/90 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <ClipboardList className="w-4.5 h-4.5" />
                <span>View Prescription</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-xs text-slate-400 dark:text-slate-555 font-bold px-4 py-3 bg-slate-100 dark:bg-slate-800/40 rounded-2xl">
                No Prescription Linked
              </span>
            )}
          </div>
        </div>

        {/* Main Vertical Stack */}
        <div className="flex flex-col gap-8">
          {/* Top Metadata Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-slate-900 border border-slate-100/40 dark:border-slate-900/20 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-3xl p-6 md:p-8">
            {/* Patient summary */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest flex items-center gap-2">
                <User className="w-4.5 h-4.5 text-indigo-500" /> Patient Info
              </h3>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-550 font-bold">Patient Name</p>
                <p className="font-extrabold text-slate-900 dark:text-white text-lg mt-1">
                  {report.patientName || "Sarah Connor"}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100/40 dark:border-slate-900/30">
                <p className="text-xs text-slate-400 dark:text-slate-555 font-bold">Consultation Date</p>
                <p className="font-bold text-slate-700 dark:text-slate-350 text-sm mt-1 flex items-center gap-1.5">
                  <Calendar className="w-4.5 h-4.5 text-slate-400" />
                  {dayjs(report.createdAt).format("DD MMM YYYY, hh:mm A")}
                </p>
              </div>
            </div>

            {/* Doctor details */}
            <div className="space-y-4 md:border-l md:border-slate-100/40 dark:md:border-slate-900/30 md:pl-8">
              <h3 className="text-xs font-extrabold text-slate-400 dark:text-slate-555 uppercase tracking-widest flex items-center gap-2">
                <Briefcase className="w-4.5 h-4.5 text-emerald-500" /> Consulting Provider
              </h3>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-555 font-bold">Doctor</p>
                <p className="font-extrabold text-slate-900 dark:text-white text-base mt-1">
                  Dr. {report.doctorName || "Unknown Doctor"}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100/40 dark:border-slate-900/30">
                <p className="text-xs text-slate-400 dark:text-slate-555 font-bold">Specialization</p>
                <span className="inline-block text-xs font-bold px-3 py-1 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-500/10 mt-1">
                  {report.doctorSpecialization || "General Practitioner"}
                </span>
              </div>
            </div>
          </div>

          {/* Report Content Unit */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100/40 dark:border-slate-900/20 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-3xl p-6 md:p-8 space-y-8">

            {/* Chief Complaint */}
            <div className="space-y-3">
              <h2 className="text-xs font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest">
                Chief Complaint
              </h2>
              <div className="bg-slate-50/50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-100/30 dark:border-slate-900/20">
                <p className="text-base text-slate-800 dark:text-slate-200 font-bold leading-relaxed">
                  "{report.chiefComplaint}"
                </p>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="space-y-3">
              <h2 className="text-xs font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest">
                Diagnosis
              </h2>
              <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/10">
                <p className="text-base text-slate-800 dark:text-slate-100 font-extrabold leading-relaxed">
                  {report.diagnosis}
                </p>
              </div>
            </div>

            {/* Clinical Notes */}
            {report.clinicalNotes && (
              <div className="space-y-3">
                <h2 className="text-xs font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest">
                  Clinical Assessment & Notes
                </h2>
                <div className="p-5 bg-slate-50/20 dark:bg-slate-950/20 rounded-2xl border border-slate-100/30 dark:border-slate-900/20">
                  <p className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed font-medium whitespace-pre-line">
                    {report.clinicalNotes}
                  </p>
                </div>
              </div>
            )}

            {/* Follow-up Plan */}
            {(report.followUpDate || report.followUpNotes) && (
              <div className="pt-6 border-t border-slate-100/40 dark:border-slate-900/30 space-y-4">
                <h2 className="text-xs font-extrabold text-amber-600 dark:text-amber-450 uppercase tracking-widest">
                  Follow-up Action Plan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {report.followUpDate && (
                    <div className="p-5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/5 dark:border-amber-500/10 rounded-2xl">
                      <p className="text-xs text-amber-700 dark:text-amber-450 font-bold">Planned Return Date</p>
                      <p className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-5 h-5 text-amber-500" />
                        {dayjs(report.followUpDate).format("DD MMM YYYY")}
                      </p>
                    </div>
                  )}
                  {report.followUpNotes && (
                    <div className="p-5 bg-slate-50/40 dark:bg-slate-800/10 border border-slate-100/30 dark:border-slate-900/20 rounded-2xl sm:col-span-1">
                      <p className="text-xs text-slate-400 dark:text-slate-555 font-bold">Instructions</p>
                      <p className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed mt-1 font-semibold whitespace-pre-line">
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
