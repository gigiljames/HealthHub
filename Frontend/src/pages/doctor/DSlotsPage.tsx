import { Calendar, dayjsLocalizer, type View } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import { useDoctorSlotManagementStore } from "../../zustand/doctoreStore";
import DCreateSlotModal from "../../components/doctor/DCreateSlotModal";
import { deleteSlot, type Slot } from "../../state/doctor/dSlotSlice";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import toast from "react-hot-toast";
import DEditSlotModal from "../../components/doctor/DEditSlotModal";
import DNavbar from "../../components/doctor/DNavbar";

function DSlotsPage() {
  const localizer = dayjsLocalizer(dayjs);
  const createSlotModal = useDoctorSlotManagementStore(
    (state) => state.createSlotModal
  );
  const toggleCreateSlotModal = useDoctorSlotManagementStore(
    (state) => state.toggleCreateSlotModal
  );
  const editSlotModal = useDoctorSlotManagementStore(
    (state) => state.editSlotModal
  );
  const toggleEditSlotModal = useDoctorSlotManagementStore(
    (state) => state.toggleEditSlotModal
  );
  const setRecurr = useDoctorSlotManagementStore((state) => state.setRecurr);
  const dispatch = useDispatch();
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

  useEffect(() => {
    // dispatch(setSlots(slotSampleData));
  }, []);

  const eventStyleGetter = (event) => {
    let className = "rounded-md px-2 py-1 text-xs font-medium text-white";

    if (event.isBooked) {
      className += " !bg-green-500 !hover:bg-green-400";
    } else {
      className += " !bg-gray-600";
    }

    return { className };
  };

  const confirmDelete = () => {
    if (viewSlot) {
      try {
        dispatch(deleteSlot(viewSlot._id));
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
      <div className="bg-[#F5F7FA] flex justify-center h-[calc(100vh-70px)]">
        {createSlotModal && <DCreateSlotModal date={modalDate} />}
        {editSlotModal && <DEditSlotModal slot={viewSlot} />}
        <div className="flex flex-col w-[92%] gap-3 p-3">
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
          <div>
            <h1 className="font-semibold text-3xl pl-2">Calendar</h1>
          </div>
          <div className="flex flex-col lg:flex-row w-full h-full gap-3 p-2">
            <div className="w-full h-full border-1 rounded-md p-4">
              <Calendar
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
                style={{ height: 500 }}
                onSelectSlot={(slotInfo) => {
                  const start = slotInfo.start;
                  setModalDate(start.toLocaleDateString());
                  toggleCreateSlotModal();
                }}
                onSelectEvent={(event) => {
                  const currEvent = {
                    ...event,
                    start: event.start.toISOString(),
                    end: event.end.toISOString(),
                  };
                  setViewSlot(currEvent);
                }}
                eventPropGetter={eventStyleGetter}
              />
            </div>
            <div className="w-full lg:w-150 bg-blue-50 flex flex-col gap-2">
              <div className="flex flex-col gap-2 border-1 p-2 rounded-md">
                <button
                  className="border-1 p-2 rounded-sm cursor-pointer"
                  onClick={() => {
                    setModalDate(date.toLocaleDateString());
                    toggleCreateSlotModal();
                  }}
                >
                  Create a slot
                </button>
                <button
                  className="border-1 p-2 rounded-sm cursor-pointer"
                  onClick={() => {
                    setModalDate(date.toLocaleDateString());
                    toggleCreateSlotModal();
                    setRecurr(true);
                  }}
                >
                  Create recurring slots
                </button>
              </div>
              <div className="rounded-md border-1 h-full">
                <div className="border-b-1 flex p-1 justify-between">
                  <h3>Slot info</h3>
                  {viewSlot && !viewSlot.isBooked && (
                    <div className="flex gap-2">
                      <button onClick={() => toggleEditSlotModal()}>
                        Edit
                      </button>
                      <button onClick={() => setDeleteConfirmOpen(true)}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  {viewSlot ? (
                    <div>
                      <div>{viewSlot._id}</div>
                      <div>{viewSlot.title}</div>
                      <div>{new Date(viewSlot.start).toLocaleDateString()}</div>
                      <div>{new Date(viewSlot.start).toLocaleTimeString()}</div>
                      <div>{new Date(viewSlot.end).toLocaleTimeString()}</div>
                      <div>{viewSlot.mode}</div>
                      <div>{viewSlot.isBooked ? "Booked" : "Available"}</div>
                    </div>
                  ) : (
                    <div>Click on a slot to view it's details.</div>
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
