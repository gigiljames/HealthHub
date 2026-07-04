import Slot from "../../domain/entities/slot";
import { ISlotValidationService } from "../../domain/interfaces/services/ISlotValidationService";
import { env } from "../../config/envConfig";
import { CustomError } from "../../domain/entities/customError";
import { HttpStatusCodes } from "../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../domain/constants/messages";

export class SlotValidationService implements ISlotValidationService {
  validateTime(start: Date, end: Date): void {
    if (start >= end) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        MESSAGES.SLOT.END_TIME_MUST_BE_AFTER_START_TIME,
      );
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
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        MESSAGES.SLOT.CANNOT_CREATE_SLOTS_IN_PAST,
      );
    }

    if (slotDate > maxDate) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        MESSAGES.SLOT.CANNOT_CREATE_SLOTS_MORE_THAN_MAX_DAYS_AHEAD.replace(
          "{maxDays}",
          maxDays.toString(),
        ),
      );
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
        throw new CustomError(
          HttpStatusCodes.CONFLICT,
          MESSAGES.SLOT.OVERLAPS_WITH_EXISTING_SLOT.replace(
            "{slotTitle}",
            slot.title,
          ),
        );
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
