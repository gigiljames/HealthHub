import { Calendar, dayjsLocalizer, type View } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import { useDoctorSlotManagementStore } from "../../zustand/doctoreStore";
import DCreateSlotModal from "../../components/doctor/slots/DCreateSlotModal";
import { getSlots as getSlotsApi } from "../../api/doctor/dSlotManagementService";
import { type Slot, setSlots } from "../../state/doctor/dSlotSlice";
import toast from "react-hot-toast";
import DEditSlotModal from "../../components/doctor/slots/DEditSlotModal";
import DNavbar from "../../components/doctor/DNavbar";
import { Link } from "react-router";
import { getPracticeLocations } from "../../api/doctor/dProfileCreationService";
import { setPracticeLocations } from "../../state/doctor/dProfileCreationSlice";
import DViewSlot from "../../components/doctor/slots/DViewSlot";

interface CalendarSlot extends Omit<Slot, "start" | "end"> {
  start: Date;
  end: Date;
}

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
  const doctorId = useSelector((state: RootState) => state.userInfo.id);
  const setRecurr = useDoctorSlotManagementStore((state) => state.setRecurr);
  const dispatch = useDispatch();
  const { isNewUser, onboardingStep } = useSelector(
    (state: RootState) => state.userInfo,
  );

  const slots = useSelector((state: RootState) => state.dSlot.slots);
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState<Date>(new Date());
  const [modalDate, setModalDate] = useState("");
  const [viewSlot, setViewSlot] = useState<Slot | null>(null);
  const minDate = new Date();
  const maxDate = new Date();
  minDate.setMonth(minDate.getMonth() - 1);
  maxDate.setMonth(maxDate.getMonth() + 1);

  useEffect(() => {
    async function fetchSlots() {
      try {
        const response = await getSlotsApi(doctorId);
        const slots = response.slots;
        // console.log(slots);
        if (slots) {
          dispatch(setSlots(slots));
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    }
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
    fetchSlots();
    fetchPracticeLocations();
  }, []);

  const eventStyleGetter = (event: CalendarSlot) => {
    let className =
      "rounded-md px-2 py-1 text-xs font-medium text-white shadow-sm border-none";

    if (event.isBooked) {
      className += " !bg-green-500";
    } else {
      className += " !bg-gray-500";
    }

    return { className };
  };

  return (
    <>
      <DNavbar />
      <div className="bg-[#F5F7FA] min-h-screen pt-[70px] flex justify-center w-full">
        {createSlotModal && <DCreateSlotModal date={modalDate} />}
        {editSlotModal && <DEditSlotModal slot={viewSlot} />}

        <div className="w-[95%] lg:w-[90%] max-w-[1600px] flex flex-col gap-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800 ml-1">
              Slot Management
            </h1>
          </div>

          {isNewUser && (
            <div className="w-full bg-white border-1 border-gray-200 p-6 rounded-2xl flex  gap-2 items-center justify-between py-4">
              <div>
                {onboardingStep === 0 && (
                  <p className="font-semibold text-xl lg:text-2xl">
                    Your professional profile is not set up yet.
                  </p>
                )}
                {onboardingStep > 0 && (
                  <p className="font-semibold text-xl lg:text-2xl">
                    Your onboarding is {Math.floor((onboardingStep / 6) * 100)}%
                    complete.
                  </p>
                )}
                <p className="text-xs lg:text-sm text-gray-500 max-w-[800px]">
                  Your consultation slots depend on your profile, practice
                  location, and consultation modes. Please complete onboarding
                  to start creating and managing your availability.
                </p>
              </div>
              <Link
                to="/doctor/onboarding"
                className="bg-lightGreen/50 hover:bg-lightGreen/70 p-3 rounded-lg cursor-pointer border-1 border-slate-300 mt-4"
              >
                {onboardingStep === 0 && (
                  <p className="text-sm lg:text-base font-semibold text-center">
                    Start Onboarding
                  </p>
                )}
                {onboardingStep > 0 && (
                  <p className="text-sm lg:text-base font-semibold text-center">
                    Complete Onboarding
                  </p>
                )}
              </Link>
            </div>
          )}

          <div className="flex flex-col xl:flex-row w-full gap-6 h-full pb-10">
            <div className="lg:flex-1 lg:h-full bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-[700px]">
              <Calendar<CalendarSlot>
                popup
                min={minDate}
                max={maxDate}
                selectable
                localizer={localizer}
                events={slots.map((event) => {
                  return {
                    ...event,
                    start: new Date(event.start),
                    end: new Date(event.end),
                  };
                })}
                view={view}
                date={date}
                onView={setView}
                onNavigate={(newDate) => setDate(newDate)}
                views={["month", "week", "day"]}
                defaultView="month"
                className="font-sans text-gray-600"
                onSelectSlot={(slotInfo) => {
                  const start = slotInfo.start;
                  const currDate = new Date();
                  currDate.setHours(0, 0, 0, 0);
                  if (start < currDate) {
                    toast.error("Cannot select past date");
                    return;
                  }
                  setModalDate(start.toLocaleDateString());
                  toggleCreateSlotModal();
                }}
                onSelectEvent={(event) => {
                  const currEvent: Slot = {
                    ...event,
                    start: event.start.toISOString(),
                    end: event.end.toISOString(),
                  };
                  setViewSlot(currEvent);
                }}
                eventPropGetter={eventStyleGetter}
              />
            </div>

            <div className="w-full xl:w-96 flex flex-col gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col gap-3">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Quick Actions
                </h3>
                <button
                  className="w-full py-3 bg-darkGreen text-white rounded-xl font-semibold hover:bg-opacity-90 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                  onClick={() => {
                    setModalDate(date.toLocaleDateString());
                    toggleCreateSlotModal();
                  }}
                >
                  Create New Slot
                </button>
                <button
                  className="w-full py-3 bg-white border-2 border-darkGreen text-darkGreen rounded-xl font-semibold hover:bg-green-50 transition-all active:scale-95"
                  onClick={() => {
                    setModalDate(date.toLocaleDateString());
                    toggleCreateSlotModal();
                    setRecurr(true);
                  }}
                >
                  Create Recurring Slots
                </button>
              </div>

              <DViewSlot id={viewSlot?.id || ""} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DSlotsPage;
