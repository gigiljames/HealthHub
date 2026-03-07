import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import UNavbar from "../../components/user/UNavbar";
import {
  lockSlot,
  bookAppointment,
  getAppointmentSummary,
} from "../../api/user/bookingService";
import { getWallet } from "../../api/user/walletService";
import toast from "react-hot-toast";
import getIcon from "../../helpers/getIcon";

function UAppointmentBookingPage() {
  const { slotId } = useParams();
  const navigate = useNavigate();

  const [reason, setReason] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "wallet">(
    "stripe",
  );
  const [slotData, setSlotData] = useState<any>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [locking, setLocking] = useState(true);
  const [lockError, setLockError] = useState("");
  const [lockExpiry, setLockExpiry] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  useEffect(() => {
    if (!slotId) return;
    (async () => {
      try {
        const [lockRes, summaryRes, walletRes] = await Promise.all([
          lockSlot(slotId),
          getAppointmentSummary(slotId),
          getWallet().catch(() => ({ data: { balance: 0 } })), // Fail silent if wallet throws
        ]);

        setSlotData(lockRes.data);
        setSummaryData(summaryRes.data);
        setWalletBalance(walletRes.data?.balance || 0);

        const expiry = new Date(lockRes.data.lockedUntil);
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

  const handlePaymentSubmit = async () => {
    if (
      paymentMethod === "wallet" &&
      summaryData?.totalAmount > walletBalance
    ) {
      toast.error("Insufficient wallet balance.");
      return;
    }

    try {
      const res = await bookAppointment(slotId!, {
        reason,
        amount: summaryData?.totalAmount || 0,
        currency: "INR",
        paymentMode: paymentMethod,
      });
      const data = res.data;
      if (paymentMethod === "stripe" && data.paymentUrl) {
        window.location = data.paymentUrl;
      } else if (paymentMethod === "wallet") {
        toast.success("Appointment booked successfully using wallet!");
        navigate(`/appointments`, { replace: true });
      }
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

        {/* Doctor and Location Overview */}
        {summaryData && (
          <div className="bg-white dark:bg-gray-900 border border-inputBorder rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <img
                src={
                  summaryData.doctorProfilePictureUrl || "/default-avatar.png"
                }
                alt={summaryData.doctorName}
                className="w-16 h-16 rounded-full object-cover border-2 border-green-100"
              />
              <div>
                <h2 className="text-lg font-bold">
                  Dr. {summaryData.doctorName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 capitalize text-sm">
                  {summaryData.specializationName}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  <span className="font-medium text-darkGreen">
                    {summaryData.practiceLocationName}
                  </span>{" "}
                  • {summaryData.location?.address}
                </p>
              </div>
            </div>

            {/* Appointment Details */}
            <h3 className="text-md font-semibold mb-3">Appointment Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium">
                  {summaryData.slotStartTime
                    ? new Date(summaryData.slotStartTime).toLocaleDateString(
                        "en-IN",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Time</p>
                <p className="font-medium">
                  {summaryData.slotStartTime
                    ? new Date(summaryData.slotStartTime).toLocaleTimeString(
                        "en-IN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Consultation Mode</p>
                <div className="flex flex-col gap-2 mt-0.5">
                  <p className="font-medium capitalize">
                    {summaryData.slotMode || "-"}
                  </p>
                  {summaryData.slotMode === "online" &&
                    summaryData.availableOnlineModes?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {summaryData.availableOnlineModes.map((m: string) => (
                          <div
                            key={m}
                            className="px-2 py-1 bg-green-50 rounded-md text-darkGreen flex items-center gap-1 border border-green-200 shadow-sm"
                          >
                            {getIcon(m.toLowerCase(), "14px")}
                            <span className="text-[10px] font-semibold tracking-wider">
                              {m.charAt(0).toUpperCase() +
                                m.slice(1).toLowerCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Summary */}
        <div className="bg-white dark:bg-gray-900 border border-inputBorder rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-3">Payment Summary</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <p>Consultation Fee</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                ₹{summaryData?.consultationFee || "0"}
              </p>
            </div>
            <div className="flex justify-between">
              <p>Platform Fee</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                ₹{summaryData?.platformFee || "0"}
              </p>
            </div>
            <div className="flex justify-between">
              <p>Tax / GST</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">
                ₹{summaryData?.tax || "0"}
              </p>
            </div>
            <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-2 mt-2 flex justify-between">
              <p className="font-semibold text-gray-900 dark:text-white">
                Total Amount To Pay
              </p>
              <p className="font-bold text-darkGreen text-base">
                ₹{summaryData?.totalAmount || "0"}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="bg-white dark:bg-gray-900 border border-inputBorder rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
          <div className="flex flex-col gap-3">
            <label
              className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentMethod === "stripe"
                  ? "border-darkGreen bg-green-50/50 dark:bg-green-900/10"
                  : "border-gray-200 hover:border-darkGreen/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  value="stripe"
                  checked={paymentMethod === "stripe"}
                  onChange={() => setPaymentMethod("stripe")}
                  className="w-4 h-4 text-darkGreen border-gray-300 focus:ring-darkGreen"
                />
                <span className="font-medium">
                  Credit / Debit Card (Stripe)
                </span>
              </div>
              <svg
                className="w-8 h-8 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" />
              </svg>
            </label>

            <label
              className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentMethod === "wallet"
                  ? "border-darkGreen bg-green-50/50 dark:bg-green-900/10"
                  : "border-gray-200 hover:border-darkGreen/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  value="wallet"
                  checked={paymentMethod === "wallet"}
                  onChange={() => setPaymentMethod("wallet")}
                  className="w-4 h-4 text-darkGreen border-gray-300 focus:ring-darkGreen"
                />
                <div className="flex flex-col">
                  <span className="font-medium">HealthHub Wallet</span>
                  <span className="text-xs text-gray-500 mt-1 font-medium tracking-tight">
                    Balance:{" "}
                    <span className="text-darkGreen font-bold">
                      ₹{walletBalance.toFixed(2)}
                    </span>
                  </span>
                  {summaryData?.totalAmount > walletBalance && (
                    <span className="text-red-500 text-xs font-semibold mt-1">
                      Insufficient Balance
                    </span>
                  )}
                </div>
              </div>
              <svg
                className="w-8 h-8 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </label>
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
            onClick={handlePaymentSubmit}
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
