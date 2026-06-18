import { useState, useEffect } from "react";
import { RRule } from "rrule";
import dayjs from "dayjs";
import { editScheduleRule as editScheduleRuleApi } from "../../../api/doctor/dSlotManagementService";
import { useDoctorSlotManagementStore } from "../../../zustand/doctoreStore";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../state/store";
import toast from "react-hot-toast";
import { Repeat, Clock, MapPin, Globe, Save, X, Calendar } from "lucide-react";
import { getPracticeLocations } from "../../../api/doctor/dProfileCreationService";
import { setPracticeLocations } from "../../../state/doctor/dProfileCreationSlice";
import { type ScheduleRule } from "../../../state/doctor/dSlotSlice";

interface DEditScheduleRuleModalProps {
  ruleId: string;
  onSuccess?: (updatedRule: ScheduleRule) => void;
}

export default function DEditScheduleRuleModal({
  ruleId,
  onSuccess,
}: DEditScheduleRuleModalProps) {
  const toggleEditRuleModal = useDoctorSlotManagementStore(
    (state) => state.toggleEditRuleModal,
  );
  const rules = useSelector((state: RootState) => state.dSlot.rules);
  const practiceLocations = useSelector(
    (state: RootState) => state.dProfileCreation.practiceLocations,
  );
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    validFrom?: string;
    start?: string;
    end?: string;
    practiceLocation?: string;
    selectedDays?: string;
  }>({});

  // Rule fields
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [duration, setDuration] = useState("30");
  const [buffer, setBuffer] = useState("0");
  const [mode, setMode] = useState<"online" | "in-person">("online");
  const [practiceLocationId, setPracticeLocationId] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const days = [
    { label: "M", value: RRule.MO.weekday },
    { label: "T", value: RRule.TU.weekday },
    { label: "W", value: RRule.WE.weekday },
    { label: "T", value: RRule.TH.weekday },
    { label: "F", value: RRule.FR.weekday },
    { label: "S", value: RRule.SA.weekday },
    { label: "S", value: RRule.SU.weekday },
  ];

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
    setLoading(true);
    if (practiceLocations.length === 0) {
      getPracticeLocations()
        .then((locRes) => {
          if (locRes?.success) dispatch(setPracticeLocations(locRes.data));
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load practice locations");
        });
    }

    const ruleData = rules.find((r: ScheduleRule) => r.id === ruleId);
    if (ruleData) {
      setTitle(ruleData.title);
      setStart(ruleData.startHour);
      setEnd(ruleData.endHour);
      setDuration(ruleData.duration.toString());
      setBuffer(ruleData.buffer.toString());
      setMode(ruleData.mode);
      setPracticeLocationId(ruleData.practiceLocationId);
      setValidFrom(dayjs(ruleData.validFrom).format("YYYY-MM-DD"));
      setValidTo(
        ruleData.validTo ? dayjs(ruleData.validTo).format("YYYY-MM-DD") : "",
      );

      try {
        let cleanRRule = ruleData.rruleString;
        const lines = cleanRRule.split("\n");
        const rruleLine = lines.find(l => l.includes("RRULE:") || l.startsWith("FREQ="));
        if (rruleLine) {
          cleanRRule = rruleLine.startsWith("RRULE:") ? rruleLine : `RRULE:${rruleLine}`;
        } else {
          cleanRRule = `RRULE:${cleanRRule}`;
        }
        const parsedRule = RRule.fromString(cleanRRule);
        if (parsedRule.options.byweekday) {
          const numericDays = parsedRule.options.byweekday.map((day: any) =>
            typeof day === "number" ? day : day.weekday,
          );
          setSelectedDays(numericDays);
        }
      } catch (e) {
        console.error("Failed to parse RRULE string", e);
      }
    } else {
      toast.error("Rule data not found in local store");
      toggleEditRuleModal();
    }
    setLoading(false);
  }, [ruleId, rules, practiceLocations.length, dispatch]);

  useEffect(() => {
    if (practiceLocationId) {
      const { showSelect, defaultMode } = getSupportedModesForLocation(practiceLocationId);
      if (!showSelect) {
        setMode(defaultMode);
      }
    }
  }, [practiceLocationId, practiceLocations]);

  const toggleDay = (dayValue: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayValue)
        ? prev.filter((d) => d !== dayValue)
        : [...prev, dayValue],
    );
  };

  const validateInputs = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = "Schedule label is required";
      isValid = false;
    }

    if (!validFrom) {
      newErrors.validFrom = "Effective From date is required";
      isValid = false;
    }

    if (!start) {
      newErrors.start = "Start hour is required";
      isValid = false;
    }

    if (!end) {
      newErrors.end = "End hour is required";
      isValid = false;
    }

    if (start && end) {
      const [startH, startM] = start.split(":").map(Number);
      const [endH, endM] = end.split(":").map(Number);
      if (endH * 60 + endM <= startH * 60 + startM) {
        newErrors.end = "End hour must be after start hour";
        isValid = false;
      }
    }

    if (!practiceLocationId) {
      newErrors.practiceLocation = "Practice location is required";
      isValid = false;
    }

    if (selectedDays.length === 0) {
      newErrors.selectedDays = "Select at least one repeat day";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleUpdate = async () => {
    if (!validateInputs()) {
      return;
    }

    try {
      setSaving(true);
      const rule = new RRule({
        freq: RRule.WEEKLY,
        byweekday: selectedDays,
        dtstart: new Date(validFrom),
      });

      const rruleFull = rule.toString();
      const rruleLine = rruleFull.split("\n").find(line => line.startsWith("RRULE:"));
      const rruleString = rruleLine ? rruleLine.replace("RRULE:", "") : rruleFull;

      const payload = {
        id: ruleId,
        title,
        practiceLocationId,
        mode,
        duration: parseInt(duration),
        buffer: parseInt(buffer),
        rruleString,
        validFrom: new Date(validFrom).toISOString(),
        validTo: validTo ? new Date(validTo).toISOString() : null,
        startHour: start,
        endHour: end,
      };

      const res = await editScheduleRuleApi(ruleId, payload);
      if (res?.success) {
        toast.success("Schedule updated successfully");
        if (onSuccess) onSuccess(res.rule);
        toggleEditRuleModal();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update schedule");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex justify-center items-center px-4">
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Repeat className="text-darkGreen" size={24} /> Edit Recurring
              Schedule
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Update your recurring availability pattern.
            </p>
          </div>
          <button
            onClick={() => toggleEditRuleModal()}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all text-gray-400"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="col-span-full space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Schedule Label
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Morning Sessions"
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen outline-none transition-all shadow-sm"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Effective From
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen outline-none transition-all pl-10 shadow-sm"
                />
                <Calendar
                  className="absolute left-3 top-3.5 text-gray-400"
                  size={18}
                />
              </div>
              {errors.validFrom && <p className="text-red-500 text-xs mt-1">{errors.validFrom}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Valid Until (Optional)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={validTo}
                  min={validFrom}
                  onChange={(e) => setValidTo(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen outline-none transition-all pl-10 shadow-sm"
                />
                <Calendar
                  className="absolute left-3 top-3.5 text-gray-400"
                  size={18}
                />
              </div>
            </div>

            <div className="col-span-full space-y-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Repeat on
              </label>
              <div className="flex gap-3">
                {days.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    className={`w-11 h-11 rounded-xl font-bold transition-all flex items-center justify-center ${
                      selectedDays.includes(day.value)
                        ? "bg-darkGreen text-white shadow-lg shadow-darkGreen/20 scale-105"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent dark:border-gray-700"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              {errors.selectedDays && <p className="text-red-500 text-xs mt-1">{errors.selectedDays}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Clock size={16} /> Start Hour
              </label>
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen outline-none transition-all shadow-sm font-medium"
              />
              {errors.start && <p className="text-red-500 text-xs mt-1">{errors.start}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Clock size={16} /> End Hour
              </label>
              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen outline-none transition-all shadow-sm font-medium"
              />
              {errors.end && <p className="text-red-500 text-xs mt-1">{errors.end}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Slot Duration (mins)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen outline-none transition-all shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Gap Between Slots (mins)
              </label>
              <input
                type="number"
                value={buffer}
                onChange={(e) => setBuffer(e.target.value)}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen outline-none transition-all shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <MapPin size={16} /> Practice Location
              </label>
              <select
                value={practiceLocationId}
                onChange={(e) => setPracticeLocationId(e.target.value)}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen outline-none transition-all shadow-sm font-medium"
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
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl border border-gray-200 dark:border-gray-700 h-[56px]">
                  <button
                    type="button"
                    onClick={() => setMode("online")}
                    className={`flex-1 rounded-xl text-sm font-bold transition-all ${mode === "online" ? "bg-white dark:bg-gray-700 text-darkGreen dark:text-lightGreen shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
                  >
                    Online
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("in-person")}
                    className={`flex-1 rounded-xl text-sm font-bold transition-all ${mode === "in-person" ? "bg-white dark:bg-gray-700 text-darkGreen dark:text-lightGreen shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
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
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4 bg-gray-50/50 dark:bg-gray-800/30">
          <button
            onClick={() => toggleEditRuleModal()}
            className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="px-10 py-3 bg-darkGreen dark:bg-lightGreen/80 hover:bg-opacity-90 transition-all text-white rounded-xl font-bold shadow-lg active:scale-[0.98] flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Save size={18} />
            )}
            Update Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
