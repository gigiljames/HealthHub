import { useEffect, useRef, useState } from "react";
import getIcon from "../../helpers/getIcon";
import { editSlot, type Slot } from "../../state/doctor/dSlotSlice";
import { useDoctorSlotManagementStore } from "../../zustand/doctoreStore";
import { useDispatch } from "react-redux";
import {
  buildDateFromDateAndTime,
  formatTimeForInputFromDate,
} from "../../utils/DateTimeUtil";
import toast from "react-hot-toast";

interface DEditSlotModalProps {
  slot: Slot | null;
}

function DEditSlotModal({ slot }: DEditSlotModalProps) {
  const toggleEditSlotModal = useDoctorSlotManagementStore(
    (state) => state.toggleEditSlotModal
  );
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [mode, setMode] = useState<"online" | "in-person" | "">("");
  const [modalDate, setModalDate] = useState("");
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const endErrorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (slot) {
      const startDate = new Date(slot.start);
      const endDate = new Date(slot.end);
      setTitle(slot.title);
      setModalDate(startDate.toLocaleDateString());
      setStart(formatTimeForInputFromDate(startDate));
      setEnd(formatTimeForInputFromDate(endDate));
      setMode(slot.mode);
    }
  }, [slot]);

  function handleSaveChanges() {
    let updatedSlot: Slot = {
      title: title,
      mode: mode,
      _id: slot!._id,
      start: buildDateFromDateAndTime(modalDate, start).toISOString(),
      end: buildDateFromDateAndTime(modalDate, end).toISOString(),
      isBooked: slot?.isBooked,
    };
    try {
      //API call here
      dispatch(editSlot(updatedSlot));
      toast.success("Slot updated successfully.");
      toggleEditSlotModal();
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

  if (!slot) {
    return (
      <>
        <div className="h-screen w-screen fixed top-0 bg-black/50 z-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded-md relative flex items-center gap-2 text-red-500">
            <p>Could not load edit modal.</p>
            <button
              className=" cursor-pointer hover:bg-slate-100 rounded-sm p-0.5"
              onClick={() => toggleEditSlotModal()}
            >
              {getIcon("close", "24px", "black")}
            </button>
          </div>
        </div>
      </>
    );
  }

  if (slot.isBooked) {
    return (
      <>
        <div className="h-screen w-screen fixed top-0 bg-black/50 z-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded-md relative flex items-center gap-2 text-red-500">
            <p>Cannot edit a slot which has already been booked.</p>
            <button
              className=" cursor-pointer hover:bg-slate-100 rounded-sm p-0.5"
              onClick={() => toggleEditSlotModal()}
            >
              {getIcon("close", "24px", "black")}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="h-screen w-screen fixed top-0 bg-black/50 z-50 flex justify-center items-center">
        <div className="bg-white p-4 rounded-md relative flex flex-col gap-2">
          <button
            className="absolute top-2 right-2 cursor-pointer hover:bg-slate-100 rounded-sm p-0.5"
            onClick={() => toggleEditSlotModal()}
          >
            {getIcon("close", "24px", "black")}
          </button>
          <h2>Edit Slot</h2>
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
          </div>
          <button
            className="w-full p-2 border-1 rounded-sm mt-2 cursor-pointer bg-green-300"
            onClick={() => {
              handleSaveChanges();
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}

export default DEditSlotModal;
