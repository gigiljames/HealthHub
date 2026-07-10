import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import UAppointmentCard from "../../components/user/booking/UAppointmentCard";
import { getPatientAppointments } from "../../api/user/bookingService";
import getIcon from "../../helpers/getIcon";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "UPCOMING" | "PAST" | "CANCELLED" | "ALL";

interface FilterParams {
  status: string;
  mode: string;
  timeRange: string;
  specialization: string;
  paymentStatus: string;
}

const defaultFilters: FilterParams = {
  status: "",
  mode: "",
  timeRange: "",
  specialization: "",
  paymentStatus: "",
};

function UAppointmentsListingPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("UPCOMING");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [filters, setFilters] = useState<FilterParams>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const isInitialLoadRef = useRef(true);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  useEffect(() => {
    getPatientAppointments().then((response) => {
      if (response?.success && response.appointments) {
        const pending = response.appointments.filter(
          (app: any) => app.status === "RESCHEDULE_PENDING"
        );
        setPendingRequests(pending);
      }
    }).catch(err => console.error("Failed to load reschedule requests in listing:", err));
  }, []);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        tab,
        search,
        sort,
        page,
        limit: 10,
        ...filters,
      };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await getPatientAppointments(params);
      const fetchedAppointments = res.appointments || [];
      setAppointments(fetchedAppointments);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);

      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        if (
          tab === "UPCOMING" &&
          fetchedAppointments.length === 0 &&
          !search &&
          !Object.values(filters).some(Boolean)
        ) {
          setTab("ALL");
          setPage(1);
        }
      }
    } catch (err) {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [tab, search, sort, filters, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAppointments();
    }, 400); // Debounce for search
    return () => clearTimeout(timer);
  }, [fetchAppointments]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const tabs: { key: Tab; label: string }[] = [
    { key: "UPCOMING", label: "Upcoming" },
    { key: "PAST", label: "Past" },
    // { key: "CANCELLED", label: "Cancelled" },
    { key: "ALL", label: "All" },
  ];

  const inputClass =
    "px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen focus:border-transparent outline-none transition-all duration-200";

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-0 sm:px-4 pt-[80px] md:pt-[90px] pb-16">
        {/* Page Header */}

        <div className="mb-6 sm:mb-8 pl-4 pr-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">
            My Appointments
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Manage and track all your consultations
          </p>
        </div>

        {pendingRequests.length > 0 && (
          <div className="mb-6 sm:mb-8 mx-0 sm:mx-4">
            <div className="bg-amber-50 dark:bg-amber-950/20 border-y sm:border border-amber-250 dark:border-amber-900/50 p-4 rounded-none sm:rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-amber-600 dark:text-amber-500 shrink-0">
                  {getIcon("exclamation-circle", "24px")}
                </span>
                <div>
                  <h4 className="font-bold text-amber-900 dark:text-amber-250 text-sm">
                    Action Required: Reschedule Proposed
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                    You have {pendingRequests.length} appointment reschedule {pendingRequests.length === 1 ? "request" : "requests"} awaiting your approval.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (pendingRequests.length === 1) {
                    navigate(`/appointments/${pendingRequests[0]._id || pendingRequests[0].id}`);
                  } else {
                    setTab("ALL");
                    setFilters({ ...defaultFilters, status: "RESCHEDULE_PENDING" });
                    setPage(1);
                  }
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer shrink-0 w-full sm:w-auto text-center"
              >
                Review Proposed Times
              </button>
            </div>
          </div>
        )}

        {/* Tabs - Mac-style Pill selector */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6 sm:mb-8 border border-gray-200 dark:border-gray-700 mx-4 overflow-x-auto whitespace-nowrap scrollbar-none flex-nowrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                if (t.key === "PAST" || t.key === "UPCOMING") {
                  setFilters({ ...filters, timeRange: "" });
                }
                setTab(t.key);
                setPage(1);
              }}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex-shrink-0 ${tab === t.key
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm font-bold"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Unified Search, Sort, and Filter Box */}
        <div
          className="bg-white dark:bg-gray-900 p-4 rounded-none sm:rounded-2xl shadow-sm border-y sm:border border-gray-200 dark:border-gray-800 transition-colors duration-300 mb-6 sm:mb-8 mx-0 sm:mx-4 sm:w-[calc(100%-2rem)]"
        >
          {/* Top Row - Always Visible */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between w-full">
            {/* Left Group */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-1/2">
              <div className="relative flex-1 w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  {getIcon("search", "18px")}
                </span>
                <input
                  type="text"
                  placeholder="Search by doctor name or specialization..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className={`w-full pl-10 pr-10 ${inputClass}`}
                />
                {search.length > 0 && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {getIcon("close", "18px") || (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Right Group */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as "newest" | "oldest");
                  setPage(1);
                }}
                className={`${inputClass} min-w-[200px] cursor-pointer w-full sm:w-auto`}
              >
                <option value="newest">Date (Newest First)</option>
                <option value="oldest">Date (Oldest First)</option>
              </select>

              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold transition-all rounded-lg cursor-pointer w-full sm:w-auto ${showFilters || activeFilterCount > 0
                    ? "bg-darkGreen border border-darkGreen text-white shadow-md shadow-darkGreen/20"
                    : "bg-darkGreen/90 hover:bg-darkGreen dark:bg-emerald-600 dark:hover:bg-emerald-500 border border-transparent text-white transition-colors"
                  }`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0014 13.828V19a1 1 0 01-.553.894l-4 2A1 1 0 018 21v-7.172a1 1 0 00-.293-.707L1.293 6.707A1 1 0 011 6V4z"
                  />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-white text-darkGreen dark:bg-gray-900 dark:text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ml-1">
                    {activeFilterCount}
                  </span>
                )}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className={`w-4 h-4 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Expanded Content Dropdowns */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Status Dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={filters.status}
                        onChange={(e) => {
                          setFilters({ ...filters, status: e.target.value });
                          setPage(1);
                        }}
                        className={`${inputClass} cursor-pointer text-sm font-medium py-2`}
                      >
                        <option value="">All Statuses</option>
                        <option value="PENDING_PAYMENT">Pending Payment</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="NO_SHOW">No Show</option>
                      </select>
                    </div>

                    {/* Mode Dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                        Consultation Mode
                      </label>
                      <select
                        name="mode"
                        value={filters.mode}
                        onChange={(e) => {
                          setFilters({ ...filters, mode: e.target.value });
                          setPage(1);
                        }}
                        className={`${inputClass} cursor-pointer text-sm font-medium py-2`}
                      >
                        <option value="">All Modes</option>
                        <option value="online">Online</option>
                        <option value="in-person">In-person</option>
                      </select>
                    </div>

                    {/* Date Range Dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                        Date Range
                      </label>
                      <select
                        name="timeRange"
                        value={filters.timeRange}
                        onChange={(e) => {
                          setTab("ALL");
                          setFilters({ ...filters, timeRange: e.target.value });
                          setPage(1);
                        }}
                        className={`${inputClass} cursor-pointer text-sm font-medium py-2`}
                      >
                        <option value="">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                    </div>

                    {/* Payment Status Dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                        Payment Status
                      </label>
                      <select
                        name="paymentStatus"
                        value={filters.paymentStatus}
                        onChange={(e) => {
                          setFilters({
                            ...filters,
                            paymentStatus: e.target.value,
                          });
                          setPage(1);
                        }}
                        className={`${inputClass} cursor-pointer text-sm font-medium py-2`}
                      >
                        <option value="">All Payment Statuses</option>
                        <option value="PAID">Paid</option>
                        <option value="REFUNDED">Refunded</option>
                        <option value="FAILED">Failed</option>
                        <option value="PENDING">Pending</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end p-2">
                    <button
                      onClick={() => {
                        setFilters(defaultFilters);
                        setPage(1);
                      }}
                      className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 transition-colors uppercase"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="px-0 sm:px-4">
          {/* Appointment List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-darkGreen rounded-full animate-spin"></div>
              </div>
            ) : appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-900 rounded-none sm:rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 mx-4 sm:mx-0">
                <span className="text-gray-300 dark:text-gray-600 mb-4">
                  {getIcon("calendar", "48px")}
                </span>
                <p className="text-gray-900 dark:text-white font-semibold text-lg">
                  No appointments found
                </p>
                <p className="text-gray-550 dark:text-gray-400 text-sm mt-1 text-center px-4">
                  Try adjusting your filters or search query to find what you're
                  looking for.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  {appointments.map((appt) => (
                    <UAppointmentCard key={appt._id} appointment={appt} />
                  ))}
                </div>

                {/* Premium Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 dark:border-gray-800 pt-6 mt-4 w-full px-4 sm:px-0">
                    {/* Information Text */}
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      Showing <span className="font-semibold text-gray-900 dark:text-white">{Math.min((page - 1) * 10 + 1, total)}</span> to{" "}
                      <span className="font-semibold text-gray-900 dark:text-white">{Math.min(page * 10, total)}</span> of{" "}
                      <span className="font-semibold text-gray-900 dark:text-white">{total}</span> appointments
                    </div>

                    {/* Pagination buttons */}
                    <div className="flex items-center gap-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className="p-2 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 text-gray-700 dark:text-gray-300 flex items-center justify-center min-w-[36px] h-9"
                        title="Previous Page"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      {/* Numbered page buttons */}
                      {(() => {
                        const pages: (number | string)[] = [];
                        const maxVisible = 5;
                        if (totalPages <= maxVisible) {
                          for (let i = 1; i <= totalPages; i++) pages.push(i);
                        } else {
                          if (page <= 3) {
                            pages.push(1, 2, 3, 4, "...", totalPages);
                          } else if (page >= totalPages - 2) {
                            pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                          } else {
                            pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
                          }
                        }
                        return pages;
                      })().map((p, idx) => {
                        if (p === "...") {
                          return (
                            <span
                              key={`dots-${idx}`}
                              className="w-9 h-9 flex items-center justify-center text-sm font-medium text-gray-400"
                            >
                              &bull;&bull;&bull;
                            </span>
                          );
                        }
                        return (
                          <button
                            key={`page-${p}`}
                            onClick={() => setPage(p as number)}
                            className={`w-9 h-9 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center border ${page === p
                                ? "bg-darkGreen border-darkGreen text-white shadow-md shadow-darkGreen/25 scale-105"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-800 border-gray-200 dark:border-gray-800"
                              }`}
                          >
                            {p}
                          </button>
                        );
                      })}

                      {/* Next Button */}
                      <button
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                        disabled={page === totalPages}
                        className="p-2 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 text-gray-700 dark:text-gray-300 flex items-center justify-center min-w-[36px] h-9"
                        title="Next Page"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UAppointmentsListingPage;
