import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { SlotMapper } from "../../mappers/slotMapper";
import { slotDTO } from "../../DTOs/slot/slotDTO";
import { env } from "../../../config/envConfig";
import { ILockSlotUsecase } from "../../../domain/interfaces/usecases/slot/ILockSlotUsecase";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";

export class LockSlotUseCase implements ILockSlotUsecase {
  constructor(private readonly _slotRepository: ISlotRepository) {}

  async execute(slotId: string, patientId: string): Promise<slotDTO> {
    const now = new Date();
    const lockExpiry = new Date(now.getTime() + env.SLOT_LOCK_EXPIRY_MS);

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
