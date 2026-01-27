import { Calendar, dayjsLocalizer, type View } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import { useDoctorSlotManagementStore } from "../../zustand/doctoreStore";
import DCreateSlotModal from "../../components/doctor/DCreateSlotModal";
import {
  getSlots as getSlotsApi,
  deleteSlot as deleteSlotApi,
} from "../../api/doctor/dSlotManagementService";
import { deleteSlot, type Slot, setSlots } from "../../state/doctor/dSlotSlice";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import toast from "react-hot-toast";
import DEditSlotModal from "../../components/doctor/DEditSlotModal";
import DNavbar from "../../components/doctor/DNavbar";
import getIcon from "../../helpers/getIcon";
import { Link } from "react-router";

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
  const toggleEditSlotModal = useDoctorSlotManagementStore(
    (state) => state.toggleEditSlotModal,
  );
  const setRecurr = useDoctorSlotManagementStore((state) => state.setRecurr);
  const dispatch = useDispatch();
  const isNewUser = useSelector((state: RootState) => state.userInfo.isNewUser);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const slots = useSelector((state: RootState) => state.dSlot.slots);
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState<Date>(new Date());
  const [modalDate, setModalDate] = useState("");
  const [viewSlot, setViewSlot] = useState<Slot | null>(null);
  const minDate = new Date();
  const maxDate = new Date();
  minDate.setMonth(minDate.getMonth() - 1);
  maxDate.setMonth(maxDate.getMonth() + 1);

  // useEffect(() => {}, [slots]);

  useEffect(() => {
    async function fetchSlots() {
      try {
        const response = await getSlotsApi();
        const slots = response.slots;
        if (slots) {
          dispatch(setSlots(slots));
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    }
    fetchSlots();
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

  const confirmDelete = async () => {
    if (viewSlot) {
      try {
        const response = await deleteSlotApi(viewSlot.id);
        if (response.success) {
          dispatch(deleteSlot(viewSlot.id));
          toast.success("Slot deleted successfully");
          setViewSlot(null);
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    }
    setDeleteConfirmOpen(false);
  };

  return (
    <>
      <DNavbar />
      <div className="bg-[#F5F7FA] min-h-screen pt-[70px] flex justify-center w-full">
        {createSlotModal && <DCreateSlotModal date={modalDate} />}
        {editSlotModal && <DEditSlotModal slot={viewSlot} />}

        <div className="w-[95%] lg:w-[90%] max-w-[1600px] flex flex-col gap-6 py-6">
          <ConfirmationModal
            isOpen={deleteConfirmOpen}
            onClose={() => setDeleteConfirmOpen(false)}
            onConfirm={confirmDelete}
            title="Delete Slot"
            message="Are you sure you want to delete slot? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            isDestructive={true}
          />

          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800 ml-1">
              Slot Management
            </h1>
          </div>

          {isNewUser && (
            <div className="w-full bg-white border-1 border-gray-200 p-6 rounded-2xl flex  gap-2 items-center justify-between py-4">
              <div>
                <p className="font-semibold text-xl lg:text-2xl">
                  Your professional profile is not set up yet.
                </p>
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
                <p className="text-sm lg:text-base font-semibold text-center">
                  Start Onboarding
                </p>
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

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex-1">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Slot Details
                  </h3>
                  {viewSlot && !viewSlot.isBooked && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleEditSlotModal()}
                        className="p-2 text-gray-500 hover:text-darkGreen hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit Slot"
                      >
                        {getIcon("edit")}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmOpen(true)}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Slot"
                      >
                        {getIcon("trash")}
                      </button>
                    </div>
                  )}
                </div>

                <div className="h-full">
                  {viewSlot ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          Title
                        </span>
                        <p className="text-xl font-bold text-gray-800 mt-1">
                          {viewSlot.title}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Date
                          </span>
                          <p className="font-semibold text-gray-700 mt-1">
                            {new Date(viewSlot.start).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Status
                          </span>
                          <div
                            className={`mt-1 w-fit items-center px-2 py-0.5 rounded text-xs font-bold ${viewSlot.isBooked ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
                          >
                            {viewSlot.isBooked ? "Booked" : "Available"}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Start Time
                          </span>
                          <p className="font-semibold text-gray-700 mt-1">
                            {new Date(viewSlot.start).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            End Time
                          </span>
                          <p className="font-semibold text-gray-700 mt-1">
                            {new Date(viewSlot.end).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          Consultation Mode
                        </span>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`w-3 h-3 rounded-full ${viewSlot.mode === "online" ? "bg-blue-400" : "bg-orange-400"}`}
                          ></span>
                          <p className="font-medium text-gray-700 capitalize">
                            {viewSlot.mode}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 flex flex-col items-center justify-center text-gray-400/60 text-center p-6 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50 gap-2">
                      {getIcon("calendar", "40px")}
                      <p className="font-medium">
                        Select a slot to view details
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DSlotsPage;
