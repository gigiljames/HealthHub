import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import UNavbar from "../../components/user/UNavbar";
import UPaymentModal from "../../components/user/booking/UPaymentModal";
import { lockSlot, bookAppointment } from "../../api/user/bookingService";
import toast from "react-hot-toast";

function UAppointmentBookingPage() {
  const { slotId } = useParams();
  const navigate = useNavigate();

  const [reason, setReason] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [slotData, setSlotData] = useState<any>(null);
  const [locking, setLocking] = useState(true);
  const [lockError, setLockError] = useState("");
  const [lockExpiry, setLockExpiry] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!slotId) return;
    (async () => {
      try {
        const res = await lockSlot(slotId);
        setSlotData(res.data);
        const expiry = new Date(res.data.lockedUntil);
        setLockExpiry(expiry);
        setTimeLeft(
          Math.max(0, Math.round((expiry.getTime() - Date.now()) / 1000)),
        );
      } catch (err: any) {
        setLockError(
          err?.response?.data?.message || "Slot is no longer available.",
        );
      } finally {
        setLocking(false);
      }
    })();
  }, [slotId]);

  // Countdown timer
  useEffect(() => {
    if (!lockExpiry) return;
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.round((lockExpiry.getTime() - Date.now()) / 1000),
      );
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        toast.error("Your slot lock expired. Please select again.");
        navigate(-1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockExpiry]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handlePaymentSuccess = async () => {
    setShowPayment(false);
    try {
      const res = await bookAppointment(slotId!, {
        reason,
        amount: slotData?.consultationFee || 0,
        currency: "INR",
      });
      navigate(
        `/appointments/${res.data.appointment._id}/confirmation?status=success`,
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Booking failed. Please try again.",
      );
      navigate(`/appointments/confirmation?status=failure`);
    }
  };

  if (locking) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950">
        <UNavbar />
        <div className="text-center">
          <svg
            className="animate-spin h-10 w-10 text-darkGreen mx-auto mb-4"
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
          <p className="text-gray-600 font-medium">Locking your slot...</p>
        </div>
      </div>
    );
  }

  if (lockError) {
    return (
      <div className="w-full h-screen flex flex-col bg-slate-50 dark:bg-gray-950">
        <UNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Slot Unavailable
            </h2>
            <p className="text-gray-600 mb-6">{lockError}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-darkGreen text-white px-6 py-2.5 rounded-lg font-semibold"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100">
      <UNavbar />
      {showPayment && (
        <UPaymentModal
          amount={slotData?.consultationFee || 0}
          currency="INR"
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}

      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        {/* Timer Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-amber-700 text-sm font-medium">
              Slot reserved for you
            </p>
          </div>
          <span
            className={`text-base font-bold ${timeLeft < 120 ? "text-red-600" : "text-amber-700"}`}
          >
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </div>

        <h1 className="text-2xl font-bold mb-6">Confirm Your Appointment</h1>

        {/* Slot Details Card */}
        <div className="bg-white dark:bg-gray-900 border border-inputBorder rounded-2xl p-6 mb-6 space-y-3">
          <h2 className="text-lg font-semibold mb-3">Appointment Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-medium">
                {slotData?.start
                  ? new Date(slotData.start).toLocaleDateString("en-IN", {
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
                {slotData?.start
                  ? new Date(slotData.start).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Consultation Mode</p>
              <p className="font-medium capitalize">{slotData?.mode || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500">Consultation Fee</p>
              <p className="font-bold text-darkGreen text-base">
                ₹{slotData?.consultationFee || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Reason for Consultation */}
        <div className="bg-white dark:bg-gray-900 border border-inputBorder rounded-2xl p-6 mb-8">
          <label className="block text-lg font-semibold mb-2">
            Reason for Consultation <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Briefly describe your symptoms or reason for the visit..."
            className="w-full border border-inputBorder rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-darkGreen resize-none dark:bg-gray-800"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 border border-gray-300 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            Cancel
          </button>
          <button
            disabled={!reason.trim()}
            onClick={() => setShowPayment(true)}
            className="flex-1 bg-darkGreen text-white font-semibold py-3 rounded-xl hover:bg-darkGreen/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Pay &amp; Book →
          </button>
        </div>
      </div>
    </div>
  );
}

export default UAppointmentBookingPage;
