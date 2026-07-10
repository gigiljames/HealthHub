import { useDispatch, useSelector } from "react-redux";
import { addSlots } from "../../../state/doctor/dSlotSlice";
import { useEffect, useState } from "react";
import { X, Calendar, Clock, MapPin, Globe, Plus } from "lucide-react";
import { useDoctorSlotManagementStore } from "../../../zustand/doctoreStore";
import toast from "react-hot-toast";
import {
  createSlot as createSlotApi,
} from "../../../api/doctor/dSlotManagementService";
import {
  buildDateFromDateAndTime,
  getMaxAllowedDate,
  MAX_DAYS_AHEAD,
} from "../../../utils/DateTimeUtil";
import { getPracticeLocations } from "../../../api/doctor/dProfileCreationService";
import type { RootState } from "../../../state/store";
import { setPracticeLocations } from "../../../state/doctor/dProfileCreationSlice";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

interface DCreateSlotModalProps {
  date: string;
}

function DCreateSlotModal({ date }: DCreateSlotModalProps) {
  const toggleCreateSlotModal = useDoctorSlotManagementStore(
    (state) => state.toggleCreateSlotModal,
  );
  const practiceLocations = useSelector(
    (state: RootState) => state.dProfileCreation.practiceLocations,
  );
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null);
  const [endTime, setEndTime] = useState<dayjs.Dayjs | null>(null);

  const start = startTime && startTime.isValid() ? startTime.format("HH:mm") : "";
  const end = endTime && endTime.isValid() ? endTime.format("HH:mm") : "";
  const [mode, setMode] = useState<"online" | "in-person">("online");
  const [modalDate, setModalDate] = useState<dayjs.Dayjs | null>(date ? dayjs(date) : null);
  const modalDateStr = modalDate && modalDate.isValid() ? modalDate.format("YYYY-MM-DD") : "";
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
            if (response.data && response.data.length > 0) {
              setPracticeLocationId(response.data[0]._id);
            }
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load practice locations.");
        })
        .finally(() => setLoadingLocations(false));
    } else if (practiceLocations.length > 0 && !practiceLocationId) {
      setPracticeLocationId(practiceLocations[0]._id);
    }
  }, []);

  const validateInputs = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    }

    if (!modalDateStr) {
      newErrors.date = "Date is required";
      isValid = false;
    } else {
      const selectedDate = new Date(modalDateStr);
      const maxAllowedDate = getMaxAllowedDate();
      if (selectedDate > maxAllowedDate) {
        newErrors.date = `Date cannot be more than ${MAX_DAYS_AHEAD} days ahead`;
        isValid = false;
      }
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
      const [startH, startM] = start.split(":").map(Number);
      const [endH, endM] = end.split(":").map(Number);
      if (endH * 60 + endM <= startH * 60 + startM) {
        newErrors.end = "End time must be after start time";
        isValid = false;
      }
    }

    if (modalDateStr && start) {
      const combinedStart = buildDateFromDateAndTime(modalDateStr, start);
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

  async function handleCreateSlot() {
    if (!validateInputs()) {
      return;
    }

    const slotData = {
      title: title,
      mode: mode as "online" | "in-person",
      start: buildDateFromDateAndTime(modalDateStr, start).toISOString(),
      end: buildDateFromDateAndTime(modalDateStr, end).toISOString(),
      isBooked: false,
      practiceLocationId: practiceLocationId,
    };

    try {
      setSaving(true);
      const data = await createSlotApi(slotData);
      if (data.success) {
        dispatch(addSlots([data.slot]));
        toggleCreateSlotModal();
        toast.success("One-off slot created successfully");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div 
      className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex justify-center items-center px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          toggleCreateSlotModal();
        }
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div 
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-800"
        >
        {/* Header */}
        <div className="px-6 sm:px-8 py-4 sm:py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Create Single Slot
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Add a one-off availability slot to your calendar.
            </p>
          </div>
          <button
            onClick={() => toggleCreateSlotModal()}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all text-gray-400 cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>
 
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Date Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Date
            </label>
            <DatePicker
              value={modalDate}
              disablePast
              onChange={(newValue) => setModalDate(newValue)}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  error: !!errors.date,
                  sx: {
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "0.5rem",
                      backgroundColor: "#f9fafb",
                      color: "#111827",
                      "& fieldset": {
                        borderColor: errors.date ? "#ef4444" : "#e5e7eb",
                      },
                      ".dark &": {
                        backgroundColor: "#1f2937",
                        color: "#ffffff",
                      },
                      ".dark & fieldset": {
                        borderColor: errors.date ? "#ef4444" : "#374151",
                      },
                      "&:hover fieldset": {
                        borderColor: "#006837",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#006837",
                      },
                    },
                    "& .MuiInputBase-input": {
                      padding: "10px 14px",
                    },
                  },
                },
              }}
            />
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
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Emergency Check-up"
              className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${errors.title ? "border-red-500" : "border-gray-200 dark:border-gray-700"} rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen outline-none transition-all`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
 
          {/* Time Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Clock size={16} /> Start Time
              </label>
              <TimePicker
                value={startTime}
                onChange={(newValue) => setStartTime(newValue)}
                ampm={true}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: !!errors.start,
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "0.5rem",
                        backgroundColor: "#f9fafb",
                        color: "#111827",
                        "& fieldset": {
                          borderColor: errors.start ? "#ef4444" : "#e5e7eb",
                        },
                        ".dark &": {
                          backgroundColor: "#1f2937",
                          color: "#ffffff",
                        },
                        ".dark & fieldset": {
                          borderColor: errors.start ? "#ef4444" : "#374151",
                        },
                        "&:hover fieldset": {
                          borderColor: "#006837",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#006837",
                        },
                      },
                      "& .MuiInputBase-input": {
                        padding: "10px 14px",
                      },
                    },
                  },
                }}
              />
              {errors.start && <p className="text-red-500 text-xs mt-1">{errors.start}</p>}
            </div>
 
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Clock size={16} /> End Time
              </label>
              <TimePicker
                value={endTime}
                onChange={(newValue) => setEndTime(newValue)}
                ampm={true}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: !!errors.end,
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "0.5rem",
                        backgroundColor: "#f9fafb",
                        color: "#111827",
                        "& fieldset": {
                          borderColor: errors.end ? "#ef4444" : "#e5e7eb",
                        },
                        ".dark &": {
                          backgroundColor: "#1f2937",
                          color: "#ffffff",
                        },
                        ".dark & fieldset": {
                          borderColor: errors.end ? "#ef4444" : "#374151",
                        },
                        "&:hover fieldset": {
                          borderColor: "#006837",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#006837",
                        },
                      },
                      "& .MuiInputBase-input": {
                        padding: "10px 14px",
                      },
                    },
                  },
                }}
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
              onChange={(e) => setPracticeLocationId(e.target.value)}
              className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border ${errors.practiceLocation ? "border-red-500" : "border-gray-200 dark:border-gray-700"} rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen outline-none transition-all`}
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
                  onClick={() => setMode("online")}
                  className={`flex-1 rounded-lg text-sm font-bold transition-all ${mode === "online" ? "bg-white dark:bg-gray-700 text-darkGreen dark:text-lightGreen shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                >
                  Online
                </button>
                <button
                  type="button"
                  onClick={() => setMode("in-person")}
                  className={`flex-1 rounded-lg text-sm font-bold transition-all ${mode === "in-person" ? "bg-white dark:bg-gray-700 text-darkGreen dark:text-lightGreen shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
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
        <div className="px-6 sm:px-8 py-4 sm:py-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-800/30">
          <button
            onClick={() => toggleCreateSlotModal()}
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-[0.98] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateSlot}
            disabled={saving || loadingLocations}
            className="px-8 py-2.5 bg-darkGreen dark:bg-lightGreen/80 hover:bg-opacity-90 transition-all text-white rounded-lg font-bold shadow-lg active:scale-[0.98] flex items-center gap-2 flex-1 md:flex-none justify-center cursor-pointer"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Plus size={18} />
            )}
            Create Slot
          </button>
        </div>
      </div>
    </LocalizationProvider>
  </div>
);
}

export default DCreateSlotModal;
