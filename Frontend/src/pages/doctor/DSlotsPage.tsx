import { Calendar, dayjsLocalizer, type View } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import { useDoctorSlotManagementStore } from "../../zustand/doctoreStore";
import DCreateSlotModal from "../../components/doctor/slots/DCreateSlotModal";
import {
  getSlots as getSlotsApi,
  getScheduleRules as getRulesApi,
  getDoctorExceptions,
} from "../../api/doctor/dSlotManagementService";
import { type Slot, setSlots, setRules, updateRule, removeRule, type ScheduleRule } from "../../state/doctor/dSlotSlice";
import toast from "react-hot-toast";
import DEditSlotModal from "../../components/doctor/slots/DEditSlotModal";
import { Link } from "react-router";
import { getPracticeLocations } from "../../api/doctor/dProfileCreationService";
import { setPracticeLocations } from "../../state/doctor/dProfileCreationSlice";
import DViewSlot from "../../components/doctor/slots/DViewSlot";
import DScheduleRules from "../../components/doctor/slots/DScheduleRules";
import DDoctorExceptions from "../../components/doctor/slots/DDoctorExceptions";
import DEditScheduleRuleModal from "../../components/doctor/slots/DEditScheduleRuleModal";
import {
  Calendar as CalendarIcon,
  Repeat,
  Info,
  ShieldAlert,
  Plus,
} from "lucide-react";
import DCreateScheduleRuleModal from "../../components/doctor/slots/DCreateScheduleRuleModal";

interface CalendarSlot {
  id: string;
  title: string;
  start: Date;
  end: Date;
  mode?: "online" | "in-person" | "";
  practiceLocationId?: string;
  isBooked?: boolean;
  isVirtual?: boolean;
  scheduleRuleId?: string;
  status?: "AVAILABLE" | "BLOCKED" | "BOOKED" | "LOCKED" | "CANCELLED";
  isHoliday?: boolean;
  reason?: string;
}

type TabType = "calendar" | "rules" | "holidays";

