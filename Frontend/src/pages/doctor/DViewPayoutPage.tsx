import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getDoctorPayoutDetails } from "../../api/payoutService";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import getIcon from "../../helpers/getIcon";

function DViewPayoutPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payout, setPayout] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await getDoctorPayoutDetails(id);
        if (data.success) {
          setPayout(data.data);
        } else {
          toast.error(data.message || "Failed to fetch payout");
        }
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to fetch payout details",
        );
        navigate("/doctor/payouts");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "PROCESSED":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-darkGreen"></div>
      </div>
    );
  }

  if (!payout) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Payout not found.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full">
        <div className="w-[95%] lg:w-[90%] max-w-[1000px] flex flex-col gap-6 py-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/doctor/payouts")}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {getIcon("arrowLeft", "20px", "currentColor")}
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Payout Details
              </h1>
              <p className="text-xs font-mono text-gray-400 mt-0.5">
                {payout._id}
              </p>
            </div>
            <span
              className={`ml-auto px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(payout.status)}`}
            >
              {payout.status}
            </span>
          </div>

          {/* Payment Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#1e2029] rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
                Total Received
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                ${payout.amount?.toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-[#1e2029] rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
                Gross Amount
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                ${payout.grossAmount?.toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-[#1e2029] rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
                Platform Commission
              </p>
              <p className="text-2xl font-bold text-red-500">
                ${payout.platformCommissions?.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Transaction Details */}
          {payout.transaction && (
            <div className="bg-white dark:bg-[#1e2029] rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Transaction Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Transaction ID</p>
                  <p className="font-mono text-gray-700 dark:text-gray-300">
                    {payout.transaction.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">
                    Transaction Date & Time
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {dayjs(payout.transaction.createdAt).format(
                      "MMM D, YYYY h:mm A",
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Amount</p>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">
                    ${payout.transaction.amount?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">
                    Transaction Status
                  </p>
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(payout.transaction.status)}`}
                  >
                    {payout.transaction.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Appointments Table */}
          <div className="bg-white dark:bg-[#1e2029] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                Included Appointments{" "}
                <span className="text-sm font-normal text-gray-400">
                  ({payout.appointments?.length || 0})
                </span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#13151c] text-gray-500 dark:text-gray-400 text-xs font-medium border-b border-gray-100 dark:border-gray-800">
                    <th className="px-5 py-3">Appointment ID</th>
                    <th className="px-5 py-3">Patient</th>
                    <th className="px-5 py-3">Date & Time</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {payout.appointments?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-gray-500 text-sm"
                      >
                        No appointments found.
                      </td>
                    </tr>
                  ) : (
                    payout.appointments?.map((apt: any) => (
                      <tr
                        key={apt._id}
                        className="hover:bg-gray-50 dark:hover:bg-[#25272f] transition-colors"
                      >
                        <td className="px-5 py-3">
                          <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                            {apt._id}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {apt.patient?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {apt.patient?.email}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {dayjs(apt.start).format("MMM D, YYYY")}
                          </p>
                          <p className="text-xs text-gray-400">
                            {dayjs(apt.start).format("h:mm A")} –{" "}
                            {dayjs(apt.end).format("h:mm A")}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {apt.mode === "online"
                              ? "🌐 Online"
                              : apt.locationName || "In-Person"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                            ${apt.amount?.toFixed(2) || "—"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
    </div>
  );
}

export default DViewPayoutPage;
