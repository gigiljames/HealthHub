import { useEffect, useState, useCallback } from "react";
import UNavbar from "../../components/user/UNavbar";
import UAppointmentCard from "../../components/user/booking/UAppointmentCard";
import UAppointmentsFilterPanel from "../../components/user/booking/UAppointmentsFilterPanel";
import { getPatientAppointments } from "../../api/user/bookingService";

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
  const [tab, setTab] = useState<Tab>("UPCOMING");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [filters, setFilters] = useState<FilterParams>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        tab,
        search,
        sort,
        ...filters,
      };
      // Remove empty string params
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await getPatientAppointments(params);
      console.log(res);
      setAppointments(res.appointments || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [tab, search, sort, filters]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const tabs: { key: Tab; label: string }[] = [
    { key: "UPCOMING", label: "Upcoming" },
    { key: "PAST", label: "Past" },
    { key: "CANCELLED", label: "Cancelled" },
    { key: "ALL", label: "All" },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100">
      <UNavbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Appointments</h1>
          <p className="text-gray-500 mt-1">
            Manage and track all your consultations
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
                tab === t.key
                  ? "text-darkGreen border-b-2 border-darkGreen bg-white dark:bg-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search + Sort + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by doctor name or specialization..."
              // value={search}
              // onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-inputBorder rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-darkGreen dark:bg-gray-900"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
            className="border border-inputBorder rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-darkGreen dark:bg-gray-900 min-w-[180px]"
          >
            <option value="newest">Date (Newest First)</option>
            <option value="oldest">Date (Oldest First)</option>
          </select>

          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
              showFilters || activeFilterCount > 0
                ? "border-darkGreen text-darkGreen bg-green-50"
                : "border-inputBorder text-gray-600 hover:bg-gray-50"
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
              <span className="bg-darkGreen text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex gap-6">
          {/* Filter Panel */}
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <UAppointmentsFilterPanel
                filters={filters}
                setFilters={setFilters}
              />
              {activeFilterCount > 0 && (
                <button
                  onClick={() => setFilters(defaultFilters)}
                  className="mt-3 w-full text-sm text-red-500 hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Appointment List */}
          <div className="flex-1 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <svg
                  className="animate-spin h-8 w-8 text-darkGreen"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              </div>
            ) : appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <svg
                  className="h-12 w-12 text-gray-300 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-gray-500 font-medium">
                  No appointments found
                </p>
                <p className="text-gray-400 text-sm">
                  Try adjusting your filters or search query
                </p>
              </div>
            ) : (
              appointments.map((appt) => (
                <UAppointmentCard key={appt._id} appointment={appt} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UAppointmentsListingPage;
