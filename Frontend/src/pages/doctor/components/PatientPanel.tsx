import React, { useState, useEffect } from "react";
import {
  User,
  History,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Calendar,
  ClipboardList,
  Search,
  Filter,
  FileText,
  Stethoscope,
  Scissors,
  Weight,
  Ruler,
  Briefcase,
  Heart,
  UserCircle2,
  ArrowLeft,
  Pill,
  CheckCircle,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  listConsultationReports,
  listPrescriptions,
  getConsultationReportById,
  getConsultationReportByAppointmentId,
  getPrescriptionById,
  getPrescriptionByAppointmentId,
} from "../../../api/consultationApi";
import { listUploadedDocuments } from "../../../api/uploadedDocumentsApi";
import { getSpecializationList } from "../../../api/doctor/dProfileCreationService";
import dayjs from "dayjs";

interface PatientPanelProps {
  infoTab: boolean;
  setInfoTab: React.Dispatch<React.SetStateAction<boolean>>;
  reportTab: boolean;
  setReportTab: React.Dispatch<React.SetStateAction<boolean>>;
  videoTab: boolean;
  setVideoTab: React.Dispatch<React.SetStateAction<boolean>>;
  patientSubTab: "details" | "history";
  setPatientSubTab: (tab: "details" | "history") => void;
  appointmentDetails: any;
  consultationStatus?: string;
}

const CATEGORIES = [
  "Blood Test",
  "X-Ray",
  "MRI",
  "CT Scan",
  "Prescription",
  "Discharge Summary",
  "Vaccination Record",
  "Other",
];

interface MedicalRecordOverlayProps {
  record: { type: "report" | "prescription" | "uploaded_document"; reportId?: string; appointmentId?: string; prescriptionId?: string; doc?: any };
  onClose: () => void;
  specializationList?: any[];
}

