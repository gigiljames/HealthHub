import { 
  editSlot as editSlotApi,
  createSlot as createSlotApi 
} from "../../../api/doctor/dSlotManagementService";
import { useEffect, useState } from "react";
import { editSlot, type Slot } from "../../../state/doctor/dSlotSlice";
import { useDoctorSlotManagementStore } from "../../../zustand/doctoreStore";
import { useDispatch, useSelector } from "react-redux";
import {
  buildDateFromDateAndTime,
  formatTimeForInputFromDate,
} from "../../../utils/DateTimeUtil";
import toast from "react-hot-toast";
import { getPracticeLocations } from "../../../api/doctor/dProfileCreationService";
import type { RootState } from "../../../state/store";
import { setPracticeLocations } from "../../../state/doctor/dProfileCreationSlice";
import dayjs from "dayjs";
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Globe, 
  Save 
} from "lucide-react";

interface DEditSlotModalProps {
  slot: Slot | null;
  onSuccess?: (updatedSlot: Slot) => void;
}

function DEditSlotModal({ slot, onSuccess }: DEditSlotModalProps) {
  const toggleEditSlotModal = useDoctorSlotManagementStore(
    (state) => state.toggleEditSlotModal,
  );
  const practiceLocations = useSelector(
    (state: RootState) => state.dProfileCreation.practiceLocations,
  );
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [mode, setMode] = useState<"online" | "in-person">("online");
  const [modalDate, setModalDate] = useState("");
  const [practiceLocationId, setPracticeLocationId] = useState("");
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    start?: string;
    end?: string;
    date?: string;
    practiceLocation?: string;
  }>({});

  useEffect(() => {
    if (practiceLocations.length === 0) {
      setLoadingLocations(true);
      getPracticeLocations()
        .then((response) => {
          if (response?.success) {
            dispatch(setPracticeLocations(response.data || []));
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load practice locations.");
        })
        .finally(() => setLoadingLocations(false));
    }
    if (slot) {
      const startDate = new Date(slot.start);
      const endDate = new Date(slot.end);
      setTitle(slot.title);
      setModalDate(dayjs(startDate).format("YYYY-MM-DD"));
      setStart(formatTimeForInputFromDate(startDate));
      setEnd(formatTimeForInputFromDate(endDate));
      setMode(slot.mode as "online" | "in-person");
      if (slot.practiceLocationId) {
        setPracticeLocationId(slot.practiceLocationId);
      }
    }
  }, [slot]);

  const validateInputs = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    }

    if (!modalDate) {
      newErrors.date = "Date is required";
      isValid = false;
    }

    if (!start) {
      newErrors.start = "Start time is required";
      isValid = false;
    }

    if (!end) {
      newErrors.end = "End time is required";
      isValid = false;
    }

    if (start && end) {
      const startDate = buildDateFromDateAndTime(modalDate, start);
      const endDate = buildDateFromDateAndTime(modalDate, end);
      if (startDate >= endDate) {
        newErrors.end = "End time must be after start time";
        isValid = false;
      }
    }

    if (modalDate && start) {
      const combinedStart = buildDateFromDateAndTime(modalDate, start);
      if (combinedStart < new Date()) {
        newErrors.start = "Slot start time cannot be in the past";
        isValid = false;
      }
    }

    if (!practiceLocationId) {
      newErrors.practiceLocation = "Practice location is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const getSupportedModesForLocation = (locationId: string) => {
    const loc = practiceLocations.find((l) => l._id === locationId);
    if (!loc) return { showSelect: true, defaultMode: "online" as const };
    
    const hasOnline = loc.consultationModes?.some((m: string) => 
      m === "VIDEO" || m === "AUDIO" || m === "CHAT"
    );
    const hasInPerson = loc.consultationModes?.includes("IN_PERSON");
    
    if (hasOnline && !hasInPerson) {
      return { showSelect: false, defaultMode: "online" as const };
    }
    if (!hasOnline && hasInPerson) {
      return { showSelect: false, defaultMode: "in-person" as const };
    }
    return { showSelect: true, defaultMode: "online" as const };
  };

  useEffect(() => {
    if (practiceLocationId) {
      const { showSelect, defaultMode } = getSupportedModesForLocation(practiceLocationId);
      if (!showSelect) {
        setMode(defaultMode);
      }
    }
  }, [practiceLocationId, practiceLocations]);

  async function handleSaveChanges() {
    if (!validateInputs() || !slot) {
      return;
    }

    const slotPayload: Omit<Slot, "id"> & { id?: string } = {
      title: title,
      mode: mode as "online" | "in-person",
      start: buildDateFromDateAndTime(modalDate, start).toISOString(),
      end: buildDateFromDateAndTime(modalDate, end).toISOString(),
      isBooked: slot?.isBooked,
      practiceLocationId: practiceLocationId,
      scheduleRuleId: slot?.scheduleRuleId,
    };

    try {
      setSaving(true);
      let response;
      if (slot.isVirtual) {
        response = await createSlotApi(slotPayload);
      } else {
        slotPayload.id = slot.id;
        response = await editSlotApi(slotPayload as Slot);
      }

      if (response?.success) {
        toast.success("Slot updated successfully");
        if (onSuccess) {
          onSuccess(response.slot);
        } else {
          dispatch(editSlot(response.slot));
          toggleEditSlotModal();
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setSaving(false);
    }
  }

  if (!slot) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center px-4">
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Edit Slot
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Modify the details of this availability slot.
            </p>
          </div>
          <button
            onClick={() => toggleEditSlotModal()}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all text-gray-400"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {slot.isBooked && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl text-amber-700 dark:text-amber-400 text-sm font-medium">
              This slot is already booked and cannot be modified.
            </div>
          )}

          {/* Date Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={modalDate}
                disabled={slot.isBooked}
                onChange={(e) => setModalDate(e.target.value)}
                className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${errors.date ? "border-red-500" : "border-gray-200 dark:border-gray-700"} rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen outline-none transition-all pl-10 disabled:opacity-50`}
              />
              <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
            </div>
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>

          {/* Slot Title */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Slot Title
            </label>
            <input
              type="text"
              value={title}
              disabled={slot.isBooked}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${errors.title ? "border-red-500" : "border-gray-200 dark:border-gray-700"} rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen outline-none transition-all disabled:opacity-50`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Time Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Clock size={16} /> Start Time
              </label>
              <input
                type="time"
                value={start}
                disabled={slot.isBooked}
                onChange={(e) => setStart(e.target.value)}
                className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${errors.start ? "border-red-500" : "border-gray-200 dark:border-gray-700"} rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen outline-none transition-all disabled:opacity-50`}
              />
              {errors.start && <p className="text-red-500 text-xs mt-1">{errors.start}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Clock size={16} /> End Time
              </label>
              <input
                type="time"
                value={end}
                disabled={slot.isBooked}
                onChange={(e) => setEnd(e.target.value)}
                className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${errors.end ? "border-red-500" : "border-gray-200 dark:border-gray-700"} rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen outline-none transition-all disabled:opacity-50`}
              />
              {errors.end && <p className="text-red-500 text-xs mt-1">{errors.end}</p>}
            </div>
          </div>

          {/* Practice Details */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <MapPin size={16} /> Practice Location
            </label>
            <select
              value={practiceLocationId}
              disabled={slot.isBooked}
              onChange={(e) => setPracticeLocationId(e.target.value)}
              className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${errors.practiceLocation ? "border-red-500" : "border-gray-200 dark:border-gray-700"} rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen outline-none transition-all disabled:opacity-50`}
            >
              <option value="">Select location</option>
              {practiceLocations.map((loc) => (
                <option key={loc._id} value={loc._id}>
                  {loc.name} ({loc.type})
                </option>
              ))}
            </select>
            {errors.practiceLocation && <p className="text-red-500 text-xs mt-1">{errors.practiceLocation}</p>}
          </div>

          {getSupportedModesForLocation(practiceLocationId).showSelect ? (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Globe size={16} /> Consultation Mode
              </label>
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 h-[50px]">
                <button
                  type="button"
                  disabled={slot.isBooked}
                  onClick={() => setMode("online")}
                  className={`flex-1 rounded-lg text-sm font-bold transition-all ${mode === "online" ? "bg-white dark:bg-gray-700 text-darkGreen dark:text-lightGreen shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"} disabled:opacity-50`}
                >
                  Online
                </button>
                <button
                  type="button"
                  disabled={slot.isBooked}
                  onClick={() => setMode("in-person")}
                  className={`flex-1 rounded-lg text-sm font-bold transition-all ${mode === "in-person" ? "bg-white dark:bg-gray-700 text-darkGreen dark:text-lightGreen shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"} disabled:opacity-50`}
                >
                  In-Person
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Globe size={16} className="text-gray-400" /> Consultation Mode
              </span>
              <span className="text-sm font-bold text-darkGreen dark:text-lightGreen capitalize bg-lightGreen/10 dark:bg-lightGreen/5 px-3 py-1 rounded-lg">
                {mode === "online" ? "Online" : "In-Person"}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-800/30">
          <button
            onClick={() => toggleEditSlotModal()}
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          {!slot.isBooked && (
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="px-8 py-2.5 bg-darkGreen dark:bg-lightGreen/80 hover:bg-opacity-90 transition-all text-white rounded-lg font-bold shadow-lg active:scale-[0.98] flex items-center gap-2 flex-1 md:flex-none justify-center"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Save size={18} />
              )}
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DEditSlotModal;
