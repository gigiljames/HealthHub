import { useEffect, useState } from "react";
import {
  getWallet,
  addMoneyToWallet,
  getUserTransactions,
} from "../../api/user/walletService";
import toast from "react-hot-toast";

function UWalletPage() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState<string>("");
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<"all" | "wallet">("all");
  const [inputFilters, setInputFilters] = useState({
    search: "",
    status: "",
    direction: "",
    type: "",
    startDate: "",
    endDate: "",
  });
  const [debouncedFilters, setDebouncedFilters] = useState({
    search: "",
    status: "",
    direction: "",
    type: "",
    startDate: "",
    endDate: "",
  });

  const fetchWalletData = async () => {
    try {
      const walletRes = await getWallet();
      setBalance(walletRes.data?.balance || 0);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load wallet");
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (activeTab === "wallet") {
        params.source = "WALLET";
      }
      if (debouncedFilters.search) params.search = debouncedFilters.search;
      if (debouncedFilters.status) params.status = debouncedFilters.status;
      if (debouncedFilters.direction) params.direction = debouncedFilters.direction;
      if (debouncedFilters.type) params.type = debouncedFilters.type;
      if (debouncedFilters.startDate) params.startDate = debouncedFilters.startDate;
      if (debouncedFilters.endDate) params.endDate = debouncedFilters.endDate;

      const res = await getUserTransactions(params);
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
    const handler = setTimeout(() => {
      setDebouncedFilters(inputFilters);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [inputFilters]);

  useEffect(() => {
    fetchTransactions();
  }, [page, activeTab, debouncedFilters]);

  const handleAddMoney = async () => {
    if (
      !topupAmount ||
      isNaN(Number(topupAmount)) ||
      Number(topupAmount) <= 0
    ) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      const res = await addMoneyToWallet(Number(topupAmount), "INR");
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Top-up failed");
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setInputFilters({ ...inputFilters, [e.target.name]: e.target.value });
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      search: "",
      status: "",
      direction: "",
      type: "",
      startDate: "",
      endDate: "",
    };
    setInputFilters(emptyFilters);
    setDebouncedFilters(emptyFilters);
    setPage(1);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 pb-16">
      <div className="max-w-7xl mx-auto px-4 pt-24">
        <div className="mb-8 pl-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            HealthHub Wallet
          </h1>
          <p className="text-lg mb-6 text-gray-500 dark:text-gray-100">
            View your balance and manage all your financial activity securely
          </p>
        </div>
        {/* Wallet Balance Card */}
        <div className="bg-darkGreen text-white rounded-3xl p-8 mb-8 shadow-lg flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full translate-y-1/3 -translate-x-1/4"></div>

          <div className="z-10 text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-sm font-medium text-green-100 uppercase tracking-wider mb-2">
              Available Balance
            </h2>
            <div className="text-5xl font-bold flex items-center justify-center md:justify-start gap-2">
              <span>₹</span>
              <span>{balance.toFixed(2)}</span>
            </div>
          </div>

          <div className="z-10">
            <button
              onClick={() => setIsTopupModalOpen(true)}
              className="bg-white text-darkGreen font-semibold py-3 px-8 rounded-full shadow-md hover:bg-gray-50 transition-all transform hover:-translate-y-0.5"
            >
              + Add Money
            </button>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-inputBorder shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-xl font-bold">Transactions</h3>

            {/* Tabs */}
            <div className="flex bg-slate-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => {
                  setActiveTab("all");
                  setPage(1);
                }}
                className={`px-6 py-2 rounded-md font-medium text-sm transition-all ${activeTab === "all"
                  ? "bg-white dark:bg-gray-700 shadow-sm text-darkGreen"
                  : "text-gray-600 dark:text-gray-400"
                  }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setActiveTab("wallet");
                  setPage(1);
                }}
                className={`px-6 py-2 rounded-md font-medium text-sm transition-all ${activeTab === "wallet"
                  ? "bg-white dark:bg-gray-700 shadow-sm text-darkGreen"
                  : "text-gray-600 dark:text-gray-400"
                  }`}
              >
                Wallet Only
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-7 gap-3">
            <div className="md:col-span-2">
              <input
                type="text"
                name="search"
                value={inputFilters.search}
                onChange={handleFilterChange}
                placeholder="Search by Transaction ID..."
                className="w-full border border-inputBorder rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none dark:bg-gray-900"
              />
            </div>
            <div>
              <select
                name="type"
                value={inputFilters.type}
                onChange={handleFilterChange}
                className="w-full border border-inputBorder rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none dark:bg-gray-900"
              >
                <option value="">All Types</option>
                <option value="APPOINTMENT_PAYMENT">Payment</option>
                <option value="APPOINTMENT_REFUND">Refund</option>
                <option value="WALLET_TOPUP">Top-up</option>
              </select>
            </div>
            <div>
              <select
                name="direction"
                value={inputFilters.direction}
                onChange={handleFilterChange}
                className="w-full border border-inputBorder rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none dark:bg-gray-900"
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
                value={inputFilters.startDate}
                onChange={handleFilterChange}
                className="w-full border border-inputBorder rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none dark:bg-gray-900"
              />
            </div>
            <div>
              <input
                type="date"
                name="endDate"
                value={inputFilters.endDate}
                onChange={handleFilterChange}
                className="w-full border border-inputBorder rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none dark:bg-gray-900"
              />
            </div>
            <div className="flex items-center">
              <button
                onClick={handleClearFilters}
                className="w-full bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-3 rounded-lg text-sm transition-colors border border-transparent shadow-sm whitespace-nowrap cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-darkGreen"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p>No transactions found.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Transaction Info</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Type & Source</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                  {transactions.map((t) => (
                    <tr
                      key={t._id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 font-mono text-xs">
                          {t._id || t.id}
                        </p>
                        {t.appointmentId && (
                          <p className="text-xs text-gray-500 mt-1">
                            Appt: {t.appointmentId}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {new Date(t.createdAt).toLocaleDateString()}
                        <br />
                        <span className="text-xs">
                          {new Date(t.createdAt).toLocaleTimeString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                          {t.type.replace(/_/g, " ").toLowerCase()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{t.source}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${t.status === "SUCCESS"
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
                          className={`font-bold ${t.direction === "CREDIT"
                            ? "text-green-600"
                            : "text-gray-900 dark:text-gray-100"
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
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/30">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Topup Modal */}
      {isTopupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-xl font-bold mb-4">Add Money to Wallet</h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full border gap-2 border-inputBorder rounded-xl px-4 py-3 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-darkGreen"
              />
              <div className="flex gap-2 mt-3">
                {[500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setTopupAmount(amt.toString())}
                    className="flex-1 border border-gray-200 py-1.5 rounded-lg text-sm font-medium hover:border-darkGreen hover:text-darkGreen transition-colors"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsTopupModalOpen(false);
                  setTopupAmount("");
                }}
                className="flex-1 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMoney}
                className="flex-1 py-3 rounded-xl font-semibold bg-darkGreen text-white hover:bg-darkGreen/90 transition-colors shadow-md"
              >
                Proceed to Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UWalletPage;
