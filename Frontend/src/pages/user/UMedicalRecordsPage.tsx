import React, { useState, useEffect } from "react";
import UNavbar from "../../components/user/UNavbar";
import { listConsultationReports, listPrescriptions } from "../../api/consultationApi";
import { FileText, ClipboardList, Search, Filter, Calendar, Briefcase, ArrowRight, ChevronRight, User, Pill, Activity, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import dayjs from "dayjs";

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

  // Searching & Filtering states
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search trigger logic
  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const queryParams = {
          page,
          limit,
          search: search || undefined,
          specialization: specialization || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
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

    const timer = setTimeout(() => {
      fetchRecords();
    }, 300); // 300ms Debounce

    return () => clearTimeout(timer);
  }, [activeTab, page, search, specialization, startDate, endDate]);

  // Reset page number when search/filters or tabs toggle
  useEffect(() => {
    setPage(1);
  }, [activeTab, search, specialization, startDate, endDate]);

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      <UNavbar />

      {/* Hero Banner header */}
      <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-20 lg:pt-24 pb-8 transition-colors duration-300">
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
                  className="w-64 pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${showFilters
                  ? "bg-slate-900 text-white border-slate-900 dark:bg-emerald-500 dark:text-slate-950 dark:border-emerald-500"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50"
                  }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{showFilters ? "Filters Open" : "Filter Records"}</span>
              </button>
            </div>
          </div>

          {/* Expandable filters drawer */}
          {showFilters && (
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
                  Doctor Specialization
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Cardiology"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-medium"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
                  End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-medium"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>
          )}

          {/* Tabs header */}
          <div className="flex gap-4 mt-8 border-b border-slate-100 dark:border-slate-800 pb-px">
            <button
              onClick={() => setActiveTab("reports")}
              className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === "reports"
                ? "border-darkGreen text-darkGreen dark:border-emerald-500 dark:text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
            >
              <FileText className="w-4 h-4" />
              <span>Consultation Reports</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold ml-0.5">
                {activeTab === "reports" ? totalItems : "-"}
              </span>
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
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold ml-0.5">
                {activeTab === "prescriptions" ? totalItems : "-"}
              </span>
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
            <div className="py-24 text-center p-8 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <p className="text-sm text-slate-400 font-bold">No consultation reports found.</p>
              <p className="text-xs text-slate-550 dark:text-slate-500 mt-1.5">Try widening search criteria or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-slate-350 dark:hover:border-slate-700/80 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Header: Dr name & Specialization */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                          Dr. {report.doctorName || "Unknown Doctor"}
                        </h3>
                        <p className="text-xs text-emerald-600 dark:text-emerald-450 font-bold uppercase mt-0.5 tracking-wider">
                          {report.doctorSpecialization || "General Practitioner"}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-450 dark:text-slate-400 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-lg">
                        {dayjs(report.createdAt).format("DD MMM YYYY")}
                      </span>
                    </div>

                    {/* Content highlights */}
                    <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded-xl text-xs">
                      <p className="text-slate-650 dark:text-slate-350 leading-relaxed line-clamp-2">
                        <span className="font-bold text-slate-850 dark:text-slate-200">Complaint:</span> "{report.chiefComplaint}"
                      </p>
                      <p className="text-slate-650 dark:text-slate-350 leading-relaxed font-semibold">
                        <span className="font-bold text-slate-850 dark:text-slate-200">Diagnosis:</span> {report.diagnosis}
                      </p>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
                    <button
                      onClick={() => navigate(`/reports/${report.id}`)}
                      className="text-xs font-bold text-darkGreen dark:text-emerald-400 hover:opacity-85 transition-opacity flex items-center gap-1.5"
                    >
                      <span>View Full Summary</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // PRESCRIPTIONS LISTING TAB
          prescriptions.length === 0 ? (
            <div className="py-24 text-center p-8 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <p className="text-sm text-slate-400 font-bold">No prescriptions found.</p>
              <p className="text-xs text-slate-550 dark:text-slate-500 mt-1.5">Try altering filters or medicine terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {prescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm hover:border-slate-350 dark:hover:border-slate-700/80 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header: Dr name & Date */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                          <Pill className="w-4 h-4 text-emerald-500" />
                          Dr. {prescription.doctorName || "Unknown Doctor"}
                        </h3>
                        <p className="text-xs text-emerald-650 dark:text-emerald-400 font-bold uppercase mt-0.5">
                          {prescription.doctorSpecialization || "General Medicine"}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-450 dark:text-slate-400 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-lg">
                        {dayjs(prescription.createdAt).format("DD MMM YYYY")}
                      </span>
                    </div>

                    {/* Medicines listing preview */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Prescribed Medications
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {prescription.medicines?.slice(0, 3).map((med: any, i: number) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 font-bold"
                          >
                            {med.medicine}
                          </span>
                        ))}
                        {prescription.medicines?.length > 3 && (
                          <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                            +{prescription.medicines.length - 3} More
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
                    <button
                      onClick={() => navigate(`/prescriptions/${prescription.id}`)}
                      className="text-xs font-bold text-darkGreen dark:text-emerald-400 hover:opacity-85 transition-opacity flex items-center gap-1.5"
                    >
                      <span>Open Slip</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Unified Pagination Control panel */}
        {!loading && totalPages > 1 && (
          <div className="mt-10 py-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-xl font-bold hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="font-semibold text-slate-500 dark:text-slate-400">
              Page <span className="font-bold text-slate-850 dark:text-white">{page}</span> of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-xl font-bold hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1 shadow-sm"
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
