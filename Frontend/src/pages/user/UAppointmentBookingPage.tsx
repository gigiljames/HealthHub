import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import {
  lockSlot,
  bookAppointment,
  getAppointmentSummary,
} from "../../api/user/bookingService";
import { getWallet } from "../../api/user/walletService";
import toast from "react-hot-toast";
import getIcon from "../../helpers/getIcon";
import Avatar from "../../components/common/Avatar";
import ConfirmationModal from "../../components/common/ConfirmationModal";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmedNavigate, setConfirmedNavigate] = useState<(() => void) | null>(null);
  const isNavigatingAwayRef = useRef(false);

  const handleBackAttempt = (onConfirmNav: () => void) => {
    if (timeLeft > 0 && !isSubmitting) {
      setConfirmedNavigate(() => {
        return () => {
          isNavigatingAwayRef.current = true;
          onConfirmNav();
        };
      });
      setShowConfirmModal(true);
    } else {
      onConfirmNav();
    }
  };

  const timeLeftRef = useRef(timeLeft);
  const isSubmittingRef = useRef(isSubmitting);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  // Handle expired lock auto-back
  useEffect(() => {
    if (timeLeft <= 0) {
      if (window.history.state?.dummy) {
        isNavigatingAwayRef.current = true;
        window.history.back();
      }
    }
  }, [timeLeft]);

  // Intercept navigation on mount
  useEffect(() => {
    // Push initial dummy state to block the first back button click
    if (!window.history.state?.dummy) {
      window.history.pushState({ dummy: true }, "", window.location.href);
    }

    const handlePopState = () => {
      if (isNavigatingAwayRef.current) return;

      // Re-push dummy state to keep blocking subsequent clicks
      window.history.pushState({ dummy: true }, "", window.location.href);
      setConfirmedNavigate(() => {
        return () => {
          isNavigatingAwayRef.current = true;
          window.history.go(-2);
        };
      });
      setShowConfirmModal(true);
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (timeLeftRef.current <= 0 || isSubmittingRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

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
        const status = err?.response?.status;
        if (status === 403) {
          navigate("/403");
          return;
        } else if (status === 404) {
          navigate("/404");
          return;
        }
        setLockError(
          err?.response?.data?.message || "Slot is no longer available.",
        );
      } finally {
        setLocking(false);
      }
    })();
  }, [slotId, navigate]);

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
        // navigate(-1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockExpiry]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handlePaymentSubmit = async () => {
    if (isSubmitting) return;
    if (
      paymentMethod === "wallet" &&
      summaryData?.totalAmount > walletBalance
    ) {
      toast.error("Insufficient wallet balance.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await bookAppointment(slotData?.id || slotId!, {
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
      setIsSubmitting(false);
      navigate(`/appointments/failed/confirmation?status=failure`);
    }
  };

  if (locking) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950">
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
    <div className="w-full min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300 pt-[70px] md:pt-[90px]">
      {/* Sleek Timer Header */}
      <div className="w-full bg-amber-50 dark:bg-amber-900/40 border-b border-amber-200 dark:border-amber-800/80 sticky top-[70px] z-40 shadow-sm backdrop-blur-md border-t-1 border-t-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between ">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-amber-600 dark:text-amber-500 animate-pulse"
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
            <p className="text-amber-800 dark:text-amber-400 text-sm font-bold tracking-wide ">
              Complete your booking
            </p>
          </div>
          <span
            className={`text-base font-black tracking-widest ${timeLeft < 120 ? "text-red-600 dark:text-red-400" : "text-amber-700 dark:text-amber-500"}`}
          >
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16">
        {/* Title */}
        <div className="flex items-center gap-4 mb-6 sm:mb-8 border-b border-gray-200 dark:border-gray-800 pb-4 sm:pb-6">
          <button
            onClick={() => handleBackAttempt(() => navigate(-2))}
            className="p-1.5 sm:p-2 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center cursor-pointer"
          >
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
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
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            Confirm Appointment
          </h1>
        </div>

        {/* Dual-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
            {/* Reason for Consultation */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-darkGreen/10 dark:bg-emerald-500/10 p-2.5 rounded-lg text-darkGreen dark:text-emerald-400">
                  {getIcon("sticky-note", "24px") || (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Reason for Visit
                </h3>
              </div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                Briefly describe your symptoms or reason for the
                consultation{" "}
              </label>
              <textarea
                rows={5}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., I have been experiencing severe headaches for the past 3 days..."
                className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-5 py-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-darkGreen focus:border-transparent transition-all resize-none shadow-inner"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-darkGreen/10 dark:bg-emerald-500/10 p-2.5 rounded-lg text-darkGreen dark:text-emerald-400">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Payment Method
                </h3>
              </div>

              <div className="space-y-4">
                {/* Stripe Optional Input */}
                <label
                  className={`relative flex items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "stripe"
                    ? "border-darkGreen bg-green-50/30 dark:bg-green-900/10 shadow-sm"
                    : "border-gray-200 dark:border-gray-700 hover:border-darkGreen/40 dark:hover:border-emerald-500/40 bg-gray-50/50 dark:bg-gray-800/30"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="payment"
                      value="stripe"
                      checked={paymentMethod === "stripe"}
                      onChange={() => setPaymentMethod("stripe")}
                      className="w-5 h-5 text-darkGreen border-gray-300 focus:ring-darkGreen accent-darkGreen cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                        Credit / Debit Card
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                        Powered by Stripe
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:flex px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md font-bold text-[#635BFF] text-sm tracking-wider shadow-sm">
                    STRIPE
                  </div>
                </label>

                {/* Wallet Optional Input */}
                <label
                  className={`relative flex items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "wallet"
                    ? "border-darkGreen bg-green-50/30 dark:bg-green-900/10 shadow-sm"
                    : "border-gray-200 dark:border-gray-700 hover:border-darkGreen/40 dark:hover:border-emerald-500/40 bg-gray-50/50 dark:bg-gray-800/30"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="payment"
                      value="wallet"
                      checked={paymentMethod === "wallet"}
                      onChange={() => setPaymentMethod("wallet")}
                      className="w-5 h-5 text-darkGreen border-gray-300 focus:ring-darkGreen accent-darkGreen cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                        HealthHub Wallet
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                        Balance:{" "}
                        <span className="text-darkGreen dark:text-emerald-400 font-bold">
                          ₹{walletBalance.toFixed(2)}
                        </span>
                      </span>
                      {summaryData?.totalAmount > walletBalance && (
                        <div className="mt-2 inline-flex items-center gap-1.5 text-red-600 dark:text-red-400 text-sm font-bold">
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
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          Insufficient Balance
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:flex text-darkGreen dark:text-emerald-400 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                    {getIcon("wallet", "24px") || (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Action */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 relative">
            <div className="sticky top-24 flex flex-col gap-6">
              {/* Checkout Summary Card */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg shadow-gray-200/40 dark:shadow-none overflow-hidden">
                <div className="p-4 sm:p-6 md:p-7 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-5">
                    Booking Summary
                  </h3>

                  {summaryData ? (
                    <div className="flex gap-4 items-center">
                      <Avatar
                        src={
                          summaryData.doctorProfilePictureUrl ||
                          "/default-avatar.png"
                        }
                        alt={summaryData.doctorName}
                        className="w-[72px] h-[72px] rounded-xl object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-gray-100 text-base sm:text-lg leading-tight">
                          Dr. {summaryData.doctorName}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-darkGreen dark:text-emerald-400 capitalize mt-1 mb-1.5">
                          {summaryData.specializationName}
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold text-gray-500 flex items-center gap-1 leading-tight line-clamp-1">
                          {getIcon("location", "12px")}
                          {summaryData.practiceLocationName}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[72px] w-full animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  )}
                </div>

                <div className="px-4 py-4 sm:px-6 sm:py-5 md:px-7 flex flex-col gap-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-gray-500 font-bold uppercase tracking-wider text-xs">
                      {getIcon("calendar", "14px")} Date
                    </div>
                    <span className="font-bold text-gray-950 dark:text-white">
                      {summaryData?.slotStartTime
                        ? new Date(
                          summaryData.slotStartTime,
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-gray-500 font-bold uppercase tracking-wider text-xs">
                      {getIcon("clock", "14px")} Time
                    </div>
                    <span className="font-bold text-gray-950 dark:text-white">
                      {summaryData?.slotStartTime
                        ? new Date(
                          summaryData.slotStartTime,
                        ).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-gray-500 font-bold uppercase tracking-wider text-xs">
                      {summaryData?.slotMode === "online"
                        ? getIcon("video", "14px")
                        : getIcon("user", "14px")}{" "}
                      Mode
                    </div>
                    <span className="font-bold text-gray-950 dark:text-white capitalize">
                      {summaryData?.slotMode || "-"}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6 md:p-7 bg-gray-50/50 dark:bg-gray-800/30 font-medium">
                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 mb-3 text-xs sm:text-sm">
                    <span>Consultation Fee</span>
                    <span className="text-gray-900 dark:text-gray-200 font-bold">
                      ₹{summaryData?.consultationFee || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 mb-3 text-xs sm:text-sm">
                    <span>Platform Fee</span>
                    <span className="text-gray-900 dark:text-gray-200 font-bold">
                      ₹{summaryData?.platformFee || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 mb-4 text-xs sm:text-sm">
                    <span>Tax / GST</span>
                    <span className="text-gray-900 dark:text-gray-200 font-bold">
                      ₹{summaryData?.tax || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-300 dark:border-gray-700">
                    <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                      Total Pay
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-darkGreen dark:text-emerald-400">
                      ₹{summaryData?.totalAmount || "0"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <button
                id="pay-and-book-btn"
                onClick={handlePaymentSubmit}
                disabled={isSubmitting}
                className="w-full bg-darkGreen text-white font-bold text-base sm:text-lg py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:opacity-90 shadow-xl shadow-darkGreen/20 transition-all flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5"
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
                    Processing...
                  </>
                ) : (
                  <>
                    Pay &amp; Book
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </button>

              <button
                onClick={() => handleBackAttempt(() => navigate(-2))}
                className="text-center font-bold text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors py-2 text-sm cursor-pointer"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmedNavigate(null);
        }}
        onConfirm={() => {
          setShowConfirmModal(false);
          if (confirmedNavigate) {
            confirmedNavigate();
          }
        }}
        title="Abandon Booking?"
        message="Are you sure you want to leave this page? You won't be able to access this slot again until the slot lock lifts."
        confirmText="Yes, Leave"
        cancelText="No, Keep Slot"
        isDestructive={true}
      />
    </div>
  );
}

export default UAppointmentBookingPage;
