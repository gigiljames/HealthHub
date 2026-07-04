import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { MESSAGES } from "../../../domain/constants/messages";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IBlockSlotUsecase } from "../../../domain/interfaces/usecases/slot/IBlockSlotUsecase";
import { slotDTO } from "../../DTOs/slot/slotDTO";
import { SlotMapper } from "../../mappers/slotMapper";

export class BlockSlotUsecase implements IBlockSlotUsecase {
  constructor(private readonly _slotRepository: ISlotRepository) {}

  async execute(slotId: string): Promise<slotDTO> {
    const updated = await this._slotRepository.blockSlot(slotId);
    if (!updated) {
      throw new CustomError(
        HttpStatusCodes.NOT_FOUND,
        MESSAGES.SLOT.NOT_FOUND,
      );
    }
    return SlotMapper.toSlotDTOFromEntity(updated);
  }
}
