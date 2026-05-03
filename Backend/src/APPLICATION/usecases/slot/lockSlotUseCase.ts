import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IScheduleRuleRepository } from "../../../domain/interfaces/repositories/IScheduleRuleRepository";
import { SlotMapper } from "../../mappers/slotMapper";
import { slotDTO } from "../../DTOs/slot/slotDTO";
import { env } from "../../../config/envConfig";
import { ILockSlotUsecase } from "../../../domain/interfaces/usecases/slot/ILockSlotUsecase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

export class LockSlotUseCase implements ILockSlotUsecase {
  constructor(
    private readonly _slotRepository: ISlotRepository,
    private readonly _scheduleRuleRepository: IScheduleRuleRepository,
  ) {}

  async execute(slotId: string, patientId: string): Promise<slotDTO> {
    const now = new Date();
    const lockExpiry = new Date(now.getTime() + env.SLOT_LOCK_EXPIRY_MS);

    if (slotId.startsWith("vslot_")) {
      const parts = slotId.split("_");
      const ruleId = parts[1];
      const startTimeMillis = parseInt(parts[2], 10);
      const startTime = new Date(startTimeMillis);

      const rule = await this._scheduleRuleRepository.findById(ruleId);
      if (!rule || !rule.id) {
        throw new CustomError(
          HttpStatusCodes.NOT_FOUND,
          MESSAGES.SCHEDULE_RULE.NOT_FOUND,
        );
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
