import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import ASidebar from "../../components/admin/ASidebar";
import AMobileSidebar from "../../components/admin/AMobileSidebar";
import {
  getWalletDetails,
  getWalletTransactions,
} from "../../api/admin/walletService";
import getIcon from "../../helpers/getIcon";
import toast from "react-hot-toast";
import Avatar from "../../components/common/Avatar";

function AViewWalletPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [walletDetails, setWalletDetails] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  // Stats boxes
  const [stats, setStats] = useState({
    totalCredit: 0,
    totalDebit: 0,
    lastTransactionTime: null as string | null,
  });

  // Pagination & Filters for Transactions
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
  const [inputFilters, setInputFilters] = useState({
    search: "",
    status: "",
    direction: "",
    type: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (JSON.stringify(filters) !== JSON.stringify(inputFilters)) {
        setFilters(inputFilters);
        setPage(1);
      }
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [inputFilters, filters]);

  const fetchWalletDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingDetails(true);
      const res = await getWalletDetails(id);
      setWalletDetails(res.data);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to load wallet details"
      );
      navigate("/admin/wallets");
    } finally {
      setLoadingDetails(false);
    }
  }, [id, navigate]);

  const fetchTransactions = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingTransactions(true);
      const params: any = { page, limit: 10 };

      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.direction) params.direction = filters.direction;
      if (filters.type) params.type = filters.type;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await getWalletTransactions(id, params);
      const txs = res.data?.transactions || [];
      setTransactions(txs);
      setTotalPages(res.data?.totalPages || 1);

      if (page === 1) {
        let credit = 0;
        let debit = 0;
        txs.forEach((tx: any) => {
          if (tx.direction === "CREDIT") credit += tx.amount;
          else if (tx.direction === "DEBIT") debit += tx.amount;
        });

        setStats({
          totalCredit: credit,
          totalDebit: debit,
          lastTransactionTime: txs.length > 0 ? txs[0].createdAt : null,
        });
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to load transactions"
      );
    } finally {
      setLoadingTransactions(false);
    }
  }, [id, page, filters]);

  useEffect(() => {
    fetchWalletDetails();
  }, [fetchWalletDetails]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setInputFilters({ ...inputFilters, [e.target.name]: e.target.value });
  };

  if (loadingDetails) {
    return (
      <div className="flex w-full h-screen">
        <ASidebar page="wallets" />
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[#1a1c23]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lightGreen"></div>
        </div>
      </div>
    );
  }

  if (!walletDetails) {
    return (
      <div className="flex w-full h-screen">
        <ASidebar page="wallets" />
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#1a1c23] text-gray-500">
          {getIcon("search-solid", "64px")}
          <h2 className="mt-4 text-xl">Wallet not found</h2>
          <button
            onClick={() => navigate("/admin/wallets")}
            className="mt-4 px-4 py-2 bg-lightGreen text-white rounded-md hover:opacity-90 transition-opacity"
          >
            Back to list
          </button>
        </div>
      </div>
    );
  }

  const { user, balance } = walletDetails;

  return (
    <>
      <AMobileSidebar page="wallets" />
      <div className="flex w-full flex-col lg:flex-row">
        <ASidebar page="wallets" />
        <div className="w-screen lg:flex-1 relative">
          <div className="flex flex-col gap-6 p-4 h-screen overflow-y-auto bg-[#f3f4f6] dark:bg-[#1a1c23] text-gray-800 dark:text-gray-200 animate-fade-in w-full transition-colors duration-200 pb-10">

            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/admin/wallets")}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  title="Back to Wallets"
                >
                  {getIcon("left", "24px")}
                </button>
                <div>
                  <h1 className="text-3xl font-bold">Wallet Details</h1>
                  <p className="font-mono text-sm text-gray-500 mt-1">
                    Wallet ID: {walletDetails._id}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-white dark:bg-[#252831] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full border-4 border-gray-50 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                {user?.profileImageUrl ? (
                  <Avatar
                    src={user.profileImageUrl}
                    alt="Wallet Owner Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase">
                    {user?.name?.charAt(0) || "?"}
                  </div>
                )}
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Owner Name</p>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{user?.name || "N/A"}</h2>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Account Role</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-[10px] uppercase font-bold mt-1 ${user?.role === "DOCTOR"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      : "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                      }`}
                  >
                    {user?.role || "UNKNOWN"}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Email Address</p>
                  <p className="font-semibold">{user?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Owner ID</p>
                  <p className="font-mono text-sm font-semibold">{user?._id || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Wallet Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#5C8D89] text-white rounded-xl p-5 shadow-sm transform transition-all hover:scale-102">
                <p className="text-xs font-semibold text-green-100 uppercase tracking-wider mb-1">Current Balance</p>
                <p className="text-3xl font-bold">₹{balance ? balance.toFixed(2) : "0.00"}</p>
              </div>
              <div className="bg-white dark:bg-[#252831] border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-xl p-5 shadow-sm transform transition-all hover:scale-102">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Credit (Page)</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">₹{stats.totalCredit.toFixed(2)}</p>
              </div>
              <div className="bg-white dark:bg-[#252831] border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-xl p-5 shadow-sm transform transition-all hover:scale-102">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Debit (Page)</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">₹{stats.totalDebit.toFixed(2)}</p>
              </div>
              <div className="bg-white dark:bg-[#252831] border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-xl p-5 shadow-sm transform transition-all hover:scale-102">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Last Activity</p>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {stats.lastTransactionTime
                    ? new Date(stats.lastTransactionTime).toLocaleDateString() +
                    " " +
                    new Date(stats.lastTransactionTime).toLocaleTimeString()
                    : "No Transactions"}
                </p>
              </div>
            </div>

            {/* Transactions History Table Container */}
            <div className="bg-white dark:bg-[#252831] rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm ">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="text-lg font-bold">Transaction History</h3>
              </div>

              {/* Grid filters */}
              <div className="p-4 bg-gray-50 dark:bg-[#1a1c23] border-b border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-6 gap-3">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    name="search"
                    value={inputFilters.search}
                    onChange={handleFilterChange}
                    placeholder="Search by Transaction ID..."
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-lightGreen outline-none bg-white dark:bg-[#252831]"
                  />
                </div>
                <div>
                  <select
                    name="type"
                    value={inputFilters.type}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-lightGreen outline-none text-gray-700 dark:text-gray-300 bg-white dark:bg-[#252831]"
                  >
                    <option value="">All Types</option>
                    <option value="WALLET_TOPUP">Top-up</option>
                    <option value="APPOINTMENT_PAYMENT">Appointment Payment</option>
                    <option value="APPOINTMENT_REFUND">Appointment Refund</option>
                    <option value="DOCTOR_PAYOUT">Payout</option>
                  </select>
                </div>
                <div>
                  <select
                    name="direction"
                    value={inputFilters.direction}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-lightGreen outline-none text-gray-700 dark:text-gray-300 bg-white dark:bg-[#252831]"
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
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-lightGreen outline-none bg-white dark:bg-[#252831]"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    name="endDate"
                    value={inputFilters.endDate}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-lightGreen outline-none bg-white dark:bg-[#252831]"
                  />
                </div>
              </div>

              {/* Main table */}
              <div>
                {loadingTransactions ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lightGreen"></div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-20 text-gray-500 dark:text-gray-400 text-sm">
                    <p>No transactions found matching the parameters.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-[#1a1c23]/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-semibold">Txn Info</th>
                        <th className="px-6 py-4 font-semibold">Date & Time</th>
                        <th className="px-6 py-4 font-semibold">Type & Source</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                      {transactions.map((t) => (
                        <tr
                          key={t._id}
                          className="hover:bg-gray-50/50 dark:hover:bg-[#1a1c23]/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{t._id}</p>
                            {t.appointmentId && (
                              <p className="text-xs text-gray-500 mt-1">Appt ID: {t.appointmentId}</p>
                            )}
                            {t.payoutId && (
                              <p className="text-xs text-gray-500 mt-1">Payout ID: {t.payoutId}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                            {new Date(t.createdAt).toLocaleDateString()}
                            <br />
                            <span className="text-xs text-gray-400">
                              {new Date(t.createdAt).toLocaleTimeString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-800 dark:text-gray-200 capitalize">
                              {t.type.replace(/_/g, " ").toLowerCase()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">via {t.source}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${t.status === "SUCCESS"
                                ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                                : t.status === "FAILED"
                                  ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                                  : t.status === "REFUNDED"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                }`}
                            >
                              {t.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p
                              className={`font-bold text-lg ${t.direction === "CREDIT"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                                }`}
                            >
                              {t.direction === "CREDIT" ? "+" : "-"} ₹
                              {t.amount ? t.amount.toFixed(2) : "0.00"}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination footer */}
              {!loadingTransactions && totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#1a1c23]/50">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium bg-white dark:bg-[#252831] text-gray-700 dark:text-gray-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium bg-white dark:bg-[#252831] text-gray-700 dark:text-gray-300 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div >
    </>
  );
}

export default AViewWalletPage;