function DSlotsPage() {
  const localizer = dayjsLocalizer(dayjs);
  const createSlotModal = useDoctorSlotManagementStore(
    (state) => state.createSlotModal,
  );
  const toggleCreateSlotModal = useDoctorSlotManagementStore(
    (state) => state.toggleCreateSlotModal,
  );
  const editSlotModal = useDoctorSlotManagementStore(
    (state) => state.editSlotModal,
  );
  const toggleEditSlotModal = useDoctorSlotManagementStore(
    (state) => state.toggleEditSlotModal,
  );
  const editRuleModal = useDoctorSlotManagementStore(
    (state) => state.editRuleModal,
  );
  const createRuleModal = useDoctorSlotManagementStore(
    (state) => state.createRuleModal,
  );
  const toggleEditRuleModal = useDoctorSlotManagementStore(
    (state) => state.toggleEditRuleModal,
  );
  const toggleCreateRuleModal = useDoctorSlotManagementStore(
    (state) => state.toggleCreateRuleModal,
  );
  const doctorId = useSelector((state: RootState) => state.userInfo.id);
  const setRecurr = useDoctorSlotManagementStore((state) => state.setRecurr);
  const dispatch = useDispatch();
  const { isNewUser, onboardingStep } = useSelector(
    (state: RootState) => state.userInfo,
  );

  const slots = useSelector((state: RootState) => state.dSlot.slots);
  const rules = useSelector((state: RootState) => state.dSlot.rules);
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState<Date>(new Date());
  const [modalDate, setModalDate] = useState("");
  const [viewSlot, setViewSlot] = useState<Slot | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("calendar");
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [exceptions, setExceptions] = useState<any[]>([]);

  const minDate = new Date();
  const maxDate = new Date();
  minDate.setMonth(minDate.getMonth() - 1);
  maxDate.setMonth(maxDate.getMonth() + 1);

  const fetchSlots = async (currentDate: Date) => {
    try {
      const start = dayjs(currentDate)
        .startOf("month")
        .subtract(1, "month")
        .toISOString();
      const end = dayjs(currentDate)
        .endOf("month")
        .add(1, "month")
        .toISOString();

      const response = await getSlotsApi(doctorId, start, end);
      const slots = response.slots;
      if (slots) {
        dispatch(setSlots(slots));
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const fetchRules = async () => {
    try {
      const response = await getRulesApi(doctorId);
      if (response && response.success) {
        dispatch(setRules(response.rules));
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const fetchExceptions = async () => {
    try {
      const response = await getDoctorExceptions(doctorId);
      if (response && response.success) {
        setExceptions(response.exceptions);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to fetch holidays");
      }
    }
  };

  useEffect(() => {
    async function fetchPracticeLocations() {
      try {
        const response = await getPracticeLocations();
        const practiceLocations = response.data;
        if (practiceLocations) {
          dispatch(setPracticeLocations(practiceLocations));
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    }
    fetchSlots(date);
    fetchExceptions();
    fetchPracticeLocations();
    fetchRules();
  }, [doctorId]);

  useEffect(() => {
    if (activeTab === "calendar") {
      fetchSlots(date);
      fetchExceptions();
    }
  }, [date, activeTab]);

  const handleSlotUpdate = (updatedSlot: Slot) => {
    dispatch(setSlots(slots.map(s => s.id === updatedSlot.id ? updatedSlot : s)));
    if (!slots.find(s => s.id === updatedSlot.id)) {
      dispatch(setSlots([...slots, updatedSlot]));
    }
    setViewSlot(updatedSlot);
    if (editSlotModal) toggleEditSlotModal();
  };

  const handleSlotDelete = (slotId: string, seriesId?: string) => {
    if (seriesId) {
      dispatch(setSlots(slots.filter(s => s.scheduleRuleId !== seriesId || s.isBooked)));
      dispatch(removeRule(seriesId));
      setViewSlot(null);
    } else {
      dispatch(setSlots(slots.filter(s => s.id !== slotId)));
      setViewSlot(null);
    }
  };

  const handleRuleUpdate = (updatedRule: ScheduleRule) => {
    dispatch(updateRule(updatedRule));
    fetchSlots(date);
  };

  const handleRuleCreate = (newRule: ScheduleRule) => {
    dispatch(setRules([...rules, newRule]));
    fetchSlots(date);
  };

  const dayPropGetter = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return {
        className: "bg-gray-100/50 opacity-60 cursor-not-allowed",
        style: {
          backgroundColor: "rgba(243, 244, 246, 0.6)",
          opacity: 0.65,
        },
      };
    }
    return {};
  };

  const eventStyleGetter = (event: CalendarSlot) => {
    let className =
      "rounded-md px-2 py-1 text-xs font-medium text-white shadow-sm border-none transition-all hover:scale-[1.02]";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = event.start < today;

    if (event.isHoliday) {
      className += " !bg-red-500 text-white font-bold";
    } else if (event.isBooked) {
      className += " !bg-green-600";
    } else if (event.status === "BLOCKED") {
      className += " !bg-red-300 !text-white font-medium";
    } else if (event.isVirtual) {
      className += " !bg-darkGreen/70 border-1 border-dashed border-white/20";
    } else {
      className += " !bg-gray-500";
    }

    if (isPast) {
      className += " !opacity-40 !saturate-50";
    }

    return { className };
  };

  return (
    <div className="flex justify-center w-full bg-gray-50/50 h-[calc(100vh-96px)] lg:h-[calc(100vh-80px)] overflow-hidden">
      {createSlotModal && <DCreateSlotModal date={modalDate} />}
      {createRuleModal && (
        <DCreateScheduleRuleModal
          date={modalDate}
          onSuccess={handleRuleCreate}
        />
      )}
      {editSlotModal && (
        <DEditSlotModal
          slot={viewSlot}
          onSuccess={handleSlotUpdate}
        />
      )}
      {editRuleModal && selectedRuleId && (
        <DEditScheduleRuleModal
          ruleId={selectedRuleId}
          onSuccess={handleRuleUpdate}
        />
      )}

      <div className="w-[95%] lg:w-[90%] max-w-[1600px] flex flex-col gap-6 h-full min-h-0">
        <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Slot Management
            </h1>
            <p className="text-gray-500 mt-1">
              Configure your availability patterns and manage appointments.
            </p>
          </div>

          <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm self-start">
            <button
              onClick={() => setActiveTab("calendar")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === "calendar" ? "bg-darkGreen text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <CalendarIcon size={16} /> Calendar
            </button>
            <button
              onClick={() => setActiveTab("rules")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === "rules" ? "bg-darkGreen text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <Repeat size={16} /> Schedules
            </button>
            <button
              onClick={() => setActiveTab("holidays")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === "holidays" ? "bg-darkGreen text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <ShieldAlert size={16} /> Holidays
            </button>
          </div>
        </div>

        {isNewUser && (
          <div className="flex-shrink-0 w-full bg-white border border-gray-200 p-6 rounded-3xl flex gap-6 items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Info size={24} />
              </div>
              <div>
                <p className="font-bold text-xl text-gray-800">
                  {onboardingStep === 0
                    ? "Profile set-up required"
                    : `Onboarding focus: ${Math.floor((onboardingStep / 6) * 100)}% complete`}
                </p>
                <p className="text-sm text-gray-500 max-w-[700px]">
                  Your consultation slots depend on your profile, locations, and
                  modes. Complete onboarding to start managing availability.
                </p>
              </div>
            </div>
            <Link
              to="/doctor/onboarding"
              className="bg-darkGreen text-white px-6 py-3 rounded-2xl font-bold hover:bg-opacity-90 transition-all shadow-md whitespace-nowrap"
            >
              {onboardingStep === 0 ? "Start Onboarding" : "Continue"}
            </Link>
          </div>
        )}

        <div className="flex flex-col xl:flex-row w-full gap-8 flex-1 min-h-0">
          {activeTab === "calendar" ? (
            <>
              <div className="lg:flex-1 bg-white rounded-3xl shadow-sm border border-gray-200 p-8 h-full min-h-0">
                <Calendar<CalendarSlot>
                  popup
                  min={minDate}
                  max={maxDate}
                  selectable
                  localizer={localizer}
                  events={[
                    ...slots.map((event) => ({
                      ...event,
                      start: new Date(event.start),
                      end: new Date(event.end),
                      isHoliday: false,
                    })),
                    ...exceptions.map((ex) => ({
                      id: `holiday-${ex.id}`,
                      title: ex.reason,
                      start: new Date(ex.startDatetime),
                      end: new Date(ex.endDatetime),
                      isHoliday: true,
                      reason: ex.reason,
                    })),
                  ]}
                  view={view}
                  date={date}
                  onView={setView}
                  onNavigate={(newDate) => setDate(newDate)}
                  views={["month", "week", "day"]}
                  defaultView="month"
                  className="font-sans text-gray-600 custom-calendar h-full"
                  dayPropGetter={dayPropGetter}
                  onSelectSlot={(slotInfo) => {
                    const start = slotInfo.start;
                    const currDate = new Date();
                    currDate.setHours(0, 0, 0, 0);
                    if (start < currDate) {
                      toast.error("Cannot select past date");
                      return;
                    }
                    setModalDate(dayjs(start).format("YYYY-MM-DD"));
                    toggleCreateSlotModal();
                  }}
                  onSelectEvent={(event) => {
                    if (event.isHoliday) {
                      toast.success(
                        `Holiday: ${event.reason}\n${dayjs(event.start).format("MMM D, YYYY h:mm A")} - ${dayjs(event.end).format("MMM D, YYYY h:mm A")}`,
                        { duration: 4000 }
                      );
                      return;
                    }
                    const currEvent: Slot = {
                      id: event.id,
                      title: event.title,
                      start: event.start.toISOString(),
                      end: event.end.toISOString(),
                      mode: event.mode || "",
                      practiceLocationId: event.practiceLocationId || "",
                      isBooked: event.isBooked,
                      isVirtual: event.isVirtual,
                      scheduleRuleId: event.scheduleRuleId,
                      status: event.status,
                    };
                    setViewSlot(currEvent);
                  }}
                  components={{
                    event: ({ event }) => {
                      if (event.isHoliday) {
                        const timeStr = `${dayjs(event.start).format("h:mm A")} - ${dayjs(event.end).format("h:mm A")}`;
                        const fullTooltip = `${event.reason} (${timeStr})`;
                        if (view === "month") {
                          return (
                            <span className="truncate block font-semibold text-xs leading-none" title={fullTooltip}>
                              Holiday: {event.reason} ({timeStr})
                            </span>
                          );
                        }
                        return (
                          <div className="flex flex-col h-full min-w-0" title={fullTooltip}>
                            <span className="font-semibold truncate text-xs leading-tight">{event.reason}</span>
                            <span className="text-[10px] opacity-90 truncate leading-none mt-0.5">
                              {timeStr}
                            </span>
                          </div>
                        );
                      }
                      return (
                        <span className="truncate block text-xs" title={event.title}>
                          {event.title}
                        </span>
                      );
                    }
                  }}
                  eventPropGetter={eventStyleGetter}
                />
              </div>

              <div className="w-full xl:w-96 flex flex-col gap-6 h-full overflow-y-auto pr-1 flex-shrink-0 custom-scrollbar pb-4">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 flex flex-col gap-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    Quick Setup
                  </h3>
                  <div className="space-y-3">
                    <button
                      className="w-full py-4 bg-darkGreen text-white rounded-2xl font-bold hover:bg-opacity-95 transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
                      onClick={() => {
                        setRecurr(false);
                        setModalDate(dayjs(date).format("YYYY-MM-DD"));
                        toggleCreateSlotModal();
                      }}
                    >
                      <Plus size={20} /> One-off Slot
                    </button>
                    <button
                      className="w-full py-4 bg-white border-2 border-darkGreen text-darkGreen rounded-2xl font-bold hover:bg-green-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      onClick={() => {
                        setModalDate(dayjs(date).format("YYYY-MM-DD"));
                        toggleCreateRuleModal();
                      }}
                    >
                      <Repeat size={20} /> Recurring Schedule
                    </button>
                  </div>
                  {/* <div className="mt-2 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <p className="text-[13px] text-blue-700 leading-relaxed font-medium">
                      Virtual slots are generated from your rules.
                      Standard slots are overrides or booked
                      appointments.
                    </p>
                  </div> */}
                </div>

                <DViewSlot
                  id={viewSlot?.id || ""}
                  onEditSeries={(ruleId) => {
                    setSelectedRuleId(ruleId);
                    toggleEditRuleModal();
                  }}
                  onUpdate={handleSlotUpdate}
                  onDelete={handleSlotDelete}
                />
              </div>
            </>
          ) : activeTab === "rules" ? (
            <div className="w-full h-full overflow-y-auto custom-scrollbar">
              <DScheduleRules
                onEdit={(ruleId) => {
                  setSelectedRuleId(ruleId);
                  toggleEditRuleModal();
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full overflow-y-auto custom-scrollbar">
              <DDoctorExceptions />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default DSlotsPage;
