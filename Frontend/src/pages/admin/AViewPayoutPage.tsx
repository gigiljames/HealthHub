import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import ASidebar from "../../components/admin/ASidebar";
import AMobileSidebar from "../../components/admin/AMobileSidebar";
import { getAdminPayoutDetails } from "../../api/payoutService";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import getIcon from "../../helpers/getIcon";

const AViewPayoutPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payout, setPayout] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await getAdminPayoutDetails(id);
        if (data.success) {
          setPayout(data.data);
        } else {
          toast.error(data.message || "Failed to fetch payout");
          navigate("/admin/payouts");
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to load payout");
        navigate("/admin/payouts");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "PROCESSED":
        return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      case "PENDING":
        return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
      case "FAILED":
        return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  return (
    <>
      <AMobileSidebar page="payouts" />
      <div className="flex w-full flex-col lg:flex-row">
        <ASidebar page="payouts" />
        <div className="w-screen lg:flex-1 relative">
          <div className="flex flex-col gap-4 p-4 h-screen overflow-y-auto bg-[#f3f4f6] dark:bg-[#1a1c23] text-gray-800 dark:text-gray-200 transition-colors duration-200 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => navigate("/admin/payouts")}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {getIcon("left", "20px", "currentColor")}
              </button>
              <div>
                <h1 className="text-2xl font-bold">Payout Details</h1>
                {payout && (
                  <p className="text-xs font-mono text-gray-400">
                    {payout._id}
                  </p>
                )}
              </div>
              {payout && (
                <span
                  className={`ml-auto px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(payout.status)}`}
                >
                  {payout.status}
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-lightGreen"></div>
              </div>
            ) : payout ? (
              <>
                {/* Doctor Info */}
                {payout.doctor && (
                  <div className="bg-white dark:bg-[#252831] p-5 rounded-lg border border-gray-100 dark:border-gray-800">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Doctor
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Name</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">
                          {payout.doctor.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Email</p>
                        <p className="text-gray-700 dark:text-gray-300">
                          {payout.doctor.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          Specialization
                        </p>
                        <p className="text-indigo-500">
                          {payout.doctor.specialization || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payout Financials */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-[#252831] p-5 rounded-lg border border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                      Gross Amount
                    </p>
                    <p className="text-2xl font-bold">
                      ₹{payout.grossAmount?.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-[#252831] p-5 rounded-lg border border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                      Platform Commission
                    </p>
                    <p className="text-2xl font-bold text-red-500">
                      -₹{payout.platformCommissions?.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-[#252831] p-5 rounded-lg border border-green-100 dark:border-green-900/30">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                      Net Payout
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{payout.amount?.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Transaction Details */}
                {payout.transaction && (
                  <div className="bg-white dark:bg-[#252831] p-5 rounded-lg border border-gray-100 dark:border-gray-800">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Transaction Details
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          Transaction ID
                        </p>
                        <p className="font-mono text-gray-700 dark:text-gray-300 text-xs">
                          {payout.transaction.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">
                          Date & Time
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          {dayjs(payout.transaction.createdAt).format(
                            "MMM D, YYYY h:mm A",
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Amount</p>
                        <p className="font-semibold">
                          ₹{payout.transaction.amount?.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Status</p>
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
                <div className="bg-white dark:bg-[#252831] rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="font-semibold text-base">
                      Included Appointments{" "}
                      <span className="text-sm font-normal text-gray-400">
                        ({payout.appointments?.length || 0})
                      </span>
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-[#1f2128] text-gray-500 text-xs font-medium border-b border-gray-100 dark:border-gray-800">
                          <th className="px-5 py-3">Appointment ID</th>
                          <th className="px-5 py-3">Patient</th>
                          <th className="px-5 py-3">Date & Time</th>
                          <th className="px-5 py-3">Location</th>
                          <th className="px-5 py-3 text-right">Consultation Fee</th>
                          <th className="px-5 py-3 text-right">Platform Fee</th>
                          <th className="px-5 py-3 text-right">Total Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {!payout.appointments?.length ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="py-8 text-center text-gray-500 text-sm"
                            >
                              No appointments found.
                            </td>
                          </tr>
                        ) : (
                          payout.appointments.map((apt: any) => (
                            <tr
                              key={apt._id}
                              className="hover:bg-gray-50 dark:hover:bg-[#1d1f26] transition-colors"
                            >
                              <td className="px-5 py-3">
                                <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
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
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                  ₹{apt.consultationFee?.toFixed(2) || (apt.amount ? (apt.amount - (apt.platformFee || 0)).toFixed(2) : "0.00")}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-right">
                                <span className="text-sm text-red-500 font-semibold">
                                  ₹{apt.platformFee?.toFixed(2) || "0.00"}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-right">
                                <span className="text-sm text-green-600 font-bold">
                                  ₹{(apt.amount || ((apt.consultationFee || 0) + (apt.platformFee || 0)))?.toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500">Payout not found.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AViewPayoutPage;
