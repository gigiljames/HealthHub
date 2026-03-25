import React, { useEffect, useState, useCallback } from "react";
import { getTransactions } from "../../api/admin/transactionService";
import { useNavigate } from "react-router";
import getIcon from "../../helpers/getIcon";
import AMobileSidebar from "../../components/admin/AMobileSidebar";
import ASidebar from "../../components/admin/ASidebar";
import AdminTable, { type ColumnDef } from "../../components/admin/AdminTable";

const PaymentStatus = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  INITIATED: "INITIATED",
  REFUNDED: "REFUNDED",
} as const;

const TransactionDirection = {
  CREDIT: "CREDIT",
  DEBIT: "DEBIT",
} as const;

const TransactionType = {
  WALLET_TOPUP: "WALLET_TOPUP",
  APPOINTMENT_PAYMENT: "APPOINTMENT_PAYMENT",
  DOCTOR_PAYOUT: "DOCTOR_PAYOUT",
  REFUND: "REFUND",
} as const;

const TransactionSource = {
  STRIPE: "STRIPE",
  WALLET: "WALLET",
} as const;

const ROLES = ["ADMIN", "DOCTOR", "USER"];

const getStatusColor = (status: string) => {
  switch (status) {
    case PaymentStatus.SUCCESS:
      return "text-green-600 bg-green-100";
    case PaymentStatus.FAILED:
      return "text-red-600 bg-red-100";
    case PaymentStatus.INITIATED:
      return "text-yellow-600 bg-yellow-100";
    case PaymentStatus.REFUNDED:
      return "text-blue-600 bg-blue-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const getDirectionColor = (direction: string) =>
  direction === TransactionDirection.CREDIT ? "text-green-600" : "text-red-600";

const ATransactionsPage = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [inputFilters, setInputFilters] = useState({
    search: "",
    source: "",
    type: "",
    direction: "",
    status: "",
    role: "",
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: "",
  });

  const [filters, setFilters] = useState({ ...inputFilters });

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(inputFilters);
      setPage(1);
    }, 1000);
    return () => clearTimeout(handler);
  }, [inputFilters]);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTransactions({ ...filters, page, limit });
      setTransactions(data.data?.transactions || []);
      setTotalPages(data.data?.totalPages || 1);
      setTotal(data.data?.total || 0);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setInputFilters((prev) => ({ ...prev, [name]: value }));
  };

  const columns: ColumnDef<any>[] = [
    {
      header: "Transaction ID / Purpose",
      render: (txn) => (
        <>
          <div className="font-mono text-sm">{txn._id}</div>
          <div className="text-xs text-gray-500 mt-1">
            {txn.appointmentId
              ? `Appt: ${txn.appointmentId}`
              : txn.payoutId
                ? `Payout: ${txn.payoutId}`
                : "Self"}
          </div>
        </>
      ),
    },
    {
      header: "User Details",
      render: (txn) =>
        txn.user?.role ? (
          <div className="text-[10px] uppercase font-bold text-gray-400 mt-1">
            {txn.user.role}
          </div>
        ) : null,
    },
    {
      header: "Type / Source",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (txn) => (
        <>
          <div>
            <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              {txn.type.replace(/_/g, " ")}
            </span>
          </div>
          <div className="text-xs font-semibold text-gray-400 mt-2">
            via {txn.source}
          </div>
        </>
      ),
    },
    {
      header: "Status",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (txn) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(txn.status)}`}
        >
          {txn.status}
        </span>
      ),
    },
    {
      header: "Date & Time",
      render: (txn) => (
        <>
          <div>
            {new Date(txn.createdAt).toLocaleDateString(undefined, {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {new Date(txn.createdAt).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </>
      ),
      cellClassName:
        "text-sm whitespace-nowrap text-gray-600 dark:text-gray-300",
    },
    {
      header: "Amount",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (txn) => (
        <div
          className={`font-bold ${getDirectionColor(txn.direction)} text-lg flex items-center justify-end gap-1`}
        >
          {txn.direction === TransactionDirection.CREDIT ? "+" : "-"}₹
          {txn.amount.toFixed(2)}
        </div>
      ),
    },
    {
      header: "Balance After",
      headerClassName: "text-right",
      cellClassName: "text-right text-gray-700 dark:text-gray-300 font-mono",
      render: (txn) =>
        txn.balanceAfter !== null ? `₹${txn.balanceAfter.toFixed(2)}` : "-",
    },
  ];

  return (
    <>
      <AMobileSidebar page="transactions" />
      <div className="flex w-full flex-col lg:flex-row">
        <ASidebar page="transactions" />
        <div className="w-screen lg:flex-1 relative">
          <div className="flex flex-col gap-2 p-4 h-screen overflow-y-auto bg-[#f3f4f6] dark:bg-[#1a1c23] min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-200 w-full animate-fade-in pb-10">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold">Transaction Management</h1>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#252831] p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
              <div className="flex items-center gap-2 mb-4 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                {getIcon("filter", "16px")}
                Filters &amp; Search
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <div className="col-span-1 md:col-span-2 lg:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    name="search"
                    placeholder="Txn ID, User Name, Email, Appt ID..."
                    value={inputFilters.search}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Role
                  </label>
                  <select
                    name="role"
                    value={inputFilters.role}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all text-sm"
                  >
                    <option value="">All Roles</option>
                    {ROLES.map((role) => (
                      <option
                        key={role.toLowerCase()}
                        value={role.toLowerCase()}
                      >
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Type
                  </label>
                  <select
                    name="type"
                    value={inputFilters.type}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all text-sm"
                  >
                    <option value="">All Types</option>
                    {Object.values(TransactionType).map((type) => (
                      <option key={type as string} value={type as string}>
                        {(type as string).replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Source
                  </label>
                  <select
                    name="source"
                    value={inputFilters.source}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all text-sm"
                  >
                    <option value="">All Sources</option>
                    {Object.values(TransactionSource).map((src) => (
                      <option key={src as string} value={src as string}>
                        {src as string}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={inputFilters.status}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all text-sm"
                  >
                    <option value="">All Statuses</option>
                    {Object.values(PaymentStatus).map((status) => (
                      <option key={status as string} value={status as string}>
                        {status as string}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Direction
                  </label>
                  <select
                    name="direction"
                    value={inputFilters.direction}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all text-sm"
                  >
                    <option value="">All Directions</option>
                    {Object.values(TransactionDirection).map((dir) => (
                      <option key={dir as string} value={dir as string}>
                        {dir as string}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <div className="w-1/2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Min Amt (₹)
                    </label>
                    <input
                      type="number"
                      name="minAmount"
                      placeholder="0"
                      value={inputFilters.minAmount}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all text-sm"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Max Amt (₹)
                    </label>
                    <input
                      type="number"
                      name="maxAmount"
                      placeholder="Max"
                      value={inputFilters.maxAmount}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 lg:col-span-2">
                  <div className="w-1/2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Date From
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={inputFilters.startDate}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all text-sm"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Date To
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={inputFilters.endDate}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <AdminTable<any>
              columns={columns}
              data={transactions}
              loading={loading}
              keyExtractor={(txn) => txn._id}
              onRowClick={(txn) => navigate(`/admin/transactions/${txn._id}`)}
              emptyMessage="No transactions found matching your criteria."
              resultLabel={`${total} transactions found`}
              pagination={{
                page,
                totalPages,
                onPrev: () => setPage((p) => Math.max(1, p - 1)),
                onNext: () => setPage((p) => Math.min(totalPages, p + 1)),
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ATransactionsPage;
