import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import ASidebar from "../../components/admin/ASidebar";
import AHeader from "../../components/admin/AHeader";
import {
  getWalletDetails,
  getWalletTransactions,
} from "../../api/admin/walletService";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";

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
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [inputFilters, filters]);

  const fetchWalletDetails = async () => {
    if (!id) return;
    try {
      setLoadingDetails(true);
      const res = await getWalletDetails(id);
      setWalletDetails(res.data);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to load wallet details",
      );
      navigate("/admin/wallets");
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchTransactions = async () => {
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

      // Only calculate stats if this is the first page or it's empty, or fetch them if they were part of res.data
      // Easiest is to calculate if we know the full history (we don't without another API)
      // We will do our best with what we have or could calculate them via a separate API.
      // Assuming we just want to summarize current page OR ideally we need an API. Let's do it using current txs for now.
      if (page === 1) {
        let credit = 0;
        let debit = 0;
        txs.forEach((tx: any) => {
          if (tx.direction === "CREDIT") credit += tx.amount;
          else if (tx.direction === "DEBIT") debit += tx.amount;
        });

        setStats({
          totalCredit: credit, // Note: This only reflects current page! Correct implementation requires backend aggregation.
          totalDebit: debit,
          lastTransactionTime: txs.length > 0 ? txs[0].createdAt : null,
        });
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to load transactions",
      );
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    fetchWalletDetails();
  }, [id]);

  useEffect(() => {
    fetchTransactions();
  }, [id, page, filters]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setInputFilters({ ...inputFilters, [e.target.name]: e.target.value });
  };

  if (loadingDetails) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-darkGreen"></div>
      </div>
    );
  }

  if (!walletDetails) {
    return (
      <div className="flex h-screen bg-slate-50">
        <div className="m-auto text-xl font-semibold">Wallet not found</div>
      </div>
    );
  }

  const { user, balance } = walletDetails;

  return (
    <div className="flex h-screen bg-slate-50">
      <ASidebar page="wallets" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* <AHeader title="Wallet details" /> */}

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <button
              onClick={() => navigate("/admin/wallets")}
              className="flex items-center gap-2 text-gray-600 hover:text-darkGreen transition-colors mb-4"
            >
              <FaArrowLeft /> Back to Wallets
            </button>

            {/* Section 1: User Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-gray-50 flex-shrink-0">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-3xl uppercase">
                    {user?.name?.charAt(0) || "?"}
                  </div>
                )}
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    Name
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {user?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    Role
                  </p>
                  <span
                    className={`inline-block px-2.5 py-1 mt-1 rounded-full text-xs font-semibold ${
                      user?.role === "DOCTOR"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {user?.role || "UNKNOWN"}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    Email
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {user?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                    User Id
                  </p>
                  <p className="text-sm font-medium text-gray-800 font-mono">
                    {user?._id || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Wallet Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-darkGreen text-white rounded-xl p-5 shadow-sm transform transition-all hover:scale-105">
                <p className="text-sm font-medium text-green-100 mb-1">
                  Current Balance
                </p>
                <p className="text-3xl font-bold">₹{balance.toFixed(2)}</p>
              </div>
              <div className="bg-white border text-gray-800 rounded-xl p-5 shadow-sm transform transition-all hover:scale-105">
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Total Credit (Pg)
                </p>
                <p className="text-3xl font-bold text-green-600">
                  ₹{stats.totalCredit.toFixed(2)}
                </p>
              </div>
              <div className="bg-white border text-gray-800 rounded-xl p-5 shadow-sm transform transition-all hover:scale-105">
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Total Debit (Pg)
                </p>
                <p className="text-3xl font-bold text-red-600">
                  ₹{stats.totalDebit.toFixed(2)}
                </p>
              </div>
              <div className="bg-white border text-gray-800 rounded-xl p-5 shadow-sm transform transition-all hover:scale-105">
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Last Transaction
                </p>
                <p className="text-md font-bold text-gray-900 mt-2">
                  {stats.lastTransactionTime
                    ? new Date(stats.lastTransactionTime).toLocaleDateString() +
                      " " +
                      new Date(stats.lastTransactionTime).toLocaleTimeString()
                    : "No transactions"}
                </p>
              </div>
            </div>

            {/* Section 3: Transactions History */}
            <div className="bg-white rounded-2xl border border-inputBorder shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="text-xl font-bold">Transaction History</h3>
              </div>

              {/* Filters */}
              <div className="p-4 bg-gray-50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-6 gap-3">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    name="search"
                    value={inputFilters.search}
                    onChange={handleFilterChange}
                    placeholder="Search by Transaction ID..."
                    className="w-full border border-inputBorder rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none bg-white"
                  />
                </div>
                <div>
                  <select
                    name="type"
                    value={inputFilters.type}
                    onChange={handleFilterChange}
                    className="w-full border border-inputBorder rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none text-gray-700 bg-white"
                  >
                    <option value="">All Types</option>
                    <option value="WALLET_TOPUP">Top-up</option>
                    <option value="APPOINTMENT_PAYMENT">Appt Payment</option>
                    <option value="APPOINTMENT_REFUND">Appt Refund</option>
                    <option value="DOCTOR_PAYOUT">Payout</option>
                  </select>
                </div>
                <div>
                  <select
                    name="direction"
                    value={inputFilters.direction}
                    onChange={handleFilterChange}
                    className="w-full border border-inputBorder rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none text-gray-700 bg-white"
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
                    className="w-full border border-inputBorder rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none bg-white"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    name="endDate"
                    value={inputFilters.endDate}
                    onChange={handleFilterChange}
                    className="w-full border border-inputBorder rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none bg-white"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {loadingTransactions ? (
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
                      <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-medium">Txn Info</th>
                        <th className="px-6 py-4 font-medium">Date</th>
                        <th className="px-6 py-4 font-medium">Type & Source</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {transactions.map((t) => (
                        <tr
                          key={t._id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900">
                              {t._id}
                            </p>
                            {t.appointmentId && (
                              <p className="text-xs text-gray-500 mt-1">
                                Appt: {t.appointmentId}
                              </p>
                            )}
                            {t.payoutId && (
                              <p className="text-xs text-gray-500 mt-1">
                                Payout: {t.payoutId}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(t.createdAt).toLocaleDateString()}
                            <br />
                            <span className="text-xs">
                              {new Date(t.createdAt).toLocaleTimeString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-800 capitalize">
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
                                  : "text-gray-900"
                              }`}
                            >
                              {t.direction === "CREDIT" ? "+" : "-"} ₹
                              {t.amount?.toFixed(2) || "0.00"}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {!loadingTransactions && totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
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
        </div>
      </div>
    </div>
  );
}

export default AViewWalletPage;
