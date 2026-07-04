import Slot from "../../entities/slot";

export interface ISlotValidationService {
  validateTime(start: Date, end: Date): void;
  validateDateRange(start: Date): void;
  validateOverlap(newSlot: Slot, existingSlots: Slot[]): void;
  checkRecurringOverlap(newSlot: Slot, existingSlots: Slot[]): boolean;
}
