import { useEffect, useState } from "react";
import {
  getDoctorWallet,
  getDoctorTransactions,
} from "../../api/doctor/walletService";
import toast from "react-hot-toast";

function DWalletPage() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination and Filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Wallet & Transactions
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Manage your earnings and view transaction history.
        </p>
      </div>

      {/* Wallet Balance Card */}
      <div className="bg-darkGreen text-white rounded-3xl p-8 mb-8 shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full translate-y-1/3 -translate-x-1/4"></div>

        <div className="z-10 text-center mb-2">
          <h2 className="text-sm font-medium text-green-100 uppercase tracking-wider mb-2">
            Total Wallet Balance
          </h2>
          <div className="text-5xl font-bold flex items-center justify-center gap-2">
            <span>₹</span>
            <span>{balance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Transaction History</h3>
        </div>

        {/* Filters */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-2">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by Transaction ID..."
              className="w-full border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none"
            />
          </div>
          <div>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none bg-white"
            >
              <option value="">All Types</option>
              <option value="WALLET_TOPUP">Top-up</option>
              <option value="DOCTOR_PAYOUT">Payout</option>
            </select>
          </div>
          <div>
            <select
              name="direction"
              value={filters.direction}
              onChange={handleFilterChange}
              className="w-full border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none bg-white"
            >
              <option value="">All Directions</option>
              <option value="CREDIT">Credit</option>
              <option value="DEBIT">Debit</option>
            </select>
          </div>
          <div>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none"
            />
          </div>
          <div>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none"
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
