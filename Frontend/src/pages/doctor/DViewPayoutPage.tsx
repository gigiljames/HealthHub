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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/40 pb-4 md:border-b-0 md:pb-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/doctor/payouts")}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center"
            aria-label="Back to Payouts"
          >
            {getIcon("left", "20px", "currentColor")}
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Payout Details
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
              Gross earnings, commission cuts, and included appointment listings.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:self-center self-start pl-12 sm:pl-0">
          <span className="font-mono text-xs text-gray-500 dark:text-gray-400 bg-gray-105 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-slate-700">
            ID: {payout._id}
          </span>
          <span
            className={`px-3 py-1.5 text-xs font-bold rounded-full border ${getStatusBadge(payout.status)}`}
          >
            {payout.status}
          </span>
        </div>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm transition-all duration-300">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">
            Total Received
          </p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
            ₹{payout.amount?.toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm transition-all duration-300">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">
            Gross Amount
          </p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
            ₹{payout.grossAmount?.toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm transition-all duration-300">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">
            Platform Commission
          </p>
          <p className="text-2xl font-extrabold text-red-500 dark:text-red-400">
            ₹{payout.platformCommissions?.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Transaction Details */}
      {payout.transaction && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm transition-all duration-300">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">
            Transaction Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-1 uppercase font-bold tracking-wider">Transaction ID</p>
              <p className="font-mono text-gray-800 dark:text-gray-200">
                {payout.transaction.id}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1 uppercase font-bold tracking-wider">
                Transaction Date & Time
              </p>
              <p className="text-gray-800 dark:text-gray-200">
                {dayjs(payout.transaction.createdAt).format(
                  "MMM D, YYYY h:mm A",
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1 uppercase font-bold tracking-wider">Amount</p>
              <p className="font-bold text-gray-800 dark:text-gray-200">
                ₹{payout.transaction.amount?.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1 uppercase font-bold tracking-wider">
                Transaction Status
              </p>
              <span
                className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusBadge(payout.transaction.status)}`}
              >
                {payout.transaction.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Appointments Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm transition-all duration-300">
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            Included Appointments
          </h2>
          <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-slate-400 bg-gray-55 dark:bg-slate-800 px-3 py-1 rounded-xl">
            {payout.appointments?.length || 0} count
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-405 text-xs font-medium border-b border-gray-100 dark:border-slate-800 uppercase tracking-wider">
                <th className="px-6 py-4">Appointment ID</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
              {payout.appointments?.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-16 text-center text-gray-500 dark:text-slate-400 text-sm"
                  >
                    No appointments found.
                  </td>
                </tr>
              ) : (
                payout.appointments?.map((apt: any) => (
                  <tr
                    key={apt._id}
                    className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                        {apt._id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-800 dark:text-slate-200">
                        {apt.patient?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {apt.patient?.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">
                      <p className="font-medium text-gray-800 dark:text-slate-200">
                        {dayjs(apt.start).format("MMM D, YYYY")}
                      </p>
                      <p className="text-xs text-gray-400">
                        {dayjs(apt.start).format("h:mm A")} –{" "}
                        {dayjs(apt.end).format("h:mm A")}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {apt.mode === "online"
                          ? "🌐 Online"
                          : apt.locationName || "In-Person"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-gray-900 dark:text-white">
                        ₹{apt.amount?.toFixed(2) || "—"}
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
  );
}

export default DViewPayoutPage;
