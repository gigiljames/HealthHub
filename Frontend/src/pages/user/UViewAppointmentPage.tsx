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
    <div className="w-full min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100">
      <UNavbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        {/* Back */}
        <button
          onClick={() => navigate("/appointments")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
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
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Appointments
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Appointment Details</h1>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}
          >
            {status.label}
          </span>
        </div>

        {/* Doctor Info */}
        <div className="bg-white dark:bg-gray-900 border border-inputBorder rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-4">
            <img
              src={
                doctor.profileImageUrl ||
                "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
              }
              alt={doctor.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <p className="text-lg font-semibold">Dr. {doctor.name}</p>
              <p className="text-gray-500 text-sm">{doctor.specialization}</p>
              {doctor.contactPhone && (
                <p className="text-sm text-gray-400 mt-0.5">
                  {doctor.contactPhone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="bg-white dark:bg-gray-900 border border-inputBorder rounded-2xl p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">Consultation Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-medium">
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
            <div>
              <p className="text-gray-500">Time</p>
              <p className="font-medium">
                {slot.start
                  ? new Date(slot.start).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Mode</p>
              <p className="font-medium capitalize">
                {slot.consultationMode || "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Reason</p>
              <p className="font-medium">{appointment.reason || "-"}</p>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white dark:bg-gray-900 border border-inputBorder rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Amount</p>
              <p className="text-2xl font-bold text-darkGreen">
                ₹{payment.amount || slot.consultationFee || 0}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${payStatus.color}`}
            >
              {payStatus.label}
            </span>
          </div>
        </div>

        {/* Actions */}
        {isFuture && (
          <div className="flex gap-3">
            {(appointment.status === "CONFIRMED" ||
              appointment.status === "IN_PROGRESS") && (
              <button
                onClick={() => navigate(`/consultation/${id}`)}
                className="flex-1 bg-darkGreen text-white font-semibold py-3 rounded-xl hover:bg-darkGreen/90 transition-all"
              >
                {appointment.status === "IN_PROGRESS"
                  ? "Rejoin Consultation"
                  : "Join Consultation"}
              </button>
            )}
            {appointment.status !== "IN_PROGRESS" && (
              <button
                onClick={handleCancelClick}
                disabled={cancelling}
                className="flex-1 border border-red-300 text-red-600 font-medium py-3 rounded-xl hover:bg-red-50 disabled:opacity-50 transition-all"
              >
                {cancelling ? "Cancelling..." : "Cancel Appointment"}
              </button>
            )}
          </div>
        )}
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
