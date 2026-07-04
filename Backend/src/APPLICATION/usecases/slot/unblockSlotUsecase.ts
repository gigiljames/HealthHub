import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IUnblockSlotUsecase } from "../../../domain/interfaces/usecases/slot/IUnblockSlotUsecase";
import { slotDTO } from "../../DTOs/slot/slotDTO";
import { SlotMapper } from "../../mappers/slotMapper";

export class UnblockSlotUsecase implements IUnblockSlotUsecase {
  constructor(private readonly _slotRepository: ISlotRepository) {}

  async execute(slotId: string): Promise<slotDTO> {
    const updated = await this._slotRepository.unblockSlot(slotId);
    if (!updated) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SLOT.NOT_FOUND,
      );
    }
    return SlotMapper.toSlotDTOFromEntity(updated);
  }
}
