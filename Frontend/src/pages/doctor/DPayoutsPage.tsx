import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getDoctorPayouts } from "../../api/payoutService";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import getIcon from "../../helpers/getIcon";
import { X, RotateCcw } from "lucide-react";

const PAYOUT_STATUSES = ["PENDING", "PROCESSED", "FAILED"];

function DPayoutsPage() {
  const navigate = useNavigate();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Search Debouncing logic (avoids duplicate fetches on mount by check-guarding change)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch((prev) => {
        if (prev === searchInput) return prev;
        return searchInput;
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const data = await getDoctorPayouts({
        search: debouncedSearch,
        status: status || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy,
        sortOrder,
        page,
        limit,
      });
      if (data.success) {
        setPayouts(data.data.payouts);
        setTotal(data.data.total);
        setTotalPages(data.data.totalPages);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch payouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, status, startDate, endDate, sortBy, sortOrder, page]);

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "PROCESSED":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setStatus("");
    setStartDate("");
    setEndDate("");
    setSortBy("date");
    setSortOrder("desc");
    setPage(1);
  };

  const activeFiltersCount = [
    status,
    startDate,
    endDate,
    sortBy !== "date" || sortOrder !== "desc" ? "sort" : "",
  ].filter(Boolean).length;

  const hasActiveFilters = searchInput || activeFiltersCount > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Payouts
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
          Review your earned payouts, processing status, and transaction references.
        </p>
      </div>

      {/* Transactions Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center gap-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Payout History</h3>
          <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-850 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-slate-750">
            {total} payout{total !== 1 ? "s" : ""} found
          </span>
        </div>

        {/* Filters Header (always visible search + toggle) */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row gap-3">
          {/* Search Input (always visible) */}
          <div className="flex-1 relative">
            <input
              type="text"
              name="search"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              placeholder="Search payout ID or transaction ID..."
              className="w-full border border-gray-200 dark:border-slate-700 dark:bg-slate-850 dark:text-white rounded-xl pl-3 pr-8 py-2.5 text-sm focus:ring-1 focus:ring-darkGreen outline-none bg-white dark:bg-slate-800 shadow-sm transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setPage(1);
                }}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-650 dark:hover:text-slate-300 cursor-pointer"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Filter Toggle Button (visible only on mobile) */}
            <button
              type="button"
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="flex-1 md:hidden px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
              </svg>
              Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}
            </button>

            {/* Clear Filters Button (visible if filters are active) */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-950/30 rounded-xl text-sm font-bold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer animate-in fade-in duration-200 flex-shrink-0 transition-all"
              >
                <RotateCcw size={14} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Collapsible/Grid Filters Panel */}
        <div className={`p-4 bg-gray-50/30 dark:bg-slate-800/10 border-b border-gray-100 dark:border-slate-800 ${isFilterExpanded ? "grid grid-cols-2 gap-3" : "hidden"} md:grid md:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-150`}>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Status</label>
            <select
              className="w-full border border-gray-200 dark:border-slate-700 dark:bg-slate-850 dark:text-white rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none bg-white dark:bg-slate-800"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              {PAYOUT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Sort By</label>
            <select
              className="w-full border border-gray-200 dark:border-slate-700 dark:bg-slate-855 dark:text-white rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none bg-white dark:bg-slate-800"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split("-");
                setSortBy(sb);
                setSortOrder(so);
                setPage(1);
              }}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
              <option value="appointments-desc">Most Appointments</option>
              <option value="appointments-asc">Fewest Appointments</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
            <input
              type="date"
              className="w-full border border-gray-200 dark:border-slate-700 dark:bg-slate-850 dark:text-white rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none bg-white dark:bg-slate-800"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">End Date</label>
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

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Payout ID</th>
                    <th className="px-6 py-4 font-medium">Payout Date</th>
                    <th className="px-6 py-4 font-medium text-center">Appointments</th>
                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                    <th className="px-6 py-4 font-medium text-center">Status</th>
                    <th className="px-6 py-4 font-medium">Transaction ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-darkGreen"></div>
                        </div>
                      </td>
                    </tr>
                  ) : payouts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-16 text-center text-gray-500 dark:text-slate-400"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-gray-300 dark:text-gray-600">
                            {getIcon("dollar", "36px", "currentColor")}
                          </span>
                          No payouts found.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    payouts.map((payout) => (
                      <tr
                        key={payout._id}
                        className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors"
                        onClick={() =>
                          navigate(`/doctor/payouts/${payout._id}`)
                        }
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-gray-700 dark:text-gray-350">
                            {payout._id}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-slate-400">
                          <p className="font-medium text-gray-800 dark:text-slate-200">
                            {dayjs(payout.createdAt).format("MMM D, YYYY")}
                          </p>
                          <p className="text-xs text-gray-400">
                            {dayjs(payout.createdAt).format("h:mm A")}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {payout.appointmentsCount ??
                              payout.appointmentIds?.length ??
                              0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="font-bold text-gray-900 dark:text-white">
                            ₹{payout.amount?.toFixed(2)}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(payout.status)}`}
                          >
                            {payout.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                            {payout.transaction?._id ||
                              payout.transactionId ||
                              "-"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
 
            {/* Pagination */}
            {!loading && totalPages > 1 && (
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
                  disabled={page === totalPages}
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
 
export default DPayoutsPage;
