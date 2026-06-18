import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "../../../state/store";
import {
  getScheduleRules,
  deleteScheduleRule,
  toggleScheduleRule,
} from "../../../api/doctor/dSlotManagementService";
import toast from "react-hot-toast";
import {
  Trash2,
  Repeat,
  Power,
  Clock,
  MapPin,
  Globe,
  Edit2,
} from "lucide-react";
import dayjs from "dayjs";
import ConfirmationModal from "../../common/ConfirmationModal";
import {
  type ScheduleRule,
  setRules,
  removeRule,
  updateRule,
  setSlots,
} from "../../../state/doctor/dSlotSlice";
import { useDispatch } from "react-redux";
import { RRule } from "rrule";

export default function DScheduleRules({
  onEdit,
}: {
  onEdit?: (ruleId: string) => void;
}) {
  const doctorId = useSelector((state: RootState) => state.userInfo.id);
  const rules = useSelector((state: RootState) => state.dSlot.rules);
  const slots = useSelector((state: RootState) => state.dSlot.slots);
  const practiceLocations = useSelector(
    (state: RootState) => state.dProfileCreation.practiceLocations,
  );
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id: string;
  }>({ open: false, id: "" });

  const getRecurringDays = (rruleString: string) => {
    try {
      let cleanRRule = rruleString;
      const lines = cleanRRule.split("\n");
      const rruleLine = lines.find(l => l.includes("RRULE:") || l.startsWith("FREQ="));
      if (rruleLine) {
        cleanRRule = rruleLine.startsWith("RRULE:") ? rruleLine : `RRULE:${rruleLine}`;
      } else {
        cleanRRule = `RRULE:${cleanRRule}`;
      }

      const parsedRule = RRule.fromString(cleanRRule);
      if (!parsedRule.options.byweekday) return "Every day";
      const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return parsedRule.options.byweekday
        .map((day: any) => {
          const index = typeof day === "number" ? day : day.weekday;
          return dayNames[index];
        })
        .join(", ");
    } catch (e) {
      console.error(e);
      return "Custom";
    }
  };

  useEffect(() => {
    if (rules.length === 0) {
      const fetchRules = async () => {
        try {
          setLoading(true);
          const data = await getScheduleRules(doctorId);
          if (data && data.success) {
            dispatch(setRules(data.rules));
          }
        } catch (error: any) {
          toast.error(error.message || "Failed to fetch rules");
        } finally {
          setLoading(false);
        }
      };
      fetchRules();
    }
  }, [doctorId, rules.length, dispatch]);

  const handleDelete = async (id: string) => {
    try {
      const data = await deleteScheduleRule(id);
      if (data && data.success) {
        toast.success("Schedule rule deleted");
        dispatch(removeRule(id));
        dispatch(setSlots(slots.filter((s) => s.scheduleRuleId !== id)));
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setConfirmDelete({ open: false, id: "" });
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const data = await toggleScheduleRule(id);
      if (data && data.success) {
        toast.success(data.rule.isActive ? "Rule enabled" : "Rule disabled");
        dispatch(updateRule(data.rule));
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-1 h-full overflow-hidden flex flex-col">
      <ConfirmationModal
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: "" })}
        onConfirm={() => handleDelete(confirmDelete.id)}
        title="Delete Schedule Series"
        message="Are you sure you want to delete this schedule series? All future virtual slots from this rule will be removed."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Recurring Schedules
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your rule-based availability patterns.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-darkGreen"></div>
          </div>
        ) : rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Repeat size={48} className="mb-4 opacity-20" />
            <p>No recurring schedules configured yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`p-5 rounded-2xl border transition-all ${rule.isActive ? "bg-white border-gray-200 shadow-sm" : "bg-gray-50 border-gray-100 opacity-60"}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${rule.isActive ? "bg-green-50 text-green-600" : "bg-gray-200 text-gray-500"}`}
                    >
                      <Repeat size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">
                        {rule.title}
                      </h4>
                      <div className="flex flex-col">
                        <p className="text-xs font-bold text-darkGreen uppercase tracking-wider">
                          Repeats on: {getRecurringDays(rule.rruleString)}
                        </p>
                        <p className="text-[13px] text-gray-500 flex items-center gap-1 mt-0.5">
                          Active: {dayjs(rule.validFrom).format("MMM D, YYYY")}{" "}
                          {rule.validTo
                            ? `→ ${dayjs(rule.validTo).format("MMM D, YYYY")}`
                            : "(Continuous)"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(rule.id)}
                      className={`p-2 rounded-lg transition-all ${rule.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-200"}`}
                      title={rule.isActive ? "Disable Rule" : "Enable Rule"}
                    >
                      <Power size={20} />
                    </button>
                    <button
                      onClick={() => onEdit?.(rule.id)}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit Series"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() =>
                        setConfirmDelete({ open: true, id: rule.id })
                      }
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete Series"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} className="text-gray-400" />
                    <span>
                      {rule.startHour} - {rule.endHour}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Repeat size={16} className="text-gray-400" />
                    <span>
                      {rule.duration}m (+{rule.buffer}m buffer)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="truncate">
                      Location: {practiceLocations.find(loc => loc._id === rule.practiceLocationId)?.name || rule.practiceLocationId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe size={16} className="text-gray-400" />
                    <span className="capitalize">{rule.mode}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
