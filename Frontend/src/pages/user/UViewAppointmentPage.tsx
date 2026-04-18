import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import UNavbar from "../../components/user/UNavbar";
import {
  getAppointmentById,
  cancelAppointment,
  getCancelPreview,
} from "../../api/user/bookingService";
import UAppointmentCancelModal from "../../components/user/UAppointmentCancelModal";
import toast from "react-hot-toast";
import Avatar from "../../components/common/Avatar";
import getIcon from "../../helpers/getIcon";

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT: {
    label: "Pending Payment",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
  },
  NO_SHOW: {
    label: "No Show",
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  INITIATED: { label: "Initiated", color: "text-yellow-600 bg-yellow-50" },
  SUCCESS: { label: "Paid", color: "text-green-600 bg-green-50" },
  FAILED: { label: "Failed", color: "text-red-600 bg-red-50" },
  REFUNDED: { label: "Refunded", color: "text-purple-600 bg-purple-50" },
};

function UViewAppointmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await getAppointmentById(id);
        setAppointment(res.data);
      } catch (err: any) {
        toast.error("Could not load appointment details.");
        navigate("/appointments");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleCancelClick = async () => {
    setIsCancelModalOpen(true);
    setPreviewData(null);
    try {
      const res = await getCancelPreview(id!);
      setPreviewData(res.data);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Could not fetch cancellation preview.",
      );
      setIsCancelModalOpen(false);
    }
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      await cancelAppointment(id!);
      toast.success("Appointment cancelled successfully.");
      navigate("/appointments");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Could not cancel appointment.",
      );
    } finally {
      setCancelling(false);
      setIsCancelModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950">
        <UNavbar />
        <svg
          className="animate-spin h-10 w-10 text-darkGreen"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      </div>
    );
  }

  if (!appointment) return null;

  const doctor = appointment.doctor || {};
  const slot = appointment.slot || {};
  const payment = appointment.payment || {};
  const status = statusConfig[appointment.status] || {
    label: appointment.status,
    color: "bg-gray-100 text-gray-800",
  };
  const payStatus = paymentStatusConfig[payment.status] || {
    label: payment.status || "N/A",
    color: "text-gray-600 bg-gray-50",
  };
  const isFuture =
    appointment.status === "CONFIRMED" ||
    appointment.status === "PENDING_PAYMENT" ||
    appointment.status === "IN_PROGRESS";

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300">
      {/* Page Header Area */}
      <div className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 pt-16 lg:pt-24 pb-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/appointments")}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors w-fit"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Appointments
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Appointment Details
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm font-medium">
                Appointment ID:{" "}
                <span className="font-mono text-gray-700 dark:text-gray-300">
                  {appointment.id || id?.toUpperCase()}
                </span>
              </p>
            </div>
            <div
              className={`w-fit px-4 py-1.5 rounded-full border text-sm font-bold shadow-sm flex items-center gap-2 ${status.color}`}
            >
              <div className="w-2 h-2  rounded-full bg-current opacity-70"></div>
              {status.label}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Vertical Stack */}
      <div className="flex-1 w-full relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-15 flex flex-col gap-6">
          {/* Doctor Overview & Actions Card */}
          <div className="bg-white dark:bg-gray-900 p-6 md:p-7 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar
                src={doctor?.profileImageUrl}
                alt={doctor?.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-gray-50 dark:border-gray-800 shadow-sm"
              />
              <div className="flex-1 text-center sm:text-left flex flex-col justify-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Dr. {doctor.name}
                </h2>
                <p className="text-base text-darkGreen dark:text-emerald-400 font-semibold mb-3">
                  {doctor.specialization}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  {doctor.contactPhone && (
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
                      {getIcon("call", "16px")}
                      {doctor.contactPhone}
                    </div>
                  )}
                  <button
                    onClick={() => navigate(`/doctors/${doctor.id}`)}
                    className="text-sm font-bold text-darkGreen dark:text-emerald-400 hover:text-green-800 dark:hover:text-emerald-300 transition-colors flex items-center gap-1"
                  >
                    View Profile
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isFuture && (
              <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto min-w-[200px] mt-2 md:mt-0">
                {(appointment.status === "CONFIRMED" ||
                  appointment.status === "IN_PROGRESS") && (
                  <button
                    onClick={() => navigate(`/consultation/${id}`)}
                    className="flex-1 md:flex-none w-full bg-darkGreen text-white font-bold py-3 rounded-xl hover:opacity-90 shadow-lg shadow-darkGreen/20 transition-all flex justify-center items-center gap-2 px-4"
                  >
                    {getIcon("video", "18px") || (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                        />
                      </svg>
                    )}
                    {appointment.status === "IN_PROGRESS"
                      ? "Rejoin"
                      : "Join Consultation"}
                  </button>
                )}
                {appointment.status !== "IN_PROGRESS" && (
                  <button
                    onClick={handleCancelClick}
                    disabled={cancelling}
                    className="flex-1 md:flex-none w-full bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 font-bold py-3 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-all px-4"
                  >
                    {cancelling ? "Processing..." : "Cancel Consultation"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Consultation Details */}
          <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              Consultation Info
            </h3>

            <div className="flex flex-col gap-6">
              {/* Date, Time, Mode Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Date */}
                <div className="flex flex-col xl:flex-row items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-darkGreen dark:text-emerald-400">
                    {getIcon("calendar", "24px")}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                      Date
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {slot.start
                        ? new Date(slot.start).toLocaleDateString("en-IN", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex flex-col xl:flex-row items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-darkGreen dark:text-emerald-400">
                    {getIcon("clock", "24px")}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                      Time
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {slot.start
                        ? new Date(slot.start).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* Mode */}
                <div className="flex flex-col xl:flex-row items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-darkGreen dark:text-emerald-400">
                    {getIcon(
                      slot.consultationMode?.toLowerCase() === "online"
                        ? "laptop-medical"
                        : "clinic",
                      "24px",
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                      Mode
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                      {slot.consultationMode || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reason Row */}
              <div className="flex flex-col sm:flex-row items-start gap-4 p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-darkGreen dark:text-emerald-400 mt-1">
                  {getIcon("sticky-note", "24px")}
                </div>
                <div className="w-full">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Reason for Visit
                  </p>
                  <div className="font-medium text-gray-900 dark:text-gray-100 leading-relaxed break-words whitespace-pre-wrap md:pr-17">
                    {appointment.reason || "No reason provided."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4 mb-5">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Payment Info
              </h3>
              <div
                className={`px-4 py-1.5 rounded-full text-sm font-bold border shadow-sm ${payStatus.color}`}
              >
                {payStatus.label}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                Consultation Fee
              </span>
              <span className="font-bold text-gray-900 dark:text-gray-100 text-xl">
                ₹{payment.amount || slot.consultationFee || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      <UAppointmentCancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        loading={cancelling}
        previewData={previewData}
      />
    </div>
  );
}

export default UViewAppointmentPage;
