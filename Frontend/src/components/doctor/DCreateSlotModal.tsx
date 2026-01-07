import { useDispatch } from "react-redux";
import { addSlots } from "../../state/doctor/dSlotSlice";
import { useEffect, useRef, useState } from "react";
import getIcon from "../../helpers/getIcon";
import { days } from "../../constants/dateAndTime";
import { useDoctorSlotManagementStore } from "../../zustand/doctoreStore";
import toast from "react-hot-toast";
import {
  createSlot as createSlotApi,
  createRecurringSlots as createRecurringSlotsApi,
} from "../../api/doctor/dSlotManagementService";
import {
  buildDateFromDateAndTime,
  getMaxAllowedDate,
  MAX_DAYS_AHEAD,
} from "../../utils/DateTimeUtil";

interface DCreateSlotModalProps {
  date: string;
}

function DCreateSlotModal({ date }: DCreateSlotModalProps) {
  const toggleCreateSlotModal = useDoctorSlotManagementStore(
    (state) => state.toggleCreateSlotModal
  );
  const recurr = useDoctorSlotManagementStore((state) => state.recurr);
  const setRecurr = useDoctorSlotManagementStore((state) => state.setRecurr);
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [recurMode, setRecurMode] = useState<
    "this-week" | "every-this-day" | "this-month"
  >("this-week");
  const [mode, setMode] = useState<"online" | "in-person">("online");
  const [modalDate, setModalDate] = useState("");
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const endErrorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setModalDate(date);
  }, []);

  async function handleCreateSlot() {
    const startDate = buildDateFromDateAndTime(modalDate, start);
    const maxAllowedDate = getMaxAllowedDate();
    if (recurr) {
      const slotData = {
        title: title,
        mode: mode,
        start: buildDateFromDateAndTime(modalDate, start).toISOString(),
        end: buildDateFromDateAndTime(modalDate, end).toISOString(),
        recurMode: recurMode,
      };

      try {
        const data = await createRecurringSlotsApi(slotData);
        if (data && data.success) {
          dispatch(addSlots(data.slots));
          toggleCreateSlotModal();
          toast.success(data.message || "Recurring slots created successfully");
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    } else {
      if (startDate > maxAllowedDate) {
        toast.error(`Slots can only be created ${MAX_DAYS_AHEAD} days ahead.`);
        return;
      }
      const slotData = {
        title: title,
        mode: mode as "online" | "in-person",
        start: buildDateFromDateAndTime(modalDate, start).toISOString(),
        end: buildDateFromDateAndTime(modalDate, end).toISOString(),
        isBooked: false,
      };
      try {
        const data = await createSlotApi(slotData);
        if (data.success) {
          dispatch(addSlots([data.slot]));
          toggleCreateSlotModal();
          toast.success("Slot created successfully");
        }
      } catch (error) {
        if (startRef.current) {
          startRef.current.style.border = "1px solid red";
          startRef.current.style.color = "red";
        }
        if (endRef.current) {
          endRef.current.style.border = "1px solid red";
          endRef.current.style.color = "red";
        }
        if (error instanceof Error) {
          if (endErrorRef.current) {
            endErrorRef.current.innerText = error.message;
          }
          toast.error(error.message);
        }
      }
    }
  }

  return (
    <>
      <div className="h-screen w-screen fixed top-0 bg-black/50 z-50 flex justify-center items-center">
        <div className="bg-white p-4 rounded-md relative flex flex-col gap-2">
          <button
            className="absolute top-2 right-2 cursor-pointer hover:bg-slate-100 rounded-sm p-0.5"
            onClick={() => toggleCreateSlotModal()}
          >
            {getIcon("close", "24px", "black")}
          </button>
          <h2>Create Slot</h2>
          <div>
            <div className="flex flex-col gap-1">
              <label htmlFor="date">Date</label>
              <input
                className="border-1 rounded-sm p-2"
                type="text"
                id="date"
                value={modalDate}
                onChange={(e) => {
                  setModalDate(e.target.value);
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="title">Title</label>
              <input
                className="border-1 rounded-sm p-2"
                type="text"
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="startTime">Start</label>
              <input
                className="border-1 rounded-sm p-2"
                type="time"
                id="startTime"
                ref={startRef}
                value={start}
                onChange={(e) => {
                  setStart(e.target.value);
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="endTime">End</label>
              <input
                className="border-1 rounded-sm p-2"
                type="time"
                id="endTime"
                ref={endRef}
                value={end}
                onChange={(e) => {
                  setEnd(e.target.value);
                }}
              />
              <div className="text-red-500" ref={endErrorRef}></div>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="mode">Mode of consultation</label>
              <select
                className="border-1 rounded-sm p-2"
                id="mode"
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value as "online" | "in-person");
                }}
              >
                <option value="online">Online</option>
                <option value="in-person">In person</option>
              </select>
            </div>
            <div>
              <label htmlFor="">
                <input
                  type="checkbox"
                  checked={recurr}
                  onChange={(e) => setRecurr(e.target.checked)}
                />
                Create recurring slots
              </label>
              {recurr && (
                <div className="flex flex-col">
                  <label htmlFor="">
                    <input
                      type="radio"
                      name="recurr"
                      value="this-week"
                      checked={recurMode === "this-week"}
                      onChange={(e) =>
                        setRecurMode(
                          e.target.value as
                            | "this-week"
                            | "every-this-day"
                            | "this-month"
                        )
                      }
                    />
                    This week
                  </label>
                  <label htmlFor="">
                    <input
                      type="radio"
                      name="recurr"
                      value="every-this-day"
                      checked={recurMode === "every-this-day"}
                      onChange={(e) =>
                        setRecurMode(
                          e.target.value as
                            | "this-week"
                            | "every-this-day"
                            | "this-month"
                        )
                      }
                    />
                    Every {days[new Date(modalDate).getDay()]}
                  </label>
                  <label htmlFor="">
                    <input
                      type="radio"
                      name="recurr"
                      value="this-month"
                      checked={recurMode === "this-month"}
                      onChange={(e) =>
                        setRecurMode(
                          e.target.value as
                            | "this-week"
                            | "every-this-day"
                            | "this-month"
                        )
                      }
                    />
                    This month
                  </label>
                </div>
              )}
            </div>
          </div>
          <button
            className="w-full p-2 border-1 rounded-sm mt-2 cursor-pointer bg-green-300"
            onClick={() => {
              handleCreateSlot();
            }}
          >
            Create Slot
          </button>
        </div>
      </div>
    </>
  );
}

export default DCreateSlotModal;
