import { MESSAGES } from "../../../domain/constants/messages";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IDeleteSlotUsecase } from "../../../domain/interfaces/usecases/slot/IDeleteSlotUsecase";
import { SlotStatus } from "../../../domain/enums/slotStatus";

export class DeleteSlotUsecase implements IDeleteSlotUsecase {
  constructor(private _slotRepository: ISlotRepository) {}

  async execute(id: string): Promise<string> {
    const slot = await this._slotRepository.findById(id);
    if (slot) {
      if (slot.status !== SlotStatus.AVAILABLE) {
        throw new CustomError(
          HttpStatusCodes.FORBIDDEN,
          MESSAGES.SLOT.ALREADY_BOOKED,
        );
      } else {
        await this._slotRepository.deleteById(id);
        return id;
      }
    } else {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, MESSAGES.SLOT.NOT_FOUND);
    }
  }
}
