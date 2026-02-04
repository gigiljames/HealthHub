import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Slot {
  id: string;
  title: string;
  start: string;
  end: string;
  mode: "online" | "in-person" | "";
  practiceLocationId: string;
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
    if (editMode && slot.id === newSlot.id) continue;
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
  slots: [],
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
          (slot) => slot.id === updatedSlot.id,
        );
        if (existingSlot) {
          existingSlot.title = updatedSlot.title;
          existingSlot.start = updatedSlot.start;
          existingSlot.end = updatedSlot.end;
          existingSlot.mode = updatedSlot.mode;
          existingSlot.practiceLocationId = updatedSlot.practiceLocationId;
        }
      } else {
        throw new Error(overlapCheck.message);
      }
    },
    deleteSlot: (state, action: PayloadAction<string>) => {
      state.slots = state.slots.filter((slot) => {
        if (slot.id === action.payload) {
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
    addSlots: (state, action: PayloadAction<Slot[]>) => {
      state.slots = [...state.slots, ...action.payload];
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
  addSlots,
  setSlots,
} = dSlotSlice.actions;

export default dSlotSlice.reducer;
