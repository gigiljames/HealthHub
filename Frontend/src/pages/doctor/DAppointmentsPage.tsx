import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { getDoctorAppointments } from "../../api/doctor/appointmentService";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { debounce } from "lodash";
import getIcon from "../../helpers/getIcon";
import { X, RotateCcw } from "lucide-react";

interface LocationInfo {
  type: string;
  coordinates: number[];
  address: string;
  placeId: string;
}

interface Appointment {
  id: string;
  start: string;
  end: string;
  locationName: string;
  location: LocationInfo;
  mode: string;
  status: string;
  patientName: string;
  dob: string;
  gender: string;
  reason: string;
}

function DAppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination State
  const [tab, setTab] = useState("UPCOMING");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [mode, setMode] = useState(""); // "" | "online" | "in-person"
  const [timeRange, setTimeRange] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Debounced Search Handler
  const debouncedSearchHandler = useCallback(
    debounce((query: string) => setDebouncedSearch(query), 500),
    [],
  );

  useEffect(() => {
    debouncedSearchHandler(search);
    return () => debouncedSearchHandler.cancel();
  }, [search, debouncedSearchHandler]);

  // Fetch Appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {
        tab,
        search: debouncedSearch,
        mode,
        timeRange,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sort,
        page,
        limit,
      };

      const data = await getDoctorAppointments(params);
      if (data.success) {
        setAppointments(data.appointments);
        setTotalPages(data.totalPages);
      } else {
        toast.error(data.message || "Failed to fetch appointments");
      }
    } catch (error: any) {
      toast.error("Error fetching appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, debouncedSearch, mode, timeRange, startDate, endDate, sort, page]);

  // Handlers
  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setMode("");
    setTimeRange("");
    setStartDate("");
    setEndDate("");
    setSort("newest");
    setPage(1);
  };

  const activeFiltersCount = [
    mode !== "",
    timeRange !== "",
    startDate !== "",
    endDate !== "",
  ].filter(Boolean).length;

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
        return "bg-green-105 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case "RESCHEDULE_PENDING":
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
      case "COMPLETED":
        return "bg-blue-105 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      case "CANCELLED":
      case "CANCELLED_BY_DOCTOR":
      case "CANCELLED_BY_USER":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      case "NO_SHOW":
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
      default:
        return "bg-yellow-105 text-yellow-700 border-yellow-205 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-805";
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Appointments
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
          Review patient bookings, upcoming consultations, and clinical visit history.
        </p>
      </div>

      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5 sm:p-6 flex flex-col gap-6 transition-colors duration-300">
        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-100 dark:border-slate-800 pb-2 overflow-x-auto nice-scroll">
          {["UPCOMING", "COMPLETED", "CANCELLED", "ALL"].map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t === "ALL" ? "" : t)}
              className={`px-4 py-2 font-semibold text-sm rounded-t-md transition-all whitespace-nowrap cursor-pointer ${(tab === t && t !== "ALL") || (tab === "" && t === "ALL")
                ? "text-darkGreen border-b-2 border-darkGreen font-bold"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                }`}
            >
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Filters Header (always visible search + toggle) */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input (always visible) */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search patient name..."
              className="w-full border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl pl-3 pr-8 py-2.5 text-sm focus:ring-1 focus:ring-darkGreen outline-none bg-white transition-all"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 cursor-pointer"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {/* Mobile Expand Filters Button */}
            <button
              type="button"
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className="md:hidden flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 dark:text-white transition-colors cursor-pointer"
            >
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-darkGreen text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Clear Filters Button */}
            {(activeFiltersCount > 0 || search) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800  transition-colors cursor-pointer text-slate-655 dark:text-slate-300"
                title="Clear all filters"
              >
                <RotateCcw size={16} />
                <span className="hidden sm:inline">Clear Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible/Expandable Filters Panel */}
        <div className={`${isFiltersExpanded ? "block" : "hidden"} md:block`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Consultation Mode</label>
              <select
                className="w-full border border-gray-200 dark:border-slate-700 dark:bg-slate-855 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-darkGreen outline-none bg-white dark:bg-slate-800 shadow-sm"
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Modes</option>
                <option value="online">Online</option>
                <option value="in-person">In-Person</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Sort By</label>
              <select
                className="w-full border border-gray-200 dark:border-slate-700 dark:bg-slate-855 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-darkGreen outline-none bg-white dark:bg-slate-800 shadow-sm"
                value={sort}
                onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
              >
                <option value="newest">Sort: By Date (Desc)</option>
                <option value="oldest">Sort: By Date (Asc)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Date Period</label>
              <select
                className="w-full border border-gray-200 dark:border-slate-700 dark:bg-slate-855 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-darkGreen outline-none bg-white dark:bg-slate-800 shadow-sm"
                value={timeRange}
                onChange={(e) => {
                  setTimeRange(e.target.value);
                  setStartDate("");
                  setEndDate("");
                  setPage(1);
                }}
              >
                <option value="">Any Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Date Range</option>
              </select>
            </div>
          </div>

          {/* Custom Date Filters */}
          {timeRange === "custom" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-2xl animate-in slide-in-from-top duration-200">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none bg-white dark:bg-slate-800"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">End Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-200 dark:border-slate-700 dark:bg-slate-855 dark:text-white rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none bg-white dark:bg-slate-800"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  min={startDate}
                />
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-slate-800">
                  <th className="py-4 px-6 font-medium">Patient</th>
                  <th className="py-4 px-6 font-medium">Date & Time</th>
                  <th className="py-4 px-6 font-medium">Location</th>
                  <th className="py-4 px-6 font-medium">Mode</th>
                  <th className="py-4 px-6 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-darkGreen mx-auto mb-2"></div>
                      Loading appointments...
                    </td>
                  </tr>
                ) : appointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-500">
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  appointments.map((apt) => (
                    <tr
                      key={apt.id}
                      className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/doctor/appointments/${apt.id}`)}
                    >
                      <td className="py-4 px-6">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {apt.patientName || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-slate-400 capitalize">
                          {apt.gender} •{" "}
                          {apt.dob
                            ? dayjs().diff(dayjs(apt.dob), "year") + " yrs"
                            : "N/A"}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-medium text-gray-800 dark:text-slate-200">
                          {dayjs(apt.start).format("MMM D, YYYY")}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-slate-400">
                          {dayjs(apt.start).format("h:mm A")} - {dayjs(apt.end).format("h:mm A")}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-gray-700 dark:text-slate-300">
                        {apt.locationName || "N/A"}
                      </td>
                      <td className="py-4 px-6">
                        <span className="capitalize text-sm font-semibold text-gray-800 dark:text-slate-200">
                          {apt.mode}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusBadgeClass(
                            apt.status,
                          )}`}
                        >
                          {apt.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && appointments.length > 0 && (
            <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-slate-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-slate-400 font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-slate-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DAppointmentsPage;
