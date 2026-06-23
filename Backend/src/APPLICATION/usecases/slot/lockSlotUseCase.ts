import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IScheduleRuleRepository } from "../../../domain/interfaces/repositories/IScheduleRuleRepository";
import { SlotMapper } from "../../mappers/slotMapper";
import { slotDTO } from "../../DTOs/slot/slotDTO";
import { env } from "../../../config/envConfig";
import { ILockSlotUsecase } from "../../../domain/interfaces/usecases/slot/ILockSlotUsecase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { authModel } from "../../../infrastructure/DB/models/authModel";

export class LockSlotUseCase implements ILockSlotUsecase {
  constructor(
    private readonly _slotRepository: ISlotRepository,
    private readonly _scheduleRuleRepository: IScheduleRuleRepository,
  ) {}

  async execute(slotId: string, patientId: string): Promise<slotDTO> {
    const now = new Date();
    const lockExpiry = new Date(now.getTime() + env.SLOT_LOCK_EXPIRY_MS);

    // Validate patient status
    const patientAuth = await authModel.findById(patientId);
    if (!patientAuth) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Patient account not found");
    }
    if (patientAuth.isBlocked) {
      throw new CustomError(HttpStatusCodes.FORBIDDEN, "Your account is currently suspended or banned.");
    }
    if (patientAuth.isBookingBlocked) {
      throw new CustomError(HttpStatusCodes.FORBIDDEN, "Your booking privileges have been disabled.");
    }

    if (slotId.startsWith("vslot_")) {
      const parts = slotId.split("_");
      const ruleId = parts[1];
      const startTimeMillis = parseInt(parts[2], 10);
      const startTime = new Date(startTimeMillis);

      if (startTime < now) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.SLOT.CANNOT_BOOK_PAST_SLOT,
        );
      }

      const rule = await this._scheduleRuleRepository.findById(ruleId);
      if (!rule || !rule.id) {
        throw new CustomError(
          HttpStatusCodes.NOT_FOUND,
          MESSAGES.SCHEDULE_RULE.NOT_FOUND,
        );
      }

      // Validate doctor status
      const doctorAuth = await authModel.findById(rule.doctorId);
      if (!doctorAuth) {
        throw new CustomError(HttpStatusCodes.NOT_FOUND, "Doctor account not found");
      }
      if (doctorAuth.isBlocked) {
        throw new CustomError(HttpStatusCodes.FORBIDDEN, "This doctor is currently unavailable.");
      }
      if (doctorAuth.isBookingBlocked) {
        throw new CustomError(HttpStatusCodes.FORBIDDEN, "This doctor is currently not accepting new bookings.");
      }

      const endTime = new Date(startTime.getTime() + rule.duration * 60000);

      const lockedSlot = await this._slotRepository.materializeAndLockSlot(
        {
          doctorId: rule.doctorId,
          title: rule.title,
          start: startTime,
          end: endTime,
          mode: rule.mode,
          practiceLocationId: rule.practiceLocationId,
          scheduleRuleId: rule.id,
        },
        patientId,
        lockExpiry,
      );

      if (!lockedSlot) {
        throw new CustomError(
          HttpStatusCodes.FORBIDDEN,
          MESSAGES.SLOT.NOT_AVAILABLE,
        );
      }

      return SlotMapper.toSlotDTOFromEntity(lockedSlot);
    }

    const slot = await this._slotRepository.findById(slotId);
    if (!slot) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SLOT.NOT_FOUND,
      );
    }
    if (slot.start < now) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        MESSAGES.SLOT.CANNOT_BOOK_PAST_SLOT,
      );
    }

    // Validate doctor status for concrete slot
    const doctorAuth = await authModel.findById(slot.doctorId);
    if (!doctorAuth) {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, "Doctor account not found");
    }
    if (doctorAuth.isBlocked) {
      throw new CustomError(HttpStatusCodes.FORBIDDEN, "This doctor is currently unavailable.");
    }
    if (doctorAuth.isBookingBlocked) {
      throw new CustomError(HttpStatusCodes.FORBIDDEN, "This doctor is currently not accepting new bookings.");
    }

    const lockedSlot = await this._slotRepository.lockSlotAtomically(
      slotId,
      patientId,
      lockExpiry,
      now,
    );

    if (!lockedSlot) {
      throw new CustomError(
        HttpStatusCodes.FORBIDDEN,
        MESSAGES.SLOT.NOT_AVAILABLE,
      );
    }

    return SlotMapper.toSlotDTOFromEntity(lockedSlot);
  }
}
