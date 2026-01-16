import { MESSAGES } from "../../../domain/constants/messages";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { IDeleteSlotUsecase } from "../../../domain/interfaces/usecases/slot/IDeleteSlotUsecase";

export class DeleteSlotUsecase implements IDeleteSlotUsecase {
  constructor(private _slotRepository: ISlotRepository) {}

  async execute(id: string): Promise<string> {
    const slot = await this._slotRepository.findById(id);
    if (slot) {
      if (slot.isBooked) {
        throw new CustomError(
          HttpStatusCodes.FORBIDDEN,
          MESSAGES.SLOT_ALREADY_BOOKED
        );
      } else {
        await this._slotRepository.deleteById(id);
        return id;
      }
    } else {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, MESSAGES.SLOT_NOT_FOUND);
    }
  }
}
