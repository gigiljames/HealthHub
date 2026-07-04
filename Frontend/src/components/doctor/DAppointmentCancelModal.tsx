import { motion, AnimatePresence } from "framer-motion";
import getIcon from "../../helpers/getIcon";
import { useEffect, useState } from "react";

interface DAppointmentCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
  appointmentId: string;
}

export default function DAppointmentCancelModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  appointmentId,
}: DAppointmentCancelModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, loading, onClose]);

  const handleConfirm = () => {
    if (reason.trim().length < 5) {
      setError("Please provide a valid reason (min 5 characters).");
      return;
    }
    onConfirm(reason);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50"
            onClick={() => !loading && onClose()}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden m-4"
          >
            {/* Header */}
            <div className="bg-red-50/50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-red-500">
                  {getIcon("exclamation-circle", "22px")}
                </span>
                Cancel Appointment
              </h3>
              <button
                onClick={() => !loading && onClose()}
                disabled={loading}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 text-2xl"
              >
                {getIcon("close")}
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl mb-6">
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  Are you sure you want to cancel this appointment? Cancelling
                  guarantees a full 100% refund of the amount to the patient.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  ID: <span className="font-mono">{appointmentId}</span>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (error) setError("");
                  }}
                  disabled={loading}
                  maxLength={500}
                  rows={4}
                  className={`w-full p-3 bg-gray-50 border rounded-xl outline-none transition-all resize-none text-sm text-gray-700 ${
                    error
                      ? "border-red-300 focus:border-red-500 focus:bg-white"
                      : "border-gray-200 focus:border-darkGreen focus:bg-white"
                  }`}
                  placeholder="Please provide a brief reason for cancelling this appointment..."
                />
                <div className="flex justify-between items-center mt-1">
                  {error ? (
                    <p className="text-xs text-red-500 font-medium">{error}</p>
                  ) : (
                    <p className="text-xs text-gray-400">
                      This reason will be shared with the patient.
                    </p>
                  )}
                  <p className="text-xs text-gray-400">{reason.length}/500</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3 flex-col sm:flex-row">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-100 hover:text-gray-800 transition-colors disabled:opacity-50 w-full sm:w-auto"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Yes, Cancel</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
