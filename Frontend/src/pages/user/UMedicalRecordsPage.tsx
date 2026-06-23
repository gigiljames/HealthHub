import React, { useState, useEffect } from "react";
import UNavbar from "../../components/user/UNavbar";
import { listConsultationReports, listPrescriptions } from "../../api/consultationApi";
import { getSpecializationList } from "../../api/doctor/dProfileCreationService";
import { FileText, ClipboardList, Search, Calendar, Briefcase, ArrowRight, ChevronRight, User, Pill, Activity, ArrowLeft, RotateCcw, X, Filter } from "lucide-react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { motion } from "framer-motion";

export const UMedicalRecordsPage: React.FC = () => {
  document.title = "My Medical Records | HealthHub";
  const navigate = useNavigate();

  // Active tab state
  const [activeTab, setActiveTab] = useState<"reports" | "prescriptions">("reports");

  // Feeds lists states
  const [reports, setReports] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  // Loading & Pagination states
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 4; // Paginated blocks

  // Searching & Filtering states (raw values bound to UI controls)
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [specializationList, setSpecializationList] = useState<any[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Debounced filter values for fetching API data
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedSpecialization, setDebouncedSpecialization] = useState("");
  const [debouncedStartDate, setDebouncedStartDate] = useState("");
  const [debouncedEndDate, setDebouncedEndDate] = useState("");

  // Debounce logic: update debounced states 400ms after user stops changing input fields
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setDebouncedSpecialization(specialization);
      setDebouncedStartDate(startDate);
      setDebouncedEndDate(endDate);
    }, 400);

    return () => clearTimeout(timer);
  }, [search, specialization, startDate, endDate]);

  // Fetch records whenever debounced values, page, or tab changes (runs immediately for page/tab clicks)
  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const queryParams = {
          page,
          limit,
          search: debouncedSearch || undefined,
          specialization: debouncedSpecialization || undefined,
          startDate: debouncedStartDate || undefined,
          endDate: debouncedEndDate || undefined,
        };

        if (activeTab === "reports") {
          const res = await listConsultationReports(queryParams);
          if (res.success && res.data) {
            setReports(res.data.reports || []);
            setTotalPages(res.data.totalPages || 1);
            setTotalItems(res.data.total || 0);
          }
        } else {
          const res = await listPrescriptions(queryParams);
          if (res.success && res.data) {
            setPrescriptions(res.data.prescriptions || []);
            setTotalPages(res.data.totalPages || 1);
            setTotalItems(res.data.total || 0);
          }
        }
      } catch (error: any) {
        toast.error(`Failed to retrieve past medical ${activeTab}.`);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [activeTab, page, debouncedSearch, debouncedSpecialization, debouncedStartDate, debouncedEndDate]);

  // Reset page number back to 1 when any filter or tab toggles
  useEffect(() => {
    setPage(1);
  }, [activeTab, debouncedSearch, debouncedSpecialization, debouncedStartDate, debouncedEndDate]);

  // Reset filters immediately
  const handleResetFilters = () => {
    setSearch("");
    setSpecialization("");
    setStartDate("");
    setEndDate("");
    setDebouncedSearch("");
    setDebouncedSpecialization("");
    setDebouncedStartDate("");
    setDebouncedEndDate("");
    setPage(1);
  };

  // Clear search query immediately
  const handleClearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
  };

  // Fetch specialization list on mount
  useEffect(() => {
    getSpecializationList().then((response) => {
      if (response?.success) {
        setSpecializationList(response.specializations || []);
      }
    });
  }, []);

  // Grouping helper
  const groupByMonth = (items: any[]) => {
    const groups: { [key: string]: any[] } = {};
    const sorted = [...items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    sorted.forEach((item) => {
      const monthYear = dayjs(item.createdAt).format("MMMM YYYY");
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(item);
    });

    return groups;
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      <UNavbar />

      {/* Hero Banner header */}
      <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-900/60 pt-20 lg:pt-24 pb-8 transition-colors duration-300 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
                <Activity className="w-8 h-8 text-darkGreen animate-pulse" />
                My Medical Records
              </h1>
              <p className="text-sm text-slate-550 dark:text-slate-400 mt-2 font-medium">
                Access and manage your digital clinical outcome reports, diagnoses, and prescriptions.
              </p>
            </div>

            {/* Search inputs */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search symptoms, medications..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 pl-9 pr-9 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-100/50 dark:border-slate-800/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                {search && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center justify-center cursor-pointer p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filters drawer - always open and static */}
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100/60 dark:border-slate-800/20 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-550 dark:text-slate-400 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-emerald-500" /> Filter Medical Records
              </span>
              {(specialization || startDate || endDate || search) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none py-1 px-2.5 rounded-lg hover:bg-rose-500/5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider block mb-1.5">
                  Doctor Specialization
                </label>
                <div className="relative">
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/30 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
                  >
                    <option value="">All Specializations</option>
                    {specializationList.map((spec) => (
                      <option key={spec.id || spec._id} value={spec.id || spec._id}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider block mb-1.5">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-100/60 dark:border-slate-800/30 rounded-xl focus:outline-none font-medium cursor-pointer"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider block mb-1.5">
                  End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-100/60 dark:border-slate-800/30 rounded-xl focus:outline-none font-medium cursor-pointer"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs header */}
          <div className="flex gap-4 mt-8 border-b border-slate-100 dark:border-slate-900/80 pb-px">
            <button
              onClick={() => setActiveTab("reports")}
              className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === "reports"
                ? "border-darkGreen text-darkGreen dark:border-emerald-500 dark:text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
            >
              <FileText className="w-4 h-4" />
              <span>Consultation Reports</span>
            </button>

            <button
              onClick={() => setActiveTab("prescriptions")}
              className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === "prescriptions"
                ? "border-darkGreen text-darkGreen dark:border-emerald-500 dark:text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Medical Prescriptions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main body area */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="py-24 flex flex-col justify-center items-center gap-4">
            <svg className="animate-spin h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-sm font-medium text-slate-500">Querying records history...</p>
          </div>
        ) : activeTab === "reports" ? (
          // REPORTS LISTING TAB
          reports.length === 0 ? (
            <div className="py-24 text-center p-8 bg-white dark:bg-slate-900 border border-dashed border-slate-200/50 dark:border-slate-800/20 rounded-3xl">
              <p className="text-sm text-slate-400 font-bold">No consultation reports found.</p>
              <p className="text-xs text-slate-550 dark:text-slate-500 mt-1.5">Try widening search criteria or filters.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {Object.entries(groupByMonth(reports)).map(([monthYear, items]) => (
                <div key={monthYear} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest">
                      {monthYear}
                    </span>
                    <div className="h-px bg-slate-100 dark:bg-slate-900 flex-1"></div>
                  </div>
                  <div className="flex flex-col gap-4">
                    {items.map((report) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100/40 dark:border-slate-900/30 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:border-slate-200/30 dark:hover:border-slate-800/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.025)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                      >
                        {/* Doctor & Date */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:w-1/3 shrink-0">
                          <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 rounded-xl">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-base">
                              Dr. {report.doctorName || "Unknown Doctor"}
                            </h3>
                            <p className="text-xs text-emerald-600 dark:text-emerald-450 font-bold uppercase mt-0.5 tracking-wider">
                              {report.doctorSpecialization || "General Practitioner"}
                            </p>
                            <span className="inline-block text-[10px] font-bold text-slate-450 dark:text-slate-400 px-2 py-0.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-100/30 dark:border-slate-800/20 rounded-lg mt-1.5">
                              {dayjs(report.createdAt).format("DD MMM YYYY")}
                            </span>
                          </div>
                        </div>

                        {/* Summary / Diagnosis details */}
                        <div className="flex-1 space-y-1.5 p-3.5 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100/30 dark:border-slate-900/30 rounded-2xl text-xs">
                          <p className="text-slate-600 dark:text-slate-350 leading-relaxed line-clamp-1">
                            <span className="font-bold text-slate-800 dark:text-slate-200">Complaint:</span> "{report.chiefComplaint}"
                          </p>
                          <p className="text-slate-600 dark:text-slate-350 leading-relaxed line-clamp-1">
                            <span className="font-bold text-slate-800 dark:text-slate-200">Diagnosis:</span> {report.diagnosis}
                          </p>
                        </div>

                        {/* Action link */}
                        <div className="shrink-0 flex items-center md:pl-2">
                          <button
                            onClick={() => navigate(`/reports/${report.id}`)}
                            className="w-full md:w-auto px-4 py-2 bg-slate-50/60 hover:bg-slate-100/80 dark:bg-slate-800/30 dark:hover:bg-slate-800/60 text-xs font-bold text-darkGreen dark:text-emerald-450 rounded-xl border border-slate-100/30 dark:border-slate-900/30 transition-all flex items-center justify-center gap-1.5 group shadow-sm cursor-pointer"
                          >
                            <span>View Report</span>
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // PRESCRIPTIONS LISTING TAB
          prescriptions.length === 0 ? (
            <div className="py-24 text-center p-8 bg-white dark:bg-slate-900 border border-dashed border-slate-200/50 dark:border-slate-800/20 rounded-3xl">
              <p className="text-sm text-slate-400 font-bold">No prescriptions found.</p>
              <p className="text-xs text-slate-550 dark:text-slate-500 mt-1.5">Try altering filters or medicine terms.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {Object.entries(groupByMonth(prescriptions)).map(([monthYear, items]) => (
                <div key={monthYear} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest">
                      {monthYear}
                    </span>
                    <div className="h-px bg-slate-100 dark:bg-slate-900 flex-1"></div>
                  </div>
                  <div className="flex flex-col gap-4">
                    {items.map((prescription) => (
                      <motion.div
                        key={prescription.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100/40 dark:border-slate-900/30 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:border-slate-200/30 dark:hover:border-slate-800/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.025)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                      >
                        {/* Doctor & Date */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:w-1/3 shrink-0">
                          <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 rounded-xl">
                            <Pill className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-base">
                              Dr. {prescription.doctorName || "Unknown Doctor"}
                            </h3>
                            <p className="text-xs text-emerald-600 dark:text-emerald-450 font-bold uppercase mt-0.5 tracking-wider">
                              {prescription.doctorSpecialization || "General Practitioner"}
                            </p>
                            <span className="inline-block text-[10px] font-bold text-slate-450 dark:text-slate-400 px-2 py-0.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-100/30 dark:border-slate-800/20 rounded-lg mt-1.5">
                              {dayjs(prescription.createdAt).format("DD MMM YYYY")}
                            </span>
                          </div>
                        </div>

                        {/* Summary / Medicines list details */}
                        <div className="flex-1 space-y-1.5 p-3.5 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100/30 dark:border-slate-900/30 rounded-2xl text-xs">
                          <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">
                            Prescribed Medications
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {prescription.medicines?.map((med: any, i: number) => (
                              <span
                                key={i}
                                className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/5 font-semibold"
                              >
                                {med.medicine}
                              </span>
                            ))}
                            {(!prescription.medicines || prescription.medicines.length === 0) && (
                              <span className="text-xs text-slate-400 italic">No specific medications listed</span>
                            )}
                          </div>
                        </div>

                        {/* Action link */}
                        <div className="shrink-0 flex items-center md:pl-2">
                          <button
                            onClick={() => navigate(`/prescriptions/${prescription.id}`)}
                            className="w-full md:w-auto px-4 py-2 bg-slate-50/60 hover:bg-slate-100/80 dark:bg-slate-800/30 dark:hover:bg-slate-800/60 text-xs font-bold text-darkGreen dark:text-emerald-450 rounded-xl border border-slate-100/30 dark:border-slate-900/30 transition-all flex items-center justify-center gap-1.5 group shadow-sm cursor-pointer"
                          >
                            <span>Open Slip</span>
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Unified Pagination Control panel */}
        {!loading && totalPages > 1 && (
          <div className="mt-10 py-4 flex justify-between items-center border-t border-slate-100/50 dark:border-slate-900/40 text-xs">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/20 text-slate-700 dark:text-slate-350 rounded-xl font-bold hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="font-semibold text-slate-500 dark:text-slate-400">
              Page <span className="font-bold text-slate-800 dark:text-white">{page}</span> of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/20 text-slate-700 dark:text-slate-350 rounded-xl font-bold hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UMedicalRecordsPage;
