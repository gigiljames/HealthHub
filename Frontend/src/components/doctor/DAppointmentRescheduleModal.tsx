import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import getIcon from "../../helpers/getIcon";
import { getFullCalendarSlots } from "../../api/doctor/dSlotManagementService";
import { getPublicDoctorProfile } from "../../api/doctor/doctorService";
import type { RootState } from "../../state/store";

interface PracticeLocation {
  _id: string;
  name: string;
  locationName?: string;
  address?: string;
}

interface SlotDTO {
  id: string;
  title: string;
  start: string;
  end: string;
  mode: "online" | "in-person";
  practiceLocationId: string;
  status?: string;
  isBooked: boolean;
}

interface GroupedSlots {
  [date: string]: {
    [practiceLocationId: string]: SlotDTO[];
  };
}

interface DAppointmentRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { newSlotId: string; reason: string; customReason?: string }) => void;
  loading: boolean;
  appointmentId: string;
  currentSlotStart: string;
  practiceLocationId: string;
  mode: string;
}

const RESCHEDULE_REASONS = [
  "Doctor Unavailable",
  "Emergency",
  "Schedule Conflict",
  "Personal Reasons",
  "Other",
];

export default function DAppointmentRescheduleModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  appointmentId,
  currentSlotStart,
  practiceLocationId,
  mode,
}: DAppointmentRescheduleModalProps) {
  const doctorId = useSelector((state: RootState) => state.userInfo.id);

  const [slots, setSlots] = useState<GroupedSlots | null>(null);
  const [locations, setLocations] = useState<PracticeLocation[]>([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [error, setError] = useState("");

  // Fetch slots and location profiles
  useEffect(() => {
    if (isOpen && doctorId) {
      // Reset state
      setSlots(null);
      setSelectedDate(null);
      setSelectedSlotId(null);
      setReason("");
      setCustomReason("");
      setError("");
      document.body.style.overflow = "hidden";

      setFetchingSlots(true);

      const fetchAllData = async () => {
        try {
          // Fetch public doctor profile for location details
          const profileRes = await getPublicDoctorProfile(doctorId);
          if (profileRes?.success && profileRes?.doctor?.practiceLocations) {
            setLocations(profileRes.doctor.practiceLocations);
          }

          // Fetch next 30 days of slots matching location and mode (available and booked)
          const todayStr = dayjs().format("YYYY-MM-DD");
          const slotsRes = await getFullCalendarSlots({
            doctorId,
            startDate: todayStr,
            days: 30,
            practiceLocationId,
            mode,
            status: "AVAILABLE,BOOKED",
          });

          if (slotsRes?.success && slotsRes.data) {
            const rawData = slotsRes.data as {
              [practiceLocationId: string]: {
                [dateStr: string]: SlotDTO[];
              };
            };

            console.log("Reschedule Modal received pre-filtered slots:", {
              practiceLocationId,
              mode,
              rawData
            });

            // Group slots by date first, then location id, as expected by the UI render logic
            const transformedData: GroupedSlots = {};
            Object.entries(rawData).forEach(([locId, dateGroup]) => {
              Object.entries(dateGroup).forEach(([dateStr, locSlots]) => {
                if (!transformedData[dateStr]) {
                  transformedData[dateStr] = {};
                }
                transformedData[dateStr][locId] = locSlots;
              });
            });

            setSlots(transformedData);

            // Auto-select first date that has slots
            const dates = Object.keys(transformedData).sort();
            if (dates.length > 0) {
              setSelectedDate(dates[0]);
            }
          }
        } catch (err: any) {
          console.error("Failed to load doctor slots / profile:", err);
          toast.error("Error loading available slots. Please try again.");
        } finally {
          setFetchingSlots(false);
        }
      };

      fetchAllData();
    } else {
      document.body.style.overflow = "unset";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading && !fetchingSlots) {
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
  }, [isOpen, doctorId, onClose, practiceLocationId, mode]);

  const handleConfirmClick = () => {
    setError("");

    if (!selectedSlotId) {
      setError("Please select a new slot for rescheduling.");
      return;
    }

    if (!reason) {
      setError("Please select a reason for rescheduling.");
      return;
    }

    if (reason === "Other" && (!customReason || !customReason.trim())) {
      setError("Please specify a description for your custom reason.");
      return;
    }

    onConfirm({
      newSlotId: selectedSlotId,
      reason,
      customReason: reason === "Other" ? customReason : undefined,
    });
  };

  const datesList = slots ? Object.keys(slots).sort() : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          {/* Backdrop click handler */}
          <div className="absolute inset-0" onClick={() => !loading && !fetchingSlots && onClose()} />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-850">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <span className="text-emerald-600 dark:text-emerald-500">
                  {getIcon("calendar", "22px")}
                </span>
                Reschedule Appointment
              </h3>
              <button
                onClick={() => !loading && !fetchingSlots && onClose()}
                disabled={loading || fetchingSlots}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 text-2xl"
              >
                {getIcon("close")}
              </button>
            </div>

            {/* Content Container (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Context banner */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-xl text-amber-850 dark:text-amber-350 text-sm leading-relaxed font-medium">
                <p>
                  You are rescheduling appointment <span className="font-mono">{appointmentId}</span> currently scheduled for{" "}
                  <span className="font-semibold text-amber-900 dark:text-amber-250">
                    {dayjs(currentSlotStart).format("DD MMM YYYY, hh:mm A")}
                  </span>.
                </p>
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400 font-normal">
                  Rescheduling locks the new slot indefinitely. The patient must explicitly accept the change. If they decline, the appointment will be cancelled, releasing both slots, and the patient receives a full refund.
                </p>
              </div>

              {fetchingSlots ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-500">
                  <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                  <p className="text-sm font-medium">Loading available slots...</p>
                </div>
              ) : datesList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-400">
                  {getIcon("calendar", "48px")}
                  <p className="text-sm font-semibold">No available future slots found in the next 30 days.</p>
                  <p className="text-xs text-center px-6">
                    Please create future slots in your Slot Management settings before requesting a reschedule.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-750 dark:text-gray-300">
                    Select a Proposed New Slot <span className="text-red-500">*</span>
                  </h4>

                  {/* Horizontal Date Picker */}
                  <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-100 dark:border-gray-800 scrollbar-thin">
                    {datesList.map((dateStr) => {
                      const dateObj = dayjs(dateStr);
                      const isSelected = selectedDate === dateStr;
                      return (
                        <button
                          key={dateStr}
                          type="button"
                          onClick={() => {
                            setSelectedDate(dateStr);
                            setSelectedSlotId(null);
                          }}
                          className={`flex flex-col items-center justify-center min-w-[64px] py-2 px-3 rounded-xl border transition-all text-xs font-semibold cursor-pointer ${isSelected
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-105"
                            : "bg-gray-50 dark:bg-gray-850 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-emerald-500 hover:bg-emerald-50/20"
                            }`}
                        >
                          <span className="opacity-75 uppercase text-[10px]">
                            {dateObj.format("ddd")}
                          </span>
                          <span className="text-lg font-bold my-0.5">{dateObj.format("DD")}</span>
                          <span className="opacity-75">{dateObj.format("MMM")}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Slots at Selected Date */}
                  {selectedDate && slots && slots[selectedDate] && (
                    <div className="space-y-4 pt-2">
                      {Object.entries(slots[selectedDate]).map(([locId, locSlots]) => {
                        const locName = locations.find((l) => l._id === locId)?.name || "Online/Consultation";
                        return (
                          <div
                            key={locId}
                            className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/30 dark:bg-gray-850/10 space-y-3"
                          >
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-semibold text-darkGreen">
                              {getIcon("location", "14px")} Location: {locName} (Mode: {mode})
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {locSlots.map((slot) => {
                                const startTime = dayjs(slot.start).format("h:mm A");
                                const isBooked = slot.isBooked || slot.status === "BOOKED";
                                const isSelected = selectedSlotId === slot.id;

                                return (
                                  <button
                                    key={slot.id}
                                    type="button"
                                    disabled={isBooked}
                                    onClick={() => !isBooked && setSelectedSlotId(slot.id)}
                                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${isBooked
                                        ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-default opacity-60"
                                        : isSelected
                                          ? "bg-darkGreen border-darkGreen text-white shadow-md font-semibold"
                                          : "bg-white dark:bg-gray-900 border-gray-300 text-gray-700 hover:border-darkGreen hover:text-darkGreen"
                                      }`}
                                  >
                                    {startTime}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Reschedule Reason */}
              {!fetchingSlots && datesList.length > 0 && (
                <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-755 dark:text-gray-300 flex items-center gap-1.5">
                      Reason for Rescheduling <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => {
                        setReason(e.target.value);
                        setError("");
                      }}
                      disabled={loading}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:border-emerald-500 focus:bg-white text-sm text-gray-700 dark:text-gray-300 transition-all"
                    >
                      <option value="" disabled>-- Select a Reason --</option>
                      {RESCHEDULE_REASONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  {reason === "Other" && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        Description / Custom Reason <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={customReason}
                        onChange={(e) => {
                          setCustomReason(e.target.value);
                          if (error) setError("");
                        }}
                        disabled={loading}
                        maxLength={500}
                        rows={3}
                        className={`w-full p-3 bg-gray-50 dark:bg-gray-850 border rounded-xl outline-none transition-all resize-none text-sm text-gray-700 dark:text-gray-300 ${error && !customReason.trim()
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 dark:border-gray-800 focus:border-emerald-500 focus:bg-white"
                          }`}
                        placeholder="Please describe why you are requesting to reschedule this appointment (mandatory)..."
                      />
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>Min 5 characters recommended.</span>
                        <span>{customReason.length}/500</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-55 border border-red-150 rounded-xl flex items-center gap-2 text-red-600 text-xs font-semibold">
                  {getIcon("exclamation-circle")}
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-850 px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 flex-col sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                disabled={loading || fetchingSlots}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-750 text-gray-600 dark:text-gray-350 font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 w-full sm:w-auto"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleConfirmClick}
                disabled={loading || fetchingSlots || datesList.length === 0}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <span>Send Reschedule Request</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