const MedicalRecordOverlay: React.FC<MedicalRecordOverlayProps> = ({ record, onClose, specializationList }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (record.type === "uploaded_document") {
          setData(record.doc);
          setLoading(false);
          return;
        }

        if (record.type === "report") {
          let res;
          if (record.reportId) {
            res = await getConsultationReportById(record.reportId);
          } else if (record.appointmentId) {
            res = await getConsultationReportByAppointmentId(record.appointmentId);
          }
          if (res && res.success && res.data) {
            setData(res.data);
          } else {
            setError("Report not found.");
          }
        } else {
          let res;
          if (record.prescriptionId) {
            res = await getPrescriptionById(record.prescriptionId);
          } else if (record.appointmentId) {
            res = await getPrescriptionByAppointmentId(record.appointmentId);
          }
          if (res && res.success && res.data) {
            setData(res.data);
          } else {
            setError("Prescription not found.");
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || `Failed to load ${record.type}.`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [record]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-60 animate-fade-in">
        <svg className="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-sm text-slate-500 mt-3 font-semibold">Loading details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 text-center bg-rose-50 dark:bg-rose-955/20 border border-rose-200/40 dark:border-rose-900/40 rounded-2xl animate-fade-in">
        <p className="text-sm font-bold text-rose-500">{error}</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="animate-slide-in-right h-full flex flex-col min-h-0 bg-white dark:bg-slate-900">
      {/* Header bar */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200/60 dark:border-slate-800 shrink-0">
        <button
          onClick={onClose}
          className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-202 transition-all flex items-center justify-center font-bold text-xs border border-slate-202 dark:border-slate-700/40"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Back</span>
        </button>
        <div>
          <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
            {record.type === "report" ? "Consultation Report" : record.type === "prescription" ? "Rx Prescription" : "Uploaded Document"}
          </h4>
          <p className="text-[11px] text-slate-400 dark:text-slate-550 font-bold uppercase mt-0.5">
            {record.type === "uploaded_document" ? "DOC ID" : "EHR ID"}: {data.id || data._id}
          </p>
        </div>
      </div>

      {/* Body content (Larger fonts for readability) */}
      <div className="flex-1 overflow-y-auto pt-4 space-y-5 pr-1">
        {record.type === "uploaded_document" ? (
          <div className="space-y-4">
            {/* Metadata summary (Category / Date / Specialization) */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 space-y-3 shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-[10px] text-slate-405 uppercase font-black tracking-widest">Category</p>
                  <span className="inline-block text-xs font-bold text-emerald-605 dark:text-emerald-450 uppercase mt-0.5 tracking-wider bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                    {data.customCategory || data.category}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-405 uppercase font-black tracking-widest">Report Date</p>
                  <p className="text-sm font-extrabold text-slate-700 dark:text-slate-350 mt-0.5 flex items-center gap-1 justify-end">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {dayjs(data.reportDate).format("DD MMM YYYY")}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                <p className="text-[10px] text-slate-405 uppercase font-black tracking-widest">Associated Specialization</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                  {specializationList?.find(s => s._id === data.specializationId || s.id === data.specializationId)?.name || data.customSpecialization || "General Practitioner"}
                </p>
              </div>
            </div>

            {/* Document Viewer Container with Zoom */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider pl-1">Document Viewer</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setZoomScale(s => Math.max(0.5, s - 0.2))}
                    className="px-2.5 py-1 text-[11px] font-bold bg-white dark:bg-slate-900 border border-slate-200/40 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 cursor-pointer"
                  >
                    Zoom Out (-)
                  </button>
                  <span className="text-[11px] font-bold px-2 py-1 text-slate-500">{Math.round(zoomScale * 100)}%</span>
                  <button
                    type="button"
                    onClick={() => setZoomScale(s => Math.min(3, s + 0.2))}
                    className="px-2.5 py-1 text-[11px] font-bold bg-white dark:bg-slate-900 border border-slate-200/40 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 cursor-pointer"
                  >
                    Zoom In (+)
                  </button>
                </div>
              </div>

              <div className="w-full overflow-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 p-2 h-[450px]">
                <div
                  style={{
                    transform: `scale(${zoomScale})`,
                    transformOrigin: "top left",
                    transition: "transform 0.2s"
                  }}
                  className="min-w-full min-h-full flex items-center justify-center"
                >
                  {data.fileKey.endsWith(".pdf") || data.fileUrl.includes(".pdf") ? (
                    <iframe
                      src={data.fileUrl}
                      className="w-full h-[400px] border-none"
                      title={data.title}
                    />
                  ) : (
                    <img
                      src={data.fileUrl}
                      alt={data.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : record.type === "report" ? (
          <div className="space-y-4">
            {/* Chief Complaint */}
            <div className="space-y-1.5">
              <p className="text-[11px] text-slate-405 uppercase font-black tracking-widest">Chief Complaint</p>
              <div className="bg-slate-50/50 dark:bg-slate-955/20 p-4 rounded-xl border border-slate-200/30 dark:border-slate-800/20">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed italic">
                  "{data.chiefComplaint}"
                </p>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="space-y-1.5">
              <p className="text-[11px] text-slate-455 uppercase font-black tracking-widest">Diagnosis</p>
              <div className="bg-emerald-500/5 dark:bg-emerald-555/5 p-4 rounded-xl border border-emerald-500/10">
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 leading-relaxed">
                  {data.diagnosis}
                </p>
              </div>
            </div>

            {/* Clinical Notes */}
            {data.clinicalNotes && (
              <div className="space-y-1.5">
                <p className="text-[11px] text-slate-405 uppercase font-black tracking-widest">Clinical Notes</p>
                <div className="p-4 bg-slate-50/20 dark:bg-slate-950/10 rounded-xl border border-slate-200/30 dark:border-slate-800/20">
                  <p className="text-[13px] text-slate-700 dark:text-slate-350 leading-relaxed font-semibold whitespace-pre-line">
                    {data.clinicalNotes}
                  </p>
                </div>
              </div>
            )}

            {/* Follow Up */}
            {(data.followUpDate || data.followUpNotes) && (
              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-3">
                <p className="text-[11px] text-amber-600 dark:text-amber-450 uppercase font-black tracking-widest">Follow Up Plan</p>
                <div className="grid grid-cols-1 gap-2.5">
                  {data.followUpDate && (
                    <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 rounded-xl">
                      <p className="text-[10px] text-amber-700 dark:text-amber-450 font-bold">Return Date</p>
                      <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        {dayjs(data.followUpDate).format("DD MMM YYYY")}
                      </p>
                    </div>
                  )}
                  {data.followUpNotes && (
                    <div className="p-4 bg-slate-50/30 dark:bg-slate-800/10 border border-slate-200/30 dark:border-slate-800/20 rounded-xl">
                      <p className="text-[10px] text-slate-405 font-bold">Instructions</p>
                      <p className="text-[13px] text-slate-700 dark:text-slate-355 leading-relaxed mt-0.5 font-semibold whitespace-pre-line">
                        {data.followUpNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[11px] text-slate-405 uppercase font-black tracking-widest">Prescribed Medications</p>
            <div className="flex flex-col gap-3">
              {data.medicines && data.medicines.length > 0 ? (
                data.medicines.map((med: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 bg-slate-50/30 hover:bg-slate-50/60 dark:bg-slate-950/20 dark:hover:bg-slate-955/50 border border-slate-200/30 dark:border-slate-800/20 rounded-xl transition-all shadow-sm space-y-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <Pill className="w-4.5 h-4.5 text-emerald-500" />
                      <h5 className="font-extrabold text-slate-850 dark:text-slate-100 text-sm leading-snug">
                        {med.medicine}
                      </h5>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <div>
                        <span className="text-[10px] text-slate-405 block">Dosage</span>
                        <span className="text-slate-900 dark:text-white font-bold">{med.dosage}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-405 block">Frequency</span>
                        <span className="text-slate-900 dark:text-white font-bold">{med.frequency}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-405 block">Timing</span>
                        <span className="inline-block text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{med.timing}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-405 block">Duration</span>
                        <span className="text-slate-900 dark:text-white font-bold">{med.duration}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No medications prescribed.</p>
              )}
            </div>

            {/* Signature Card */}
            <div className="pt-4 border-t border-slate-200/60 dark:border-slate-855/60 flex items-center gap-3 bg-slate-50/30 dark:bg-slate-955/20 p-3 rounded-xl border border-slate-200/30 dark:border-slate-800/20">
              <CheckCircle className="w-7 h-7 text-emerald-500 shrink-0" />
              <div>
                <p className="font-bold text-slate-850 dark:text-slate-200 text-xs">
                  Dr. {data.doctorName || "Sarah Connor"}
                </p>
                <p className="text-[9px] text-emerald-600 dark:text-emerald-450 uppercase font-black tracking-widest mt-0.5">
                  Signed & Verified
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const PatientPanel: React.FC<PatientPanelProps> = ({
  infoTab,
  setInfoTab,
  reportTab,
  setReportTab,
  videoTab,
  setVideoTab,
  patientSubTab,
  setPatientSubTab,
  appointmentDetails,
  consultationStatus,
}) => {
  // Sub-sub tab in Medical History
  const [historyTab, setHistoryTab] = useState<"reports" | "prescriptions" | "uploaded_documents">("reports");

  // History listings states
  const [reports, setReports] = useState<any[]>([]);
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsTotalPages, setReportsTotalPages] = useState(1);
  const [reportsTotal, setReportsTotal] = useState(0);
  const [loadingReports, setLoadingReports] = useState(false);

  // Prescriptions state
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [prescriptionsPage, setPrescriptionsPage] = useState(1);
  const [prescriptionsTotalPages, setPrescriptionsTotalPages] = useState(1);
  const [prescriptionsTotal, setPrescriptionsTotal] = useState(0);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);

  // Uploaded documents state
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const [uploadedPage, setUploadedPage] = useState(1);
  const [uploadedTotalPages, setUploadedTotalPages] = useState(1);
  const [uploadedTotal, setUploadedTotal] = useState(0);
  const [loadingUploaded, setLoadingUploaded] = useState(false);

  // Specializations list state
  const [specializationsList, setSpecializationsList] = useState<any[]>([]);

  // Filters state
  const [searchText, setSearchText] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [docCategory, setDocCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Debounced filter states
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedSpecialization, setDebouncedSpecialization] = useState("");
  const [debouncedCategory, setDebouncedCategory] = useState("");
  const [debouncedStartDate, setDebouncedStartDate] = useState("");
  const [debouncedEndDate, setDebouncedEndDate] = useState("");

  // Highlight states
  const [highlightedAppointmentId, setHighlightedAppointmentId] = useState<string | null>(null);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);

  // Medical Record Overlay State
  const [activeRecordToView, setActiveRecordToView] = useState<null | { type: "report" | "prescription" | "uploaded_document"; reportId?: string; appointmentId?: string; prescriptionId?: string; doc?: any }>(null);

  // Collapsible section states for Patient Details tab
  const [isPersonalExpanded, setIsPersonalExpanded] = useState(true);
  const [isAllergiesExpanded, setIsAllergiesExpanded] = useState(true);
  const [isIllnessesExpanded, setIsIllnessesExpanded] = useState(true);
  const [isSurgeriesExpanded, setIsSurgeriesExpanded] = useState(true);
  const [isReasonExpanded, setIsReasonExpanded] = useState(true);

  // Fetch specializations list on mount
  useEffect(() => {
    const fetchSpecs = async () => {
      try {
        const res = await getSpecializationList();
        if (res && res.success && res.specializations) {
          setSpecializationsList(res.specializations);
        }
      } catch (err) {
        console.error("Failed to load specializations", err);
      }
    };
    fetchSpecs();
  }, []);

  // Debounce filter inputs
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
      setDebouncedSpecialization(specialization);
      setDebouncedStartDate(startDate);
      setDebouncedEndDate(endDate);
      setDebouncedCategory(docCategory);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText, specialization, startDate, endDate, docCategory]);

  // Reset pagination when filter criteria changes
  useEffect(() => {
    setReportsPage(1);
    setPrescriptionsPage(1);
    setUploadedPage(1);
  }, [debouncedSearch, debouncedSpecialization, debouncedStartDate, debouncedEndDate, debouncedCategory]);

  // Reset specialization if "other" is selected but the tab is switched away from uploaded_documents
  useEffect(() => {
    if (historyTab !== "uploaded_documents" && specialization === "other") {
      setSpecialization("");
    }
  }, [historyTab, specialization]);

  // Fetch uploaded documents
  useEffect(() => {
    if (patientSubTab !== "history" || !appointmentDetails?.patientId || historyTab !== "uploaded_documents") return;
    if (consultationStatus && consultationStatus !== "IN_PROGRESS") return;

    const fetchUploadedDocuments = async () => {
      setLoadingUploaded(true);
      try {
        const res = await listUploadedDocuments({
          patientId: appointmentDetails.patientId,
          page: uploadedPage,
          limit: 3,
          search: debouncedSearch || undefined,
          category: debouncedCategory || undefined,
          specialization: debouncedSpecialization || undefined,
          startDate: debouncedStartDate || undefined,
          endDate: debouncedEndDate || undefined,
        });

        if (res.success && res.data) {
          setUploadedDocs(res.data.documents || []);
          setUploadedTotalPages(res.data.totalPages || 1);
          setUploadedTotal(res.data.total || 0);
        }
      } catch (err: any) {
        toast.error("Failed to load patient uploaded documents.");
      } finally {
        setLoadingUploaded(false);
      }
    };

    fetchUploadedDocuments();
  }, [
    patientSubTab,
    historyTab,
    appointmentDetails?.patientId,
    uploadedPage,
    debouncedSearch,
    debouncedCategory,
    debouncedSpecialization,
    debouncedStartDate,
    debouncedEndDate,
    consultationStatus,
  ]);

  // Fetch consultation reports
  useEffect(() => {
    if (patientSubTab !== "history" || !appointmentDetails?.patientId || historyTab !== "reports") return;
    if (consultationStatus && consultationStatus !== "IN_PROGRESS") return;

    const fetchReports = async () => {
      setLoadingReports(true);
      try {
        const res = await listConsultationReports({
          patientId: appointmentDetails.patientId,
          page: reportsPage,
          limit: 3,
          search: debouncedSearch || undefined,
          specialization: debouncedSpecialization || undefined,
          startDate: debouncedStartDate || undefined,
          endDate: debouncedEndDate || undefined,
        });

        if (res.success && res.data) {
          setReports(res.data.reports || []);
          setReportsTotalPages(res.data.totalPages || 1);
          setReportsTotal(res.data.total || 0);
        }
      } catch (err: any) {
        toast.error("Failed to load patient consultation history.");
      } finally {
        setLoadingReports(false);
      }
    };

    fetchReports();
  }, [
    patientSubTab,
    historyTab,
    appointmentDetails?.patientId,
    reportsPage,
    debouncedSearch,
    debouncedSpecialization,
    debouncedStartDate,
    debouncedEndDate,
    consultationStatus,
  ]);

  // Fetch prescriptions
  useEffect(() => {
    if (patientSubTab !== "history" || !appointmentDetails?.patientId || historyTab !== "prescriptions") return;
    if (consultationStatus && consultationStatus !== "IN_PROGRESS") return;

    const fetchPrescriptionsList = async () => {
      setLoadingPrescriptions(true);
      try {
        const res = await listPrescriptions({
          patientId: appointmentDetails.patientId,
          page: prescriptionsPage,
          limit: 3,
          search: debouncedSearch || undefined,
          specialization: debouncedSpecialization || undefined,
          startDate: debouncedStartDate || undefined,
          endDate: debouncedEndDate || undefined,
        });

        if (res.success && res.data) {
          setPrescriptions(res.data.prescriptions || []);
          setPrescriptionsTotalPages(res.data.totalPages || 1);
          setPrescriptionsTotal(res.data.total || 0);
        }
      } catch (err: any) {
        toast.error("Failed to load patient prescription history.");
      } finally {
        setLoadingPrescriptions(false);
      }
    };

    fetchPrescriptionsList();
  }, [
    patientSubTab,
    historyTab,
    appointmentDetails?.patientId,
    prescriptionsPage,
    debouncedSearch,
    debouncedSpecialization,
    debouncedStartDate,
    debouncedEndDate,
    consultationStatus,
  ]);

  // Handle cross-tab navigation and highlight
  const handleLinkClick = (targetTab: "reports" | "prescriptions", appointmentId: string) => {
    setHighlightedAppointmentId(appointmentId);
    setHistoryTab(targetTab);
  };

  // Scroll to and pulse highlight when list items render
  useEffect(() => {
    if (!highlightedAppointmentId) return;

    const timer = setTimeout(() => {
      const element = document.querySelector(`[data-appointment-id="${highlightedAppointmentId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        setActiveHighlightId(highlightedAppointmentId);

        const clearTimer = setTimeout(() => {
          setActiveHighlightId(null);
          setHighlightedAppointmentId(null);
        }, 3000);

        return () => clearTimeout(clearTimer);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [reports, prescriptions, highlightedAppointmentId, historyTab]);

  const handleClearFilters = () => {
    setSearchText("");
    setSpecialization("");
    setDocCategory("");
    setStartDate("");
    setEndDate("");
  };

  // ─── Derived patient details from real appointmentDetails ───────────────────
  const patientName = appointmentDetails?.patientName || "Unknown Patient";
  const patientGender = appointmentDetails?.gender || "—";
  const patientDob = appointmentDetails?.dob ? dayjs(appointmentDetails.dob) : null;
  const patientAge = patientDob ? `${dayjs().diff(patientDob, "year")} yrs` : "—";
  const patientDobDisplay = patientDob ? patientDob.format("DD MMM YYYY") : "—";
  const patientBloodGroup = appointmentDetails?.bloodGroup || "—";
  const patientMaritalStatus = appointmentDetails?.maritalStatus || "—";
  const patientOccupation = appointmentDetails?.occupation || "—";
  const patientProfileImage = appointmentDetails?.profileImageUrl || "";
  const patientAllergies: string[] = appointmentDetails?.allergies || [];
  const bodyMetrics = appointmentDetails?.bodyMetrics;
  const patientHeight = bodyMetrics?.height ? `${bodyMetrics.height} cm` : null;
  const patientWeight = bodyMetrics?.weight ? `${bodyMetrics.weight} kg` : null;
  const pastDiseases = appointmentDetails?.pastDiseases;
  const pastSurgeries: any[] = appointmentDetails?.pastSurgeries || [];

  // Build a readable list of positive past diseases
  const activeDiseases: string[] = [];
  if (pastDiseases?.tuberculosis?.value) activeDiseases.push("Tuberculosis");
  if (pastDiseases?.epilepsy?.value) activeDiseases.push("Epilepsy");
  if (pastDiseases?.bronchialAsthma?.value) activeDiseases.push("Bronchial Asthma");

  // Initials fallback for avatar
  const initials = patientName
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md rounded-2xl flex flex-col min-w-[70px] h-full overflow-hidden transition-all duration-300 cursor-pointer ${infoTab ? "flex-1 min-w-[280px]" : "w-[70px]"
        }`}
      onClick={() => {
        if (infoTab && !reportTab && !videoTab) {
          setReportTab(true);
        }
        setInfoTab((prev) => !prev);
      }}
    >
      {infoTab ? (
        <div className="flex flex-col h-full min-h-0 cursor-default" onClick={(e) => e.stopPropagation()}>
          {/* Header with Sub-tabs */}
          <div className="p-3 border-b border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between shrink-0">
            <div className="flex gap-2.5">
              <button
                onClick={() => setPatientSubTab("details")}
                className={`flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${patientSubTab === "details"
                  ? "bg-slate-800 text-white dark:bg-emerald-500 dark:text-slate-955"
                  : "text-slate-555 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
                  }`}
              >
                <span>Patient Details</span>
              </button>
              <button
                onClick={() => {
                  setPatientSubTab("history");
                  setActiveRecordToView(null); // Reset detail view when tab switches
                }}
                className={`flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${patientSubTab === "history"
                  ? "bg-slate-800 text-white dark:bg-emerald-500 dark:text-slate-955"
                  : "text-slate-555 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
                  }`}
              >
                <span>Medical History</span>
              </button>
            </div>

            <button
              onClick={() => setInfoTab(false)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Panel Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {patientSubTab === "details" ? (
              <div className="space-y-4 text-slate-800 dark:text-slate-200">

                {/* ── 1. Digital Health ID Card (Top) ── */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100/80 dark:from-slate-850 dark:to-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {patientProfileImage ? (
                        <img
                          src={patientProfileImage}
                          alt={patientName}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white text-xl shadow-md border-2 border-white dark:border-slate-700">
                          {initials || <UserCircle2 className="w-8 h-8" />}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white leading-snug truncate text-base mt-0.5">{patientName}</h4>
                      <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">
                        Patient Profile details compiled from registered records.
                      </p>
                    </div>
                  </div>

                  {/* Horizontal Vitals Grid inside ID Card */}
                  <div className="grid grid-cols-5 gap-1.5 mt-4 pt-3.5 border-t border-slate-200/50 dark:border-slate-700/50 text-center">
                    <div className="bg-white/80 dark:bg-slate-900/40 p-1.5 rounded-xl border border-slate-200/30 dark:border-slate-800/20">
                      <p className="text-[9px] text-slate-405 dark:text-slate-500 uppercase font-bold">Blood</p>
                      <p className="text-xs font-black text-rose-600 dark:text-rose-400 mt-0.5">{patientBloodGroup !== "—" ? patientBloodGroup : "N/A"}</p>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900/40 p-1.5 rounded-xl border border-slate-200/30 dark:border-slate-800/20">
                      <p className="text-[9px] text-slate-405 dark:text-slate-500 uppercase font-bold">Age</p>
                      <p className="text-xs font-black text-slate-755 dark:text-slate-200 mt-0.5">{patientAge}</p>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900/40 p-1.5 rounded-xl border border-slate-200/30 dark:border-slate-800/20">
                      <p className="text-[9px] text-slate-405 dark:text-slate-500 uppercase font-bold">Gender</p>
                      <p className="text-xs font-black text-slate-755 dark:text-slate-200 mt-0.5 capitalize">{patientGender}</p>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900/40 p-1.5 rounded-xl border border-slate-200/30 dark:border-slate-800/20">
                      <p className="text-[9px] text-slate-405 dark:text-slate-500 uppercase font-bold">Height</p>
                      <p className="text-xs font-black text-slate-755 dark:text-slate-200 mt-0.5">{patientHeight ? patientHeight.replace(" cm", "") : "—"}<span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 ml-0.5">cm</span></p>
                    </div>
                    <div className="bg-white/80 dark:bg-slate-900/40 p-1.5 rounded-xl border border-slate-200/30 dark:border-slate-800/20">
                      <p className="text-[9px] text-slate-405 dark:text-slate-500 uppercase font-bold">Weight</p>
                      <p className="text-xs font-black text-slate-755 dark:text-slate-200 mt-0.5">{patientWeight ? patientWeight.replace(" kg", "") : "—"}<span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 ml-0.5">kg</span></p>
                    </div>
                  </div>
                </div>

                {/* ── 2. Collapsible: Personal Profile Context Card ── */}
                <div className="bg-white dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/60 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setIsPersonalExpanded(!isPersonalExpanded)}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-800/20 border-b border-transparent dark:border-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <UserCircle2 className="w-4 h-4 text-emerald-500" /> Personal Information
                    </h5>
                    {isPersonalExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {isPersonalExpanded && (
                    <div className="p-3.5 grid grid-cols-3 gap-2.5 bg-white dark:bg-transparent">
                      <div className="bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Date of Birth</p>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-202 mt-0.5">{patientDobDisplay}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Marital Status</p>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-202 capitalize mt-0.5">{patientMaritalStatus !== "none" ? patientMaritalStatus : "—"}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Occupation</p>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-202 truncate mt-0.5">{patientOccupation}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── 3. Collapsible: Allergies Card ── */}
                <div className="bg-white dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/60 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setIsAllergiesExpanded(!isAllergiesExpanded)}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-500" /> Drug & Food Allergies
                    </h5>
                    {isAllergiesExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {isAllergiesExpanded && (
                    <div className="p-3.5 border-t border-slate-200/40 dark:border-slate-800/30 bg-white dark:bg-transparent">
                      {patientAllergies.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {patientAllergies.map((allergy: string, i: number) => (
                            <span
                              key={i}
                              className="text-xs px-3 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-450 border border-rose-500/20 font-semibold"
                            >
                              {allergy}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No known allergies on record.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* ── 4. Collapsible: Previous Illnesses Card ── */}
                <div className="bg-white dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/60 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setIsIllnessesExpanded(!isIllnessesExpanded)}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-amber-500" /> Previous Illnesses
                    </h5>
                    {isIllnessesExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {isIllnessesExpanded && (
                    <div className="p-3.5 border-t border-slate-200/40 dark:border-slate-800/30 bg-white dark:bg-transparent">
                      {activeDiseases.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {activeDiseases.map((disease, i) => (
                            <span
                              key={i}
                              className="text-xs px-3 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold"
                            >
                              {disease}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No previous illnesses on record.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* ── 5. Collapsible: Past Surgeries Card (Tabular format) ── */}
                <div className="bg-white dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/60 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setIsSurgeriesExpanded(!isSurgeriesExpanded)}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-purple-500" /> Past Surgeries
                    </h5>
                    {isSurgeriesExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {isSurgeriesExpanded && (
                    <div className="border-t border-slate-200/40 dark:border-slate-800/30 overflow-x-auto bg-white dark:bg-transparent">
                      {pastSurgeries.length > 0 ? (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-405 uppercase tracking-wider font-bold border-b border-slate-200/30 dark:border-slate-800/20">
                              <th className="p-3">Surgery Name</th>
                              <th className="p-3">Type</th>
                              <th className="p-3">Year</th>
                              <th className="p-3">Reason / Details</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
                            {pastSurgeries.map((surgery: any, i: number) => (
                              <tr key={i} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                                <td className="p-3 font-semibold text-slate-850 dark:text-slate-200">{surgery.surgeryName || "Unknown"}</td>
                                <td className="p-3">
                                  {surgery.surgeryType && (
                                    <span className={`inline-block text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide ${surgery.surgeryType === "major"
                                      ? "bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-450"
                                      : "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-450"
                                      }`}>
                                      {surgery.surgeryType}
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 font-medium text-slate-500 dark:text-slate-400">{surgery.year || "—"}</td>
                                <td className="p-3 text-slate-550 dark:text-slate-400">
                                  <p>{surgery.reason || "—"}</p>
                                  {(surgery.doctor || surgery.hospital) && (
                                    <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-0.5">
                                      {surgery.doctor && `Dr. ${surgery.doctor}`}
                                      {surgery.doctor && surgery.hospital && " · "}
                                      {surgery.hospital}
                                    </p>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-xs text-slate-400 italic">No past surgeries on record.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── 6. Collapsible: Reason for current consultation ── */}
                {appointmentDetails?.reason && (
                  <div className="bg-white dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-800/60 rounded-xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setIsReasonExpanded(!isReasonExpanded)}
                      className="w-full flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-505" /> Current Consultation Reason
                      </h5>
                      {isReasonExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    {isReasonExpanded && (
                      <div className="p-4 border-t border-slate-200/40 dark:border-slate-800/30 bg-amber-50/30 dark:bg-amber-900/5">
                        <p className="text-slate-705 dark:text-slate-300 italic leading-relaxed text-xs">
                          "{appointmentDetails.reason}"
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="space-y-4 h-full flex flex-col min-h-0">
                {consultationStatus && consultationStatus !== "IN_PROGRESS" ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-800/20 border border-slate-200/45 dark:border-slate-800/40 rounded-2xl animate-fade-in space-y-3">
                    <ShieldAlert className="w-10 h-10 text-amber-500" />
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Access Restricted</h5>
                    <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-semibold">
                      {consultationStatus === "COMPLETED"
                        ? "Consultation has ended. Medical records are no longer accessible."
                        : "Medical records will be accessible once the patient joins the consultation."}
                    </p>
                  </div>
                ) : activeRecordToView ? (
                  <MedicalRecordOverlay
                    record={activeRecordToView}
                    onClose={() => setActiveRecordToView(null)}
                    specializationList={specializationsList}
                  />
                ) : (
                  <>
                    {/* Search and Filters Header */}
                    <div className="space-y-2 shrink-0">
                      <div className="relative">
                        <input
                          type="text"
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          placeholder={
                            historyTab === "reports"
                              ? "Search reports by doctor, complaint..."
                              : "Search prescriptions by doctor, medicine..."
                          }
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-305 dark:focus:ring-slate-655 dark:text-white"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-405 absolute left-2.5 top-2.5" />
                      </div>
                                   {/* Filter Accordion Trigger */}
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => setShowFilters(!showFilters)}
                          className="text-xs font-bold text-slate-600 hover:text-slate-800 dark:hover:text-slate-355 flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/40 px-3.5 py-2 rounded-lg border border-slate-200/50 dark:border-slate-700/50 transition-all duration-100 animate-fade-in"
                        >
                          <span>{showFilters ? "Hide Filters" : "Filter Records"}</span>
                        </button>
                        {(searchText || specialization || startDate || endDate) && (
                          <button
                            onClick={handleClearFilters}
                            className="text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-955/20 px-3.5 py-2 rounded-lg border border-rose-200/30 dark:border-rose-900/30 transition-all duration-100"
                          >
                            Reset All
                          </button>
                        )}
                      </div>

                      {/* Filter inputs dropdown (Animated height/opacity) */}
                      <div className={`p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200/50 dark:border-slate-700/60 grid grid-cols-1 gap-2 transition-all duration-300 ease-in-out transform ${showFilters
                          ? "opacity-100 translate-y-0 max-h-[500px] visible mb-2"
                          : "opacity-0 -translate-y-2 max-h-0 invisible overflow-hidden pointer-events-none"
                        }`}>
                        <div>
                          <label className="text-[10px] font-bold text-slate-405 uppercase">Specialization</label>
                          <select
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 text-xs rounded-lg focus:outline-none dark:text-white"
                          >
                            <option value="">All Specializations</option>
                            {specializationsList.map((spec) => (
                              <option key={spec.id || spec._id} value={spec.id || spec._id}>
                                {spec.name}
                              </option>
                            ))}
                            {historyTab === "uploaded_documents" && (
                              <option value="other">Other Specializations</option>
                            )}
                          </select>
                        </div>
                        {historyTab === "uploaded_documents" && (
                          <div>
                            <label className="text-[10px] font-bold text-slate-405 uppercase">Category</label>
                            <select
                              value={docCategory}
                              onChange={(e) => setDocCategory(e.target.value)}
                              className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 text-xs rounded-lg focus:outline-none dark:text-white"
                            >
                              <option value="">All Categories</option>
                              {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Start Date</label>
                            <input
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 text-[11px] rounded-lg focus:outline-none dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">End Date</label>
                            <input
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 text-[11px] rounded-lg focus:outline-none dark:text-white"
                            />
                          </div>
                        </div>
                        <button
                          onClick={handleClearFilters}
                          className="w-full py-2 mt-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-xs font-bold text-slate-600 dark:text-slate-355 rounded-lg transition-colors"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </div>

                    {/* Sub-sub Tab Switcher inside History */}
                    <div className="flex border-b border-slate-200/60 dark:border-slate-800 mb-3 shrink-0">
                      <button
                        onClick={() => setHistoryTab("reports")}
                        className={`flex-1 pb-2 text-center text-sm font-bold border-b-2 transition-all ${historyTab === "reports"
                            ? "border-slate-400 dark:border-emerald-500 text-slate-850 dark:text-emerald-450"
                            : "border-transparent text-slate-400 hover:text-slate-655 dark:hover:text-slate-350"
                          }`}
                      >
                        Reports
                      </button>
                      <button
                        onClick={() => setHistoryTab("prescriptions")}
                        className={`flex-1 pb-2 text-center text-sm font-bold border-b-2 transition-all ${historyTab === "prescriptions"
                            ? "border-slate-400 dark:border-emerald-500 text-slate-855 dark:text-emerald-455"
                            : "border-transparent text-slate-400 hover:text-slate-655 dark:hover:text-slate-350"
                          }`}
                      >
                        Prescriptions
                      </button>
                      <button
                        onClick={() => setHistoryTab("uploaded_documents")}
                        className={`flex-1 pb-2 text-center text-sm font-bold border-b-2 transition-all ${historyTab === "uploaded_documents"
                            ? "border-slate-400 dark:border-emerald-500 text-slate-855 dark:text-emerald-455"
                            : "border-transparent text-slate-400 hover:text-slate-655 dark:hover:text-slate-350"
                          }`}
                      >
                        Uploaded Docs
                      </button>
                    </div>

                    {/* Reports tab content */}
                    {historyTab === "reports" && (
                      <div className="flex-1 overflow-y-auto space-y-3.5">
                        {loadingReports ? (
                          <div className="py-12 flex justify-center items-center">
                            <svg className="animate-spin h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                          </div>
                        ) : reports.length === 0 ? (
                          <div className="py-12 text-center p-4 bg-slate-50/50 dark:bg-slate-800/10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl animate-fade-in">
                            <p className="text-xs text-slate-400 font-medium">No previous reports found matching options.</p>
                          </div>
                        ) : (
                          <div className="space-y-3.5 animate-fade-in">
                            <h5 className="text-[11px] font-bold text-slate-405 uppercase tracking-widest flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Previous Reports ({reportsTotal})
                            </h5>

                            {/* Records Iteration */}
                            {reports.map((report) => {
                              const isHighlighted = activeHighlightId === report.appointmentId;
                              return (
                                <div
                                  key={report.id}
                                  data-appointment-id={report.appointmentId}
                                  className={`p-3.5 bg-slate-50 dark:bg-slate-800/20 border rounded-xl space-y-2 text-xs relative group transition-all duration-500 ${isHighlighted
                                      ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/20 ring-2 ring-emerald-500 scale-[1.01] shadow-lg shadow-emerald-500/10"
                                      : "border-slate-200/50 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700"
                                    }`}
                                >
                                  <div className="flex justify-between items-start gap-2">
                                    <div>
                                      <p className="text-xs font-bold text-slate-800 dark:text-slate-205 leading-tight">
                                        Dr. {report.doctorName || "Unknown"}
                                      </p>
                                      <p className="text-[10px] text-emerald-600 dark:text-emerald-450 font-bold mt-0.5 uppercase">
                                        {report.doctorSpecialization || "General Medicine"}
                                      </p>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                                      {dayjs(report.createdAt).format("DD MMM YYYY")}
                                    </span>
                                  </div>

                                  <div className="space-y-1 p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/30 dark:border-slate-800/30 text-xs">
                                    <p className="text-slate-600 dark:text-slate-300 leading-snug">
                                      <span className="font-bold text-slate-700 dark:text-slate-250">Complaint:</span> "{report.chiefComplaint}"
                                    </p>
                                    <p className="text-slate-600 dark:text-slate-300 leading-snug">
                                      <span className="font-bold text-slate-700 dark:text-slate-250">Diagnosis:</span> {report.diagnosis}
                                    </p>
                                  </div>

                                  {/* View Links Actions */}
                                  <div className="flex items-center gap-2 pt-1">
                                    <button
                                      onClick={() => setActiveRecordToView({ type: "report", reportId: report.id })}
                                      className="flex items-center justify-center text-xs font-bold text-slate-800 dark:text-emerald-455 hover:opacity-80 transition-opacity bg-white dark:bg-slate-800 border border-slate-202 dark:border-slate-700 px-3.5 py-2 rounded-md"
                                    >
                                      View Report
                                    </button>

                                    <button
                                      onClick={() => setActiveRecordToView({ type: "prescription", appointmentId: report.appointmentId })}
                                      className="flex items-center justify-center text-xs font-bold text-slate-805 dark:text-emerald-455 hover:opacity-80 transition-opacity bg-white dark:bg-slate-800 border border-slate-202 dark:border-slate-700 px-3.5 py-2 rounded-md"
                                    >
                                      View Rx
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Pagination Bar */}
                            {reportsTotalPages > 1 && (
                              <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-200/60 dark:border-slate-800">
                                <button
                                  onClick={() => setReportsPage((p) => Math.max(1, p - 1))}
                                  disabled={reportsPage === 1}
                                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-md font-bold disabled:opacity-50 text-xs transition-colors"
                                >
                                  Prev
                                </button>
                                <span className="font-medium text-slate-550 dark:text-slate-400 text-xs">
                                  Page <span className="font-bold text-slate-750 dark:text-slate-200">{reportsPage}</span> of {reportsTotalPages}
                                </span>
                                <button
                                  onClick={() => setReportsPage((p) => Math.min(reportsTotalPages, p + 1))}
                                  disabled={reportsPage === reportsTotalPages}
                                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-md font-bold disabled:opacity-50 text-xs transition-colors"
                                >
                                  Next
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Prescriptions tab content */}
                    {historyTab === "prescriptions" && (
                      <div className="flex-1 overflow-y-auto space-y-3.5">
                        {loadingPrescriptions ? (
                          <div className="py-12 flex justify-center items-center">
                            <svg className="animate-spin h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                          </div>
                        ) : prescriptions.length === 0 ? (
                          <div className="py-12 text-center p-4 bg-slate-50/50 dark:bg-slate-800/10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl animate-fade-in">
                            <p className="text-xs text-slate-400 font-medium">No previous prescriptions found matching options.</p>
                          </div>
                        ) : (
                          <div className="space-y-3.5 animate-fade-in">
                            <h5 className="text-[11px] font-bold text-slate-405 uppercase tracking-widest flex items-center gap-1.5">
                              <ClipboardList className="w-3.5 h-3.5 text-emerald-500" /> Previous Prescriptions ({prescriptionsTotal})
                            </h5>

                            {/* Records Iteration */}
                            {prescriptions.map((prescription) => {
                              const isHighlighted = activeHighlightId === prescription.appointmentId;
                              return (
                                <div
                                  key={prescription.id}
                                  data-appointment-id={prescription.appointmentId}
                                  className={`p-3.5 bg-slate-50 dark:bg-slate-800/20 border rounded-xl space-y-2 text-xs relative group transition-all duration-500 ${isHighlighted
                                      ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/20 ring-2 ring-emerald-500 scale-[1.01] shadow-lg shadow-emerald-500/10"
                                      : "border-slate-200/50 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700"
                                    }`}
                                >
                                  <div className="flex justify-between items-start gap-2">
                                    <div>
                                      <p className="text-xs font-bold text-slate-850 dark:text-slate-205 leading-tight">
                                        Dr. {prescription.doctorName || "Unknown"}
                                      </p>
                                      <p className="text-[10px] text-emerald-600 dark:text-emerald-455 font-bold mt-0.5 uppercase">
                                        {prescription.doctorSpecialization || "General Medicine"}
                                      </p>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                                      {dayjs(prescription.createdAt).format("DD MMM YYYY")}
                                    </span>
                                  </div>

                                  {prescription.medicines && (
                                    <div className="space-y-1.5 bg-white dark:bg-slate-900 rounded-lg p-2.5 border border-slate-200/30 dark:border-slate-800/30">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Medicines</p>
                                      <ul className="space-y-1.5">
                                        {prescription.medicines.map((med: any, idx: number) => (
                                          <li key={idx} className="text-xs leading-snug border-b border-slate-100 dark:border-slate-800/40 last:border-b-0 pb-1 last:pb-0">
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                                              {med.medicine}
                                            </div>
                                            <div className="text-[10px] text-slate-555 dark:text-slate-400 flex flex-wrap gap-x-2">
                                              <span>Dosage: {med.dosage}</span>
                                              <span>•</span>
                                              <span>{med.frequency}</span>
                                              <span>•</span>
                                              <span>{med.timing}</span>
                                              <span>•</span>
                                              <span>{med.duration}</span>
                                            </div>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* View Links Actions */}
                                  <div className="flex items-center gap-2 pt-1">
                                    <button
                                      onClick={() => setActiveRecordToView({ type: "prescription", prescriptionId: prescription.id })}
                                      className="flex items-center justify-center text-xs font-bold text-slate-805 dark:text-emerald-450 hover:opacity-80 transition-opacity bg-white dark:bg-slate-800 border border-slate-202 dark:border-slate-700 px-3.5 py-2 rounded-md"
                                    >
                                      Rx Link
                                    </button>

                                    <button
                                      onClick={() => setActiveRecordToView({ type: "report", appointmentId: prescription.appointmentId })}
                                      className="flex items-center justify-center text-xs font-bold text-slate-805 dark:text-emerald-455 hover:opacity-80 transition-opacity bg-white dark:bg-slate-800 border border-slate-202 dark:border-slate-700 px-3.5 py-2 rounded-md"
                                    >
                                      View Report
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Pagination Bar */}
                            {prescriptionsTotalPages > 1 && (
                              <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-200/60 dark:border-slate-800">
                                <button
                                  onClick={() => setPrescriptionsPage((p) => Math.max(1, p - 1))}
                                  disabled={prescriptionsPage === 1}
                                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-md font-bold disabled:opacity-50 text-xs transition-colors"
                                >
                                  Prev
                                </button>
                                <span className="font-medium text-slate-550 dark:text-slate-400 text-xs">
                                  Page <span className="font-bold text-slate-750 dark:text-slate-200">{prescriptionsPage}</span> of {prescriptionsTotalPages}
                                </span>
                                <button
                                  onClick={() => setPrescriptionsPage((p) => Math.min(prescriptionsTotalPages, p + 1))}
                                  disabled={prescriptionsPage === prescriptionsTotalPages}
                                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-md font-bold disabled:opacity-50 text-xs transition-colors"
                                >
                                  Next
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Uploaded documents tab content */}
                    {historyTab === "uploaded_documents" && (
                      <div className="flex-1 overflow-y-auto space-y-3.5">
                        {loadingUploaded ? (
                          <div className="py-12 flex justify-center items-center">
                            <svg className="animate-spin h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                          </div>
                        ) : uploadedDocs.length === 0 ? (
                          <div className="py-12 text-center p-4 bg-slate-50/50 dark:bg-slate-800/10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl animate-fade-in">
                            <p className="text-xs text-slate-400 font-medium">No uploaded documents found matching options.</p>
                          </div>
                        ) : (
                          <div className="space-y-3.5 animate-fade-in">
                            <h5 className="text-[11px] font-bold text-slate-405 uppercase tracking-widest flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-emerald-500" /> Uploaded Documents ({uploadedTotal})
                            </h5>

                            {uploadedDocs.map((doc) => {
                              const specName = specializationsList.find(s => s._id === doc.specializationId || s.id === doc.specializationId)?.name || doc.customSpecialization || "General Practitioner";
                              const isCustomSpec = doc.customSpecialization ? true : false;
                              const isCustomCat = doc.customCategory ? true : false;

                              return (
                                <div
                                  key={doc.id}
                                  onClick={() => setActiveRecordToView({ type: "uploaded_document", doc })}
                                  className="p-3.5 bg-slate-50 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl flex gap-3 text-xs cursor-pointer hover:scale-[1.01] transition-all"
                                >
                                  {/* Thumbnail */}
                                  <div className="w-10 h-12 shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-805 bg-slate-100 dark:bg-slate-950 shadow-sm">
                                    <img
                                      src={doc.thumbnailUrl}
                                      alt={doc.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>

                                  <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex justify-between items-start gap-2">
                                      <p className="text-xs font-bold text-slate-800 dark:text-slate-205 leading-tight truncate">
                                        {doc.title}
                                      </p>
                                      <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                                        {dayjs(doc.reportDate).format("DD MMM YYYY")}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-450 font-bold uppercase tracking-wider">
                                      {isCustomCat ? doc.customCategory : doc.category}
                                    </p>
                                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                                      Spec: {specName} {isCustomSpec && <span className="text-[9px] text-slate-400 italic font-normal">(Other)</span>}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Pagination Bar */}
                            {uploadedTotalPages > 1 && (
                              <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-200/60 dark:border-slate-800">
                                <button
                                  onClick={() => setUploadedPage((p) => Math.max(1, p - 1))}
                                  disabled={uploadedPage === 1}
                                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-md font-bold disabled:opacity-50 text-xs transition-colors cursor-pointer"
                                >
                                  Prev
                                </button>
                                <span className="font-medium text-slate-550 dark:text-slate-400 text-xs">
                                  Page <span className="font-bold text-slate-750 dark:text-slate-200">{uploadedPage}</span> of {uploadedTotalPages}
                                </span>
                                <button
                                  onClick={() => setUploadedPage((p) => Math.min(uploadedTotalPages, p + 1))}
                                  disabled={uploadedPage === uploadedTotalPages}
                                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-md font-bold disabled:opacity-50 text-xs transition-colors cursor-pointer"
                                >
                                  Next
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Minimized Icon Bar */
        <div className="h-full flex flex-col items-center justify-between py-6">
          <div className="flex flex-col items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="font-bold text-slate-400 uppercase text-[10px] tracking-[0.2em] [writing-mode:vertical-lr] select-none flex items-center gap-1 rotate-180">
            <span>Patient Profile</span>
            <ChevronRight className="w-3.5 h-3.5 rotate-90" />
          </div>
        </div>
      )}
    </div>
  );
};
