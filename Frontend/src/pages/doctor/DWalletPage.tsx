import { useEffect, useState } from "react";
import {
  getDoctorWallet,
  getDoctorTransactions,
} from "../../api/doctor/walletService";
import toast from "react-hot-toast";
import { X, RotateCcw } from "lucide-react";

function DWalletPage() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination and Filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [searchInput, setSearchInput] = useState("");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    direction: "",
    type: "",
    startDate: "",
    endDate: "",
  });

  const fetchWalletData = async () => {
    try {
      const walletRes = await getDoctorWallet();
      setBalance(walletRes.data?.balance || 0);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load wallet");
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.direction) params.direction = filters.direction;
      if (filters.type) params.type = filters.type;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await getDoctorTransactions(params);
      setTransactions(res.data?.transactions || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (error: any) {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  // Search Debouncing logic (avoids duplicate fetches on mount by check-guarding change)
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => {
        if (prev.search === searchInput) return prev;
        return { ...prev, search: searchInput };
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchWalletData();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [page, filters]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1); // Reset page on filter change
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setFilters({
      search: "",
      status: "",
      direction: "",
      type: "",
      startDate: "",
      endDate: "",
    });
    setPage(1);
  };

  const activeFiltersCount = [
    filters.direction,
    filters.type,
    filters.startDate,
    filters.endDate,
  ].filter(Boolean).length;

  const hasActiveFilters = searchInput || activeFiltersCount > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Wallet & Transactions
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
          Manage your earnings and view transaction history.
        </p>
      </div>

      {/* Wallet Balance Card */}
      <div className="bg-darkGreen text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-4 sm:mb-8 shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full translate-y-1/3 -translate-x-1/4"></div>

        <div className="z-10 text-center mb-1">
          <h2 className="text-xs sm:text-sm font-semibold text-green-100 uppercase tracking-wider mb-2">
            Total Wallet Balance
          </h2>
          <div className="text-4xl sm:text-5xl font-extrabold flex items-center justify-center gap-2">
            <span>₹</span>
            <span>{balance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Transaction History</h3>
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
              placeholder="Search by Transaction ID..."
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
            <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none bg-white"
            >
              <option value="">All Types</option>
              <option value="WALLET_TOPUP">Top-up</option>
              <option value="DOCTOR_PAYOUT">Payout</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Direction</label>
            <select
              name="direction"
              value={filters.direction}
              onChange={handleFilterChange}
              className="w-full border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none bg-white"
            >
              <option value="">All Directions</option>
              <option value="CREDIT">Credit</option>
              <option value="DEBIT">Debit</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-darkGreen"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-20 text-gray-500 text-sm">
              <p>No transactions found.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">
                    Transaction Info
                  </th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Type & Source</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
                {transactions.map((t) => (
                  <tr
                    key={t._id}
                    className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 dark:text-white font-mono text-xs">
                        {t._id || t.id}
                      </p>
                      {t.payoutId && (
                        <p className="text-xs text-gray-500 mt-1">
                          Payout Ref: {t.payoutId}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString()}
                      <br />
                      <span className="text-xs">
                        {new Date(t.createdAt).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800 dark:text-slate-200 capitalize">
                        {t.type.replace(/_/g, " ").toLowerCase()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {t.source}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          t.status === "SUCCESS"
                            ? "bg-green-100 text-green-700"
                            : t.status === "FAILED"
                              ? "bg-red-100 text-red-700"
                              : t.status === "REFUNDED"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p
                        className={`font-bold ${
                          t.direction === "CREDIT"
                            ? "text-green-600"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {t.direction === "CREDIT" ? "+" : "-"} ₹
                        {t.amount.toFixed(2)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-slate-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-slate-400 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-slate-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DWalletPage;
