import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { getAdminAppointmentById } from "../../api/admin/adminAppointmentService";
import getIcon from "../../helpers/getIcon";
import AMobileSidebar from "../../components/admin/AMobileSidebar";
import ASidebar from "../../components/admin/ASidebar";
import dayjs from "dayjs";
import Avatar from "../../components/common/Avatar";

const AViewAppointmentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAppointmentDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminAppointmentById(id!);
      setAppointment(res.data);
    } catch (error) {
      console.error("Failed to fetch appointment details", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchAppointmentDetails();
    }
  }, [id, fetchAppointmentDetails]);

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "RESCHEDULE_PENDING":
        return "bg-amber-100 text-amber-705 border-amber-200";
      case "COMPLETED":
        return "bg-green-100 text-green-700 border-green-200";
      case "CANCELLED":
      case "CANCELLED_BY_DOCTOR":
      case "CANCELLED_BY_USER":
      case "NO_SHOW":
        return "bg-red-100 text-red-700 border-red-200";
      case "PENDING_PAYMENT":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPaymentStatusBadgeClass = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
        return "bg-green-100 text-green-700 border-green-200";
      case "INITIATED":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "FAILED":
      case "REFUNDED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex w-full h-screen">
        <ASidebar page="appointments" />
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[#1a1c23]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lightGreen"></div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex w-full h-screen">
        <ASidebar page="appointments" />
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#1a1c23] text-gray-500">
          {getIcon("search-solid", "64px")}
          <h2 className="mt-4 text-xl">Appointment not found</h2>
          <button
            onClick={() => navigate("/admin/appointments")}
            className="mt-4 px-4 py-2 bg-lightGreen text-white rounded-md hover:opacity-90 transition-opacity"
          >
            Back to list
          </button>
        </div>
      </div>
    );
  }

  const {
    patientFields: patient,
    doctorFields: doctor,
    slot,
    allTransactions,
  } = appointment;

  return (
    <>
      <AMobileSidebar page="appointments" />
      <div className="flex w-full flex-col lg:flex-row">
        <ASidebar page="appointments" />
        <div className="w-screen lg:flex-1 relative">
          <div className="flex flex-col gap-2 p-4 h-screen overflow-y-auto bg-[#f3f4f6] dark:bg-[#1a1c23] text-gray-800 dark:text-gray-200 animate-fade-in w-full transition-colors duration-200 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/admin/appointments")}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  {getIcon("left", "24px")}
                </button>
                <div>
                  <h1 className="text-3xl font-bold">Appointment Details</h1>
                  <p className="font-mono text-sm text-gray-500 mt-1">
                    ID: {appointment._id}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getStatusBadgeClass(appointment.status)}`}
                >
                  {appointment.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Patient Card */}
              <div className="bg-white dark:bg-[#252831] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-6">
                <div className="w-20 h-20 rounded-full border-4 border-gray-50 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                  {patient?.profileImageUrl ? (
                    <Avatar
                      src={patient.profileImageUrl}
                      alt="Patient Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">
                      {getIcon("user", "40px")}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-blue-500 uppercase font-bold tracking-wider mb-1">
                    Patient
                  </p>
                  <h2 className="text-xl font-bold mb-1">
                    {patient?.name || "Unknown Patient"}
                  </h2>
                  <p className="text-sm text-gray-500 mb-2">{patient?.email}</p>
                  <p className="font-mono text-xs text-gray-400">
                    ID: {patient?.id}
                  </p>
                </div>
              </div>

              {/* Doctor Card */}
              <div className="bg-white dark:bg-[#252831] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-6">
                <div className="w-20 h-20 rounded-full border-4 border-gray-50 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                  {doctor?.profileImageUrl ? (
                    <Avatar
                      src={doctor.profileImageUrl}
                      alt="Doctor Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">
                      {getIcon("user", "40px")}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-green-500 uppercase font-bold tracking-wider mb-1">
                    Doctor
                  </p>
                  <h2 className="text-xl font-bold mb-1">
                    {doctor?.name || "Unknown Doctor"}
                  </h2>
                  <p className="text-sm text-gray-500 mb-2">{doctor?.email}</p>
                  <p className="font-mono text-xs text-gray-400">
                    ID: {doctor?.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Appointment specifics */}
            <div className="bg-white dark:bg-[#252831] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
              <h3 className="text-lg font-semibold mb-4 border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center gap-2">
                {getIcon("calendar", "20px")} Context & Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Schedule
                  </p>
                  <p className="font-semibold">
                    {dayjs(slot?.start).format("MMM D, YYYY")}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {dayjs(slot?.start).format("h:mm A")} -{" "}
                    {dayjs(slot?.end).format("h:mm A")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Mode
                  </p>
                  <p className="font-semibold capitalize">
                    {slot?.consultationMode === "online"
                      ? "🟢 Online"
                      : "🏢 In-Person"}
                  </p>
                </div>
                <div className="col-span-1 md:col-span-2 text-sm text-gray-700 dark:text-gray-300">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Location Details
                  </p>
                  <p className="font-medium">
                    {slot?.locationName || "Virtual/Online Consult"}
                  </p>
                  {slot?.location?.address && (
                    <p className="mt-1">{slot?.location?.address}</p>
                  )}
                </div>
                <div className="col-span-1 md:col-span-2 lg:col-span-4 border-t border-gray-100 dark:border-gray-700 pt-4 mt-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Consultation Fee
                    </p>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      ₹{appointment.consultationFee || slot?.consultationFee || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Platform Fee
                    </p>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      ₹{appointment.platformFee || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Total Billed
                    </p>
                    <p className="font-bold text-darkGreen dark:text-emerald-400">
                      ₹{appointment.payment?.amount || ((appointment.consultationFee || slot?.consultationFee || 0) + (appointment.platformFee || 0))}
                    </p>
                  </div>
                </div>

                <div className="col-span-1 lg:col-span-4 mt-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Patient's Reason for Visit
                  </p>
                  <div className="p-4 bg-gray-50 dark:bg-[#1f2128] rounded border border-gray-100 dark:border-gray-700 text-sm whitespace-pre-wrap">
                    {appointment.reason || "No reason provided."}
                  </div>
                </div>
                {appointment.status === "CANCELLED_BY_DOCTOR" && appointment.cancellationReason && (
                  <div className="col-span-1 lg:col-span-4 mt-2">
                    <p className="text-xs font-semibold text-red-500 uppercase mb-2">
                      Doctor's Cancellation Reason
                    </p>
                    <div className="p-4 bg-red-500/5 border border-red-200 dark:border-red-900/30 rounded text-sm whitespace-pre-wrap font-medium italic">
                      "{appointment.cancellationReason}"
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Transactions related to this appointment */}
            <div className="bg-white dark:bg-[#252831] p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                {getIcon("money-bill-wave", "20px")} Related Transactions
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-[#1f2128] text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                      <th className="px-4 py-3">Txn ID / Date</th>
                      <th className="px-4 py-3">Type & Source</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Direction</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {allTransactions && allTransactions.length > 0 ? (
                      allTransactions.map((txn: any) => (
                        <tr
                          key={txn._id}
                          onClick={() =>
                            navigate(`/admin/transactions/${txn._id}`)
                          }
                          className="hover:bg-gray-50 dark:hover:bg-[#1d1f26] cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="font-mono text-sm">{txn._id}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {dayjs(txn.createdAt).format(
                                "MMM D, YYYY h:mm A",
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-semibold">
                              {txn.type?.replace(/_/g, " ")}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              via {txn.source}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2.5 py-1 text-xs font-bold rounded-full ${getPaymentStatusBadgeClass(txn.status)}`}
                            >
                              {txn.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`text-xs font-bold ${txn.direction === "CREDIT" ? "text-green-500" : "text-red-500"}`}
                            >
                              {txn.direction}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div
                              className={`font-bold ${txn.direction === "CREDIT" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                            >
                              {txn.direction === "CREDIT" ? "+" : "-"}₹
                              {txn.amount?.toFixed(2)}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          <p>No transactions found for this appointment.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AViewAppointmentPage;
