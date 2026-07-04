import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface UAppointmentCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  previewData: {
    refundAmount: number;
    refundPercentage: number;
    expiresAt: string | null;
  } | null;
}

export default function UAppointmentCancelModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  previewData,
}: UAppointmentCancelModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, loading, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={!loading ? onClose : undefined}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-inputBorder overflow-hidden"
          >
            <h3 className="text-xl font-bold leading-6 text-gray-900 dark:text-gray-100 mb-2">
              Cancel Appointment
            </h3>

            {!previewData ? (
              <div className="py-8 flex justify-center items-center">
                <svg
                  className="animate-spin h-8 w-8 text-red-500"
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
            ) : (
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Are you sure you want to cancel your appointment? Based on our
                  cancellation policy, here is your refund breakdown:
                </p>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-red-800 dark:text-red-400">
                      Refund Amount ({previewData.refundPercentage}%)
                    </span>
                    <span className="text-xl font-bold text-red-600 dark:text-red-400">
                      ₹{previewData.refundAmount}
                    </span>
                  </div>

                  {previewData.expiresAt ? (
                    <p className="text-xs text-red-600/80 dark:text-red-400/80">
                      *This refund tier expires at{" "}
                      <span className="font-semibold">
                        {new Date(previewData.expiresAt).toLocaleString(
                          "en-IN",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </p>
                  ) : (
                    <p className="text-xs text-red-600/80 dark:text-red-400/80">
                      *This is the final refund amount for cancelling this close
                      to the appointment time.
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    className="flex-1 justify-center rounded-xl bg-gray-100 dark:bg-gray-800 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Keep Appointment
                  </button>
                  <button
                    type="button"
                    className="flex-1 justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onConfirm}
                    disabled={loading}
                  >
                    {loading ? "Cancelling..." : "Confirm Cancel"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
