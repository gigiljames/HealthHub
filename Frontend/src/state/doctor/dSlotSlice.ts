import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Slot {
  _id: string;
  title: string;
  start: string;
  end: string;
  mode: "online" | "in-person" | "";
  isBooked?: boolean;
}

export interface SlotState {
  slots: Slot[];
}

function handleOverlap(slots: Slot[], newSlot: Slot, editMode?: boolean) {
  let returnObject = {
    success: true,
    message: "",
  };
  for (let slot of slots) {
    if (editMode && slot._id === newSlot._id) continue;
    const newStart = new Date(newSlot.start);
    const newEnd = new Date(newSlot.end);
    const start = new Date(slot.start);
    const end = new Date(slot.end);
    if (newStart < end && newEnd > start) {
      returnObject.success = false;
      returnObject.message = `Overlaps with slot - ${slot.title}`;
      break;
    }
  }
  return returnObject;
}

const initialState: SlotState = {
  slots: [
    {
      _id: "1",
      start: "2026-01-05T04:30:00.000Z",
      end: "2026-01-05T05:00:00.000Z",
      title: "Online Consultation",
      mode: "online",
      isBooked: false,
    },
    {
      _id: "2",
      start: "2026-01-05T05:15:00.000Z",
      end: "2026-01-05T05:45:00.000Z",
      title: "Clinic Visit",
      mode: "in-person",
      isBooked: false,
    },
    {
      _id: "3",
      start: "2026-01-12T10:00:00.000Z",
      end: "2026-01-12T10:30:00.000Z",
      title: "Online Consultation",
      mode: "online",
      isBooked: false,
    },
    {
      _id: "4",
      start: "2026-01-18T08:00:00.000Z",
      end: "2026-01-18T09:00:00.000Z",
      title: "Hospital OPD",
      mode: "in-person",
      isBooked: true,
    },
    {
      _id: "5",
      start: "2026-01-27T15:30:00.000Z",
      end: "2026-01-27T16:00:00.000Z",
      title: "Online Follow-up",
      mode: "online",
      isBooked: false,
    },
    {
      _id: "6",
      start: "2026-02-03T06:00:00.000Z",
      end: "2026-02-03T06:30:00.000Z",
      title: "Clinic Visit",
      mode: "in-person",
      isBooked: false,
    },
    {
      _id: "7",
      start: "2026-02-10T09:30:00.000Z",
      end: "2026-02-10T10:00:00.000Z",
      title: "Online Consultation",
      mode: "online",
      isBooked: true,
    },
    {
      _id: "8",
      start: "2026-02-14T12:00:00.000Z",
      end: "2026-02-14T13:00:00.000Z",
      title: "Hospital Consultation",
      mode: "in-person",
      isBooked: false,
    },
    {
      _id: "9",
      start: "2026-02-21T04:30:00.000Z",
      end: "2026-02-21T05:00:00.000Z",
      title: "Online Consultation",
      mode: "online",
      isBooked: true,
    },
    {
      _id: "10",
      start: "2026-02-28T07:00:00.000Z",
      end: "2026-02-28T08:00:00.000Z",
      title: "Clinic Visit",
      mode: "in-person",
      isBooked: false,
    },
  ],
};

const dSlotSlice = createSlice({
  name: "dSlotSlice",
  initialState: initialState,
  reducers: {
    createSlot: (state, action: PayloadAction<Slot>) => {
      const overlapCheck = handleOverlap(state.slots, action.payload);
      if (overlapCheck.success) {
        state.slots.push(action.payload);
      } else {
        throw new Error(overlapCheck.message);
      }
    },
    editSlot: (state, action: PayloadAction<Slot>) => {
      const updatedSlot = action.payload;
      const overlapCheck = handleOverlap(state.slots, updatedSlot, true);
      if (overlapCheck.success) {
        const existingSlot = state.slots.find(
          (slot) => slot._id === updatedSlot._id
        );
        if (existingSlot) {
          existingSlot.title = updatedSlot.title;
          existingSlot.start = updatedSlot.start;
          existingSlot.end = updatedSlot.end;
          existingSlot.mode = updatedSlot.mode;
        }
      } else {
        throw new Error(overlapCheck.message);
      }
    },
    deleteSlot: (state, action: PayloadAction<string>) => {
      state.slots = state.slots.filter((slot) => {
        if (slot._id === action.payload) {
          if (slot.isBooked) {
            throw new Error("Cannot delete booked slots");
          } else {
            return false;
          }
        } else {
          return true;
        }
      });
    },
    createRecurringSlots: (state, action: PayloadAction<Slot[]>) => {
      const slots = action.payload;
      for (let slot of slots) {
        const overlapCheck = handleOverlap(state.slots, slot);
        if (overlapCheck.success) {
          state.slots.push(slot);
        }
      }
    },
    setSlots: (state, action: PayloadAction<Slot[]>) => {
      state.slots = action.payload;
    },
  },
});

export const {
  createSlot,
  createRecurringSlots,
  editSlot,
  deleteSlot,
  setSlots,
} = dSlotSlice.actions;

export default dSlotSlice.reducer;
