import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { getTransactionDetails } from "../../api/admin/transactionService";
import getIcon from "../../helpers/getIcon";
import AMobileSidebar from "../../components/admin/AMobileSidebar";
import ASidebar from "../../components/admin/ASidebar";
import Avatar from "../../components/common/Avatar";

const TransactionDirection = {
  CREDIT: "CREDIT",
  DEBIT: "DEBIT",
} as const;

const AViewTransactionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchTransactionDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTransactionDetails(id!);
      setTransaction(res.data);
    } catch (error) {
      console.error("Failed to fetch transaction details", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchTransactionDetails();
    }
  }, [id, fetchTransactionDetails]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center dark:bg-[#1a1c23]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lightGreen"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex flex-col h-screen items-center justify-center dark:bg-[#1a1c23] text-gray-500">
        {getIcon("search-solid", "64px")}
        <h2 className="mt-4 text-xl">Transaction not found</h2>
        <button
          onClick={() => navigate("/admin/transactions")}
          className="mt-4 px-4 py-2 bg-lightGreen text-white rounded-md hover:opacity-90 transition-opacity"
        >
          Back to list
        </button>
      </div>
    );
  }

  const { user, ...txn } = transaction;

  return (
    <>
      <AMobileSidebar page="transactions" />
      <div className="flex w-full flex-col lg:flex-row">
        <ASidebar page="transactions" />
        <div className="w-screen lg:flex-1 relative">
          <div className="flex flex-col gap-2 p-4 h-screen overflow-y-auto bg-[#f3f4f6] dark:bg-[#1a1c23] text-gray-800 dark:text-gray-200 animate-fade-in w-full transition-colors duration-200">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate("/admin/transactions")}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                {getIcon("left", "24px")}
              </button>
              <h1 className="text-3xl font-bold">Transaction Details</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Section 1: User Details */}
              <div className="bg-white dark:bg-[#252831] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center">
                <div className="w-24 h-24 mb-4 rounded-full border-4 border-gray-50 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  {user?.profileImageUrl ? (
                    <Avatar
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">
                      {getIcon("user", "48px")}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-center">
                  {user?.name || "Admin"}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {user?.email || "System Transaction"}
                </p>

                <div className="w-full space-y-3 mt-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Role
                    </span>
                    <span className="font-semibold uppercase bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                      {user?.role || "ADMIN"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      User ID
                    </span>
                    <span className="font-mono text-xs">
                      {user?._id || "-"}
                    </span>
                  </div>
                  {txn.walletId && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Wallet ID
                      </span>
                      <span
                        className="font-mono text-xs hover:text-lightGreen hover:underline cursor-pointer"
                        onClick={() =>
                          navigate(`/admin/wallets/${txn.walletId}`)
                        }
                      >
                        {txn.walletId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Transaction Core Info */}
              <div className="col-span-1 lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-[#252831] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
                  <h3 className="text-lg font-semibold mb-4 border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">
                    {getIcon("clipboard-list", "20px")}
                    Core Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                          Transaction ID
                        </p>
                        <p className="font-mono text-sm break-all">{txn._id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                          Date & Time
                        </p>
                        <p>
                          {new Date(txn.createdAt).toLocaleString(undefined, {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                          Type & Source
                        </p>
                        <p className="font-semibold">
                          {txn.type?.replace(/_/g, " ")}{" "}
                          <span className="font-normal text-gray-400 mx-2">
                            via
                          </span>{" "}
                          {txn.source}
                        </p>
                      </div>
                      {txn.gatewayRef && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                            Gateway Reference
                          </p>
                          <p className="font-mono text-sm break-all">
                            {txn.gatewayRef}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#1a1c23] border border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                          Amount
                        </p>
                        <div className="flex items-baseline gap-2">
                          <p
                            className={`text-3xl font-bold ${txn.direction === TransactionDirection.CREDIT ? "text-green-500" : "text-red-500"}`}
                          >
                            {txn.direction === TransactionDirection.CREDIT
                              ? "+"
                              : "-"}
                            ₹{txn.amount?.toFixed(2)}
                          </p>
                          <span className="text-sm font-semibold text-gray-400 uppercase">
                            {txn.direction}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                          Status
                        </p>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold inline-block mt-1
                                ${txn.status === "SUCCESS"
                              ? "bg-green-100 text-green-700"
                              : txn.status === "FAILED"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                          {txn.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                          Balance After
                        </p>
                        <p className="text-lg font-mono">
                          {txn.balanceAfter !== null
                            ? `₹${txn.balanceAfter?.toFixed(2)}`
                            : "Not Available"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Related Entitites */}
                {(txn.appointmentId || txn.payoutId) && (
                  <div className="bg-white dark:bg-[#252831] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-semibold mb-4 border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">
                      {getIcon("linked", "20px")}
                      Related Entities
                    </h3>
                    <div className="flex flex-col gap-3">
                      {txn.appointmentId && (
                        <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-[#1f2128]">
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">
                              Appointment
                            </p>
                            <p className="font-mono mt-1 text-sm">
                              {txn.appointmentId}
                            </p>
                          </div>
                          <button
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-sm font-medium rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                            onClick={() => {
                              navigate(`/admin/appointments/${txn.appointmentId}`);
                            }}
                          >
                            View Appointment
                          </button>
                        </div>
                      )}
                      {txn.payoutId && (
                        <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-[#1f2128]">
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">
                              Doctor Payout
                            </p>
                            <p className="font-mono mt-1 text-sm">
                              {txn.payoutId}
                            </p>
                          </div>
                          <button
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-sm font-medium rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                            onClick={() => {
                              navigate(`/admin/payouts/${txn.payoutId}`);
                            }}
                          >
                            View Payout
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AViewTransactionPage;
