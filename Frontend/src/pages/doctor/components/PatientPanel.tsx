import React, { useState, useEffect } from "react";
import {
  User,
  History,
  Activity,
  Heart,
  Thermometer,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ClipboardList,
  Search,
  Filter,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { listConsultationReports, listPrescriptions } from "../../../api/consultationApi";
import { getSpecializationList } from "../../../api/doctor/dProfileCreationService";
import { useNavigate } from "react-router";
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
  patientData: any;
  appointmentDetails: any;
}

export const PatientPanel: React.FC<PatientPanelProps> = ({
  infoTab,
  setInfoTab,
  reportTab,
  setReportTab,
  videoTab,
  setVideoTab,
  patientSubTab,
  setPatientSubTab,
  patientData,
  appointmentDetails,
}) => {
  const navigate = useNavigate();

  // Sub-sub tab in Medical History
  const [historyTab, setHistoryTab] = useState<"reports" | "prescriptions">("reports");

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

  // Specializations list state
  const [specializationsList, setSpecializationsList] = useState<any[]>([]);

  // Filters state
  const [searchText, setSearchText] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Debounced filter states
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedSpecialization, setDebouncedSpecialization] = useState("");
  const [debouncedStartDate, setDebouncedStartDate] = useState("");
  const [debouncedEndDate, setDebouncedEndDate] = useState("");

  // Highlight states
  const [highlightedAppointmentId, setHighlightedAppointmentId] = useState<string | null>(null);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);

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
    }, 500);
    return () => clearTimeout(handler);
  }, [searchText, specialization, startDate, endDate]);

  // Reset pagination when filter criteria changes
  useEffect(() => {
    setReportsPage(1);
    setPrescriptionsPage(1);
  }, [debouncedSearch, debouncedSpecialization, debouncedStartDate, debouncedEndDate]);

  // Fetch consultation reports
  useEffect(() => {
    if (patientSubTab !== "history" || !appointmentDetails?.patientId || historyTab !== "reports") return;

    const fetchReports = async () => {
      setLoadingReports(true);
      try {
        const res = await listConsultationReports({
          patientId: appointmentDetails.patientId,
          page: reportsPage,
          limit: 3, // compact feed inside panel
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
  ]);

  // Fetch prescriptions
  useEffect(() => {
    if (patientSubTab !== "history" || !appointmentDetails?.patientId || historyTab !== "prescriptions") return;

    const fetchPrescriptionsList = async () => {
      setLoadingPrescriptions(true);
      try {
        const res = await listPrescriptions({
          patientId: appointmentDetails.patientId,
          page: prescriptionsPage,
          limit: 3, // compact feed inside panel
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
    setStartDate("");
    setEndDate("");
  };

  // Derived patient details
  const patientName = appointmentDetails?.patientName || patientData?.name || "Unknown Patient";
  const patientGender = appointmentDetails?.gender || patientData?.gender || "Not specified";
  const patientAge = appointmentDetails?.dob
    ? `${dayjs().diff(dayjs(appointmentDetails.dob), "year")} Years`
    : patientData?.age
    ? `${patientData.age} Years`
    : "Unknown Age";
  const patientBlood = patientData?.bloodGroup || "O+";
  const patientAllergies = patientData?.allergies || ["None reported"];
  const patientChronic = patientData?.chronicConditions || ["None reported"];

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md rounded-2xl flex flex-col min-w-[70px] h-full overflow-hidden transition-all duration-300 cursor-pointer ${
        infoTab ? "flex-1 min-w-[280px]" : "w-[70px]"
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
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between shrink-0">
            <div className="flex gap-2.5">
              <button
                onClick={() => setPatientSubTab("details")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  patientSubTab === "details"
                    ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-955"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Patient Details</span>
              </button>
              <button
                onClick={() => setPatientSubTab("history")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  patientSubTab === "history"
                    ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-955"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Medical History</span>
              </button>
            </div>

            <button
              onClick={() => setInfoTab(false)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Panel Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {patientSubTab === "details" ? (
              <div className="space-y-4">
                {/* Patient Card info */}
                <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/40 dark:border-slate-800">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-emerald-500/20 text-white dark:text-emerald-400 flex items-center justify-center font-bold text-lg border border-slate-800 dark:border-emerald-500/30">
                    {patientBlood}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white leading-snug">{patientName}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {patientGender} • {patientAge}
                    </p>
                  </div>
                </div>

                {/* Vitals Grid */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Current Vitals (Pre-check)
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <div>
                        <p className="text-[10px] text-slate-555 uppercase font-medium">BP</p>
                        <p className="text-xs font-bold text-slate-808 dark:text-slate-200">{patientData?.vitals?.bp || "120/80 mmHg"}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      <div>
                        <p className="text-[10px] text-slate-555 uppercase font-medium">Heart Rate</p>
                        <p className="text-xs font-bold text-slate-808 dark:text-slate-200">{patientData?.vitals?.heartRate || "72 bpm"}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-amber-500" />
                      <div>
                        <p className="text-[10px] text-slate-555 uppercase font-medium">Temp</p>
                        <p className="text-xs font-bold text-slate-808 dark:text-slate-200">{patientData?.vitals?.temp || "98.6 °F"}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-[10px] text-slate-555 uppercase font-medium">SpO2</p>
                        <p className="text-xs font-bold text-slate-808 dark:text-slate-200">{patientData?.vitals?.spo2 || "98%"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Allergies Highlight */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Drug & Food Allergies
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {patientAllergies.map((allergy: string, i: number) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Chronic Conditions */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Active Health Conditions
                  </h5>
                  <ul className="space-y-1.5">
                    {patientChronic.map((cond: string, i: number) => (
                      <li
                        key={i}
                        className="text-xs text-slate-655 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/20 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                        {cond}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contact details */}
                {appointmentDetails?.reason && (
                  <div className="bg-amber-50/50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-100 dark:border-amber-905 text-xs space-y-1">
                    <p className="text-amber-800 dark:text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                      Reason for Current consultation
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
                      "{appointmentDetails.reason}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search and Filters Header */}
                <div className="space-y-2">
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
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  </div>

                  {/* Filter Accordion Trigger */}
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/40 px-2.5 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 animate-fade-in"
                    >
                      <Filter className="w-3 h-3" />
                      <span>{showFilters ? "Hide Filters" : "Filter Records"}</span>
                    </button>
                    {(searchText || specialization || startDate || endDate) && (
                      <button
                        onClick={handleClearFilters}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-2 py-1.5 rounded-lg border border-rose-200/40 dark:border-rose-900/40 transition-all duration-300"
                      >
                        Reset All
                      </button>
                    )}
                  </div>

                  {/* Filter inputs dropdown */}
                  {showFilters && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200/50 dark:border-slate-700/60 grid grid-cols-1 gap-2 animate-fade-in">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Specialization</label>
                        <select
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-lg focus:outline-none dark:text-white"
                        >
                          <option value="">All Specializations</option>
                          {specializationsList.map((spec) => (
                            <option key={spec.id} value={spec.name}>
                              {spec.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Start Date</label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] rounded-lg focus:outline-none dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase">End Date</label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] rounded-lg focus:outline-none dark:text-white"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleClearFilters}
                        className="w-full py-1.5 mt-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-350 rounded-lg transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>

                {/* Sub-sub Tab Switcher inside History */}
                <div className="flex border-b border-slate-100 dark:border-slate-800 mb-3">
                  <button
                    onClick={() => setHistoryTab("reports")}
                    className={`flex-1 pb-2 text-center text-xs font-bold border-b-2 transition-all ${
                      historyTab === "reports"
                        ? "border-slate-900 dark:border-emerald-500 text-slate-900 dark:text-emerald-450"
                        : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
                    }`}
                  >
                    Reports
                  </button>
                  <button
                    onClick={() => setHistoryTab("prescriptions")}
                    className={`flex-1 pb-2 text-center text-xs font-bold border-b-2 transition-all ${
                      historyTab === "prescriptions"
                        ? "border-slate-900 dark:border-emerald-500 text-slate-900 dark:text-emerald-450"
                        : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
                    }`}
                  >
                    Prescriptions
                  </button>
                </div>

                {/* Reports tab content */}
                {historyTab === "reports" && (
                  <>
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
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Previous Reports ({reportsTotal})
                        </h5>

                        {/* Records Iteration */}
                        {reports.map((report) => {
                          const isHighlighted = activeHighlightId === report.appointmentId;
                          return (
                            <div
                              key={report.id}
                              data-appointment-id={report.appointmentId}
                              className={`p-3.5 bg-slate-50 dark:bg-slate-800/20 border rounded-xl space-y-2 text-xs relative group transition-all duration-500 ${
                                isHighlighted
                                  ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/20 ring-2 ring-emerald-500 scale-[1.01] shadow-lg shadow-emerald-500/10"
                                  : "border-slate-100 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-750"
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <p className="font-bold text-slate-850 dark:text-slate-205 leading-tight">
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

                              <div className="space-y-1 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800/50 text-[11px]">
                                <p className="text-slate-550 dark:text-slate-300 leading-snug">
                                  <span className="font-bold text-slate-800 dark:text-slate-250">Complaint:</span> "{report.chiefComplaint}"
                                </p>
                                <p className="text-slate-555 dark:text-slate-300 leading-snug">
                                  <span className="font-bold text-slate-800 dark:text-slate-250">Diagnosis:</span> {report.diagnosis}
                                </p>
                              </div>

                              {/* View Links Actions */}
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  onClick={() => window.open(`/reports/${report.id}`, "_blank")}
                                  className="flex items-center gap-1 text-[10px] font-bold text-slate-900 dark:text-emerald-400 hover:opacity-80 transition-opacity bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 px-2 py-1 rounded-md"
                                >
                                  <FileText className="w-3 h-3" /> Report
                                </button>

                                <button
                                  onClick={() => handleLinkClick("prescriptions", report.appointmentId)}
                                  className="flex items-center gap-1 text-[10px] font-bold text-slate-900 dark:text-emerald-455 hover:opacity-80 transition-opacity bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 px-2 py-1 rounded-md"
                                >
                                  <ClipboardList className="w-3 h-3" /> View Rx
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {/* Pagination Bar */}
                        {reportsTotalPages > 1 && (
                          <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-100 dark:border-slate-800">
                            <button
                              onClick={() => setReportsPage((p) => Math.max(1, p - 1))}
                              disabled={reportsPage === 1}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-bold disabled:opacity-50"
                            >
                              Prev
                            </button>
                            <span className="font-medium text-slate-550 dark:text-slate-400">
                              Page <span className="font-bold text-slate-750 dark:text-slate-200">{reportsPage}</span> of {reportsTotalPages}
                            </span>
                            <button
                              onClick={() => setReportsPage((p) => Math.min(reportsTotalPages, p + 1))}
                              disabled={reportsPage === reportsTotalPages}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-bold disabled:opacity-50"
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Prescriptions tab content */}
                {historyTab === "prescriptions" && (
                  <>
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
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <ClipboardList className="w-3.5 h-3.5 text-emerald-500" /> Previous Prescriptions ({prescriptionsTotal})
                        </h5>

                        {/* Records Iteration */}
                        {prescriptions.map((prescription) => {
                          const isHighlighted = activeHighlightId === prescription.appointmentId;
                          return (
                            <div
                              key={prescription.id}
                              data-appointment-id={prescription.appointmentId}
                              className={`p-3.5 bg-slate-50 dark:bg-slate-800/20 border rounded-xl space-y-2 text-xs relative group transition-all duration-500 ${
                                isHighlighted
                                  ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/20 ring-2 ring-emerald-500 scale-[1.01] shadow-lg shadow-emerald-500/10"
                                  : "border-slate-100 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-750"
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <p className="font-bold text-slate-850 dark:text-slate-205 leading-tight">
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
                                <div className="space-y-1.5 bg-white dark:bg-slate-900 rounded-lg p-2 border border-slate-100 dark:border-slate-800/50">
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Medicines</p>
                                  <ul className="space-y-1.5">
                                    {prescription.medicines.map((med: any, idx: number) => (
                                      <li key={idx} className="text-[11px] leading-snug border-b border-slate-100 dark:border-slate-800/40 last:border-b-0 pb-1 last:pb-0">
                                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                                          {med.medicine}
                                        </div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-2">
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
                                  onClick={() => window.open(`/prescriptions/${prescription.id}`, "_blank")}
                                  className="flex items-center gap-1 text-[10px] font-bold text-slate-900 dark:text-emerald-400 hover:opacity-80 transition-opacity bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 px-2 py-1 rounded-md"
                                >
                                  <ClipboardList className="w-3 h-3" /> Rx Link
                                </button>

                                <button
                                  onClick={() => handleLinkClick("reports", prescription.appointmentId)}
                                  className="flex items-center gap-1 text-[10px] font-bold text-slate-900 dark:text-emerald-455 hover:opacity-80 transition-opacity bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 px-2 py-1 rounded-md"
                                >
                                  <FileText className="w-3 h-3" /> View Report
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {/* Pagination Bar */}
                        {prescriptionsTotalPages > 1 && (
                          <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-100 dark:border-slate-800">
                            <button
                              onClick={() => setPrescriptionsPage((p) => Math.max(1, p - 1))}
                              disabled={prescriptionsPage === 1}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-bold disabled:opacity-50"
                            >
                              Prev
                            </button>
                            <span className="font-medium text-slate-550 dark:text-slate-400">
                              Page <span className="font-bold text-slate-750 dark:text-slate-200">{prescriptionsPage}</span> of {prescriptionsTotalPages}
                            </span>
                            <button
                              onClick={() => setPrescriptionsPage((p) => Math.min(prescriptionsTotalPages, p + 1))}
                              disabled={prescriptionsPage === prescriptionsTotalPages}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-bold disabled:opacity-50"
                            >
                              Next
                            </button>
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

