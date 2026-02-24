import Slot from "../../domain/entities/slot";
import { ISlotValidationService } from "../../domain/interfaces/services/ISlotValidationService";
import { env } from "../../config/envConfig";

export class SlotValidationService implements ISlotValidationService {
  validateTime(start: Date, end: Date): void {
    if (start >= end) {
      throw new Error("End time must be after start time");
    }
  }

  validateDateRange(start: Date): void {
    const maxDays = env.MAX_SLOT_DAYS;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + maxDays);

    const slotDate = new Date(start);
    slotDate.setHours(0, 0, 0, 0);

    if (slotDate < today) {
      throw new Error("Cannot create slots in the past");
    }

    if (slotDate > maxDate) {
      throw new Error(`Cannot create slots more than ${maxDays} days ahead`);
    }
  }

  validateOverlap(newSlot: Slot, existingSlots: Slot[]): void {
    const newStart = new Date(newSlot.start);
    const newEnd = new Date(newSlot.end);

    for (const slot of existingSlots) {
      if (newSlot.id && slot.id === newSlot.id) continue;

      const existingStart = new Date(slot.start);
      const existingEnd = new Date(slot.end);

      if (newStart < existingEnd && newEnd > existingStart) {
        throw new Error(`Slot overlaps with existing slot: ${slot.title}`);
      }
    }
  }

  checkRecurringOverlap(newSlot: Slot, existingSlots: Slot[]): boolean {
    const newStart = new Date(newSlot.start);
    const newEnd = new Date(newSlot.end);

    for (const slot of existingSlots) {
      if (newSlot.id && slot.id === newSlot.id) continue;

      const existingStart = new Date(slot.start);
      const existingEnd = new Date(slot.end);

      if (newStart < existingEnd && newEnd > existingStart) {
        return true;
      }
    }
    return false;
  }
}
