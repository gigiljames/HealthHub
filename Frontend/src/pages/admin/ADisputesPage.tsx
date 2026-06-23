import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import AMobileSidebar from "../../components/admin/AMobileSidebar";
import ASidebar from "../../components/admin/ASidebar";
import { getAdminDisputes } from "../../api/disputeApi";
import toast from "react-hot-toast";
import { ShieldAlert, User, Clock, AlertTriangle, Eye } from "lucide-react";
import dayjs from "dayjs";

interface DisputeListItem {
  id: string;
  createdAt: string;
  reporterId: string;
  reporterName: string;
  reporterRole: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedUserRole: string;
  reason: string;
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED";
}

function ADisputesPage() {
  document.title = "Disputes Management";
  const navigate = useNavigate();

  const [disputes, setDisputes] = useState<DisputeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalDisputes, setTotalDisputes] = useState<number>(0);
  const limit = 8;

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [reporterRole, setReporterRole] = useState("all");
  const [reportedUserRole, setReportedUserRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [timeRange, setTimeRange] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [sort, setSort] = useState("newest");

  // Debounced search state
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleResetFilters = () => {
    setSearch("");
    setReporterRole("all");
    setReportedUserRole("all");
    setStatus("all");
    setTimeRange("all");
    setCustomStartDate("");
    setCustomEndDate("");
    setSort("newest");
    setPage(1);
  };

  const fetchDisputes = async () => {
    try {
      setLoading(true);

      // Date ranges
      let startDate: string | undefined;
      let endDate: string | undefined;
      const today = dayjs();
      if (timeRange === "7days") {
        startDate = today.subtract(7, "day").format("YYYY-MM-DD");
        endDate = today.format("YYYY-MM-DD");
      } else if (timeRange === "30days") {
        startDate = today.subtract(30, "day").format("YYYY-MM-DD");
        endDate = today.format("YYYY-MM-DD");
      } else if (timeRange === "custom") {
        if (customStartDate) startDate = customStartDate;
        if (customEndDate) endDate = customEndDate;
      }

      const res = await getAdminDisputes({
        page,
        limit,
        search: debouncedSearch || undefined,
        reporterRole: reporterRole !== "all" ? reporterRole : undefined,
        reportedUserRole: reportedUserRole !== "all" ? reportedUserRole : undefined,
        status: status !== "all" ? status : undefined,
        timeRange: timeRange !== "custom" ? timeRange : undefined,
        startDate,
        endDate,
        sort,
      });

      if (res.success) {
        setDisputes(res.disputes || []);
        setTotalPages(res.totalPages || 1);
        setTotalDisputes(res.total || 0);
      } else {
        toast.error("Failed to load disputes list.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error fetching disputes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [page, debouncedSearch, reporterRole, reportedUserRole, status, timeRange, customStartDate, customEndDate, sort]);

  return (
    <>
      <AMobileSidebar page="disputes" />
      <div className="flex w-full flex-col lg:flex-row min-h-screen bg-[#f3f4f6] dark:bg-[#1a1c23]">
        <ASidebar page="disputes" />
        <div className="w-screen lg:flex-1 relative">
          <div className="flex flex-col gap-4 p-4 md:p-6 h-screen overflow-y-auto min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-205 w-full pb-10">

            {/* Page Header */}
            <div className="flex justify-between items-center border-b border-gray-250 dark:border-gray-850 pb-4 mb-2">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-7 h-7 text-red-500" />
                  <span>Disputes Management</span>
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Moderate reported issues, review chat histories and consultation reports, and enforce user restrictions.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-xl shadow-sm text-center">
                <span className="text-xs font-bold text-gray-400 block tracking-wider leading-none">Total Issues</span>
                <span className="text-xl font-black text-gray-805 dark:text-white mt-1.5 block leading-none">{totalDisputes}</span>
              </div>
            </div>

            {/* Search & Filters Panel */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 p-5 rounded-3xl shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Search & Filter Controls</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
                {/* Search Text */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Search</label>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Doctor, patient, description..."
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-750 dark:text-gray-200 outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                {/* Filter by Reporter Role */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Reporter Role</label>
                  <select
                    value={reporterRole}
                    onChange={(e) => {
                      setReporterRole(e.target.value);
                      setPage(1);
                    }}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-gray-200 outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="all">All</option>
                    <option value="user">Patient</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </div>

                {/* Filter by Reported Role */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Reported Role</label>
                  <select
                    value={reportedUserRole}
                    onChange={(e) => {
                      setReportedUserRole(e.target.value);
                      setPage(1);
                    }}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-gray-200 outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="all">All</option>
                    <option value="user">Patient</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </div>

                {/* Filter by Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</label>
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      setPage(1);
                    }}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-gray-200 outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="OPEN">Open</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>

                {/* Sort Option */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Sort By</label>
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      setPage(1);
                    }}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-255 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-gray-200 outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>

                {/* Time Range Filter */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Date Period</label>
                  <select
                    value={timeRange}
                    onChange={(e) => {
                      setTimeRange(e.target.value);
                      if (e.target.value !== "custom") {
                        setCustomStartDate("");
                        setCustomEndDate("");
                      }
                      setPage(1);
                    }}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-gray-200 outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="all">All Time</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                {/* Reset Filters button */}
                <div className="flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="w-full py-2 border border-gray-250 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-bold text-xs text-gray-700 dark:text-gray-300 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Reset All</span>
                  </button>
                </div>
              </div>

              {/* Custom Date Filters */}
              {timeRange === "custom" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-left duration-200 border-t border-gray-100 dark:border-gray-800 pt-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => {
                        setCustomStartDate(e.target.value);
                        setPage(1);
                      }}
                      className="bg-gray-50 dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-gray-200"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => {
                        setCustomEndDate(e.target.value);
                        setPage(1);
                      }}
                      min={customStartDate}
                      className="bg-gray-50 dark:bg-gray-800 border border-gray-255 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-gray-200"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Main Listing Area */}
            <div className="w-full mt-2 flex-1 flex flex-col">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20">
                  <svg className="animate-spin h-10 w-10 text-red-500 mb-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <p className="text-sm font-semibold text-gray-500">Loading disputes...</p>
                </div>
              ) : disputes.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 border border-dashed border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-3xl p-6 text-center">
                  <AlertTriangle className="text-gray-400 w-12 h-12 mb-3" />
                  <p className="text-gray-550 dark:text-gray-400 font-semibold text-sm">
                    {search || reporterRole !== "all" || reportedUserRole !== "all" || status !== "all" || timeRange !== "all"
                      ? "No disputes found matching the filters."
                      : "No user dispute reports exist in the system."}
                  </p>
                  {(search || reporterRole !== "all" || reportedUserRole !== "all" || status !== "all" || timeRange !== "all") && (
                    <button
                      onClick={handleResetFilters}
                      className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {disputes.map((disp) => (
                      <div
                        key={disp.id}
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800/80 p-6 rounded-3xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden"
                      >
                        {/* Upper Details Row */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1 min-w-0 flex-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${disp.status === "OPEN"
                              ? "bg-blue-100 text-blue-805 dark:bg-blue-900/30 dark:text-blue-400"
                              : disp.status === "UNDER_REVIEW"
                                ? "bg-yellow-100 text-yellow-805 dark:bg-yellow-900/30 dark:text-yellow-450"
                                : "bg-green-100 text-green-805 dark:bg-green-900/30 dark:text-green-400"
                              }`}>
                              {disp.status === "UNDER_REVIEW" ? "Under Review" : disp.status}
                            </span>
                            <h4 className="text-base font-extrabold text-gray-850 dark:text-gray-150 leading-snug mt-1.5">
                              {disp.reason}
                            </h4>
                          </div>

                          <button
                            onClick={() => navigate(`/admin/disputes/${disp.id}`)}
                            className="p-2.5 bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all cursor-pointer border border-transparent border-red-500/10 flex items-center gap-1.5 text-xs font-bold shrink-0 shadow-sm"
                            title="View Dispute Details"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Moderate</span>
                          </button>
                        </div>

                        <hr className="border-t border-gray-100 dark:border-gray-800/80" />

                        {/* Reporter & Reported Info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl border border-gray-100 dark:border-gray-800/60">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Reporter</span>
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                                {disp.reporterName}
                              </span>
                            </div>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase tracking-wider inline-block mt-1">
                              {disp.reporterRole === "user" ? "Patient" : "Doctor"}
                            </span>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl border border-gray-100 dark:border-gray-800/60">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Reported Party</span>
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-gray-450" />
                              <span className="text-xs font-bold text-gray-805 dark:text-gray-200 truncate">
                                {disp.reportedUserName}
                              </span>
                            </div>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase tracking-wider inline-block mt-1">
                              {disp.reportedUserRole === "user" ? "Patient" : "Doctor"}
                            </span>
                          </div>
                        </div>

                        {/* Footer Details */}
                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/20 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800/60">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>
                              Reported on {new Date(disp.createdAt).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-250 dark:border-gray-800 pt-4 mt-2">
                      <span className="text-xs font-bold text-gray-500">
                        Page <span className="text-gray-850 dark:text-white font-extrabold">{page}</span> of{" "}
                        <span className="text-gray-855 dark:text-white font-extrabold">{totalPages}</span> ({totalDisputes} total disputes)
                      </span>
                      <div className="flex gap-2">
                        <button
                          disabled={page === 1}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          className="px-3.5 py-1.5 border border-gray-250 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-850 rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-sm bg-white dark:bg-gray-900"
                        >
                          Previous
                        </button>
                        <button
                          disabled={page === totalPages || totalPages === 0}
                          onClick={() => setPage((p) => p + 1)}
                          className="px-3.5 py-1.5 border border-gray-250 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-850 rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-sm bg-white dark:bg-gray-900"
                        >
                          Next
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
    </>
  );
}

export default ADisputesPage;
