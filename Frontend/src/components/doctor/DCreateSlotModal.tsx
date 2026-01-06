import { useDispatch } from "react-redux";
import {
  createRecurringSlots,
  createSlot,
  type Slot,
} from "../../state/doctor/dSlotSlice";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import getIcon from "../../helpers/getIcon";
import { days } from "../../constants/dateAndTime";
import { RRule } from "rrule";
import { useDoctorSlotManagementStore } from "../../zustand/doctoreStore";
import toast from "react-hot-toast";
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
  const [recurMode, setRecurMode] = useState("");
  const [mode, setMode] = useState<"online" | "in-person" | "">("");
  const [modalDate, setModalDate] = useState("");
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const endErrorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setModalDate(date);
  }, []);

  function handleCreateSlot() {
    const startDate = buildDateFromDateAndTime(modalDate, start);
    const maxAllowedDate = getMaxAllowedDate();
    if (recurr) {
      let dates = null;
      if (recurMode === "week") {
        const endOfWeek = new Date(startDate);
        endOfWeek.setDate(startDate.getDate() + (6 - startDate.getDay()));
        const untilDate =
          endOfWeek > maxAllowedDate ? maxAllowedDate : endOfWeek;
        const rule = new RRule({
          freq: RRule.DAILY,
          dtstart: startDate,
          until: untilDate,
        });
        dates = rule.all();
      } else if (recurMode === "day") {
        const weekdayMap = [
          RRule.SU,
          RRule.MO,
          RRule.TU,
          RRule.WE,
          RRule.TH,
          RRule.FR,
          RRule.SA,
        ];
        const weekday = weekdayMap[startDate.getDay()];
        const rule = new RRule({
          freq: RRule.WEEKLY,
          byweekday: [weekday],
          dtstart: startDate,
          until: maxAllowedDate,
        });
        dates = rule.all();
      } else if (recurMode === "month") {
        const endOfMonth = new Date(
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          0,
          23,
          59,
          59
        );
        const untilDate =
          endOfMonth > maxAllowedDate ? maxAllowedDate : endOfMonth;
        const rule = new RRule({
          freq: RRule.DAILY,
          dtstart: startDate,
          until: untilDate,
        });
        dates = rule.all();
      }
      if (dates) {
        //API call here
        const newSlots: Slot[] = [];
        for (let i = 0; i < dates?.length; i++) {
          const newSlot: Slot = {
            title: title,
            mode: mode,
            _id: uuidv4(),
            start: dates[i].toISOString(),
            end: dates[i].toISOString(),
          };
          newSlots.push(newSlot);
        }
        dispatch(createRecurringSlots(newSlots));
      }
    } else {
      if (startDate > maxAllowedDate) {
        toast.error(`Slots can only be created ${MAX_DAYS_AHEAD} days ahead.`);
        return;
      }
      let slot: Slot = {
        title: title,
        mode: mode,
        _id: uuidv4(),
        start: buildDateFromDateAndTime(modalDate, start).toISOString(),
        end: buildDateFromDateAndTime(modalDate, end).toISOString(),
      };
      try {
        //API call here
        dispatch(createSlot(slot));
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
                  setMode(e.target.value as "online" | "in-person" | "");
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
                      value="week"
                      checked={recurMode === "week"}
                      onChange={(e) => setRecurMode(e.target.value)}
                    />
                    This week
                  </label>
                  <label htmlFor="">
                    <input
                      type="radio"
                      name="recurr"
                      value="day"
                      checked={recurMode === "day"}
                      onChange={(e) => setRecurMode(e.target.value)}
                    />
                    Every {days[new Date(modalDate).getDay()]}
                  </label>
                  <label htmlFor="">
                    <input
                      type="radio"
                      name="recurr"
                      value="month"
                      checked={recurMode === "month"}
                      onChange={(e) => setRecurMode(e.target.value)}
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
