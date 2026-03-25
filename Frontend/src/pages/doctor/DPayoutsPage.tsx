import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { getDoctorPayouts } from "../../api/payoutService";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { debounce } from "lodash";
import getIcon from "../../helpers/getIcon";

const PAYOUT_STATUSES = ["PENDING", "PROCESSED", "FAILED"];

function DPayoutsPage() {
  const navigate = useNavigate();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showDateRange, setShowDateRange] = useState(false);

  const debouncedSearchHandler = useCallback(
    debounce((query: string) => setDebouncedSearch(query), 500),
    [],
  );

  useEffect(() => {
    debouncedSearchHandler(search);
    return () => debouncedSearchHandler.cancel();
  }, [search, debouncedSearchHandler]);

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

  return (
    <div className="flex justify-center w-full">
        <div className="w-[95%] lg:w-[90%] max-w-[1400px] flex flex-col gap-6 py-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Payouts
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {total} payout{total !== 1 ? "s" : ""} found
            </span>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-[#1e2029] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#13151c] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                <span className="text-gray-400">
                  {getIcon("search", "15px", "currentColor")}
                </span>
                <input
                  type="text"
                  placeholder="Search payout ID or transaction ID..."
                  className="bg-transparent outline-none w-full text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              {/* Status Filter */}
              <select
                className="bg-gray-50 dark:bg-[#13151c] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-darkGreen"
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

              {/* Sort */}
              <select
                className="bg-gray-50 dark:bg-[#13151c] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-darkGreen"
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

              {/* Date Range Toggle */}
              <button
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm border transition-colors ${showDateRange ? "bg-darkGreen/10 border-darkGreen text-darkGreen" : "bg-gray-50 dark:bg-[#13151c] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"}`}
                onClick={() => setShowDateRange(!showDateRange)}
              >
                {getIcon("calendar", "15px", "currentColor")}
                {showDateRange ? "Hide Date Filter" : "Filter by Date"}
              </button>
            </div>

            {/* Custom Date Range */}
            {showDateRange && (
              <div className="mt-4 flex flex-col sm:flex-row gap-4 items-center border-t border-gray-100 dark:border-gray-800 pt-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    From:
                  </span>
                  <input
                    type="date"
                    className="flex-1 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#13151c] rounded p-1.5 text-sm outline-none text-gray-700 dark:text-gray-300"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    To:
                  </span>
                  <input
                    type="date"
                    className="flex-1 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#13151c] rounded p-1.5 text-sm outline-none text-gray-700 dark:text-gray-300"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setPage(1);
                    }}
                    min={startDate}
                  />
                </div>
                {(startDate || endDate) && (
                  <button
                    className="text-sm text-red-500 hover:underline"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                      setPage(1);
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-[#1e2029] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#13151c] border-b border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium">
                    <th className="px-5 py-4">Payout ID</th>
                    <th className="px-5 py-4">Payout Date</th>
                    <th className="px-5 py-4 text-center">Appointments</th>
                    <th className="px-5 py-4 text-right">Amount</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4">Transaction ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-darkGreen"></div>
                        </div>
                      </td>
                    </tr>
                  ) : payouts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-gray-500 dark:text-gray-400"
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
                        className="hover:bg-gray-50 dark:hover:bg-[#25272f] cursor-pointer transition-colors"
                        onClick={() =>
                          navigate(`/doctor/payouts/${payout._id}`)
                        }
                      >
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                            {payout._id}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-800 dark:text-gray-200">
                            {dayjs(payout.createdAt).format("MMM D, YYYY")}
                          </p>
                          <p className="text-xs text-gray-400">
                            {dayjs(payout.createdAt).format("h:mm A")}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {payout.appointmentsCount ??
                              payout.appointmentIds?.length ??
                              0}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className="font-semibold text-gray-800 dark:text-gray-100">
                            ${payout.amount?.toFixed(2)}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(payout.status)}`}
                          >
                            {payout.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
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
              <div className="px-5 py-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Page{" "}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {page}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {totalPages}
                  </span>
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}

export default DPayoutsPage;
