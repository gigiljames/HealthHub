import { MESSAGES } from "../../../../domain/constants/messages";
import { CustomError } from "../../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../../domain/enums/httpStatusCodes";
import { ISlotRepository } from "../../../../domain/interfaces/repositories/ISlotRepository";
import { ISlotValidationService } from "../../../../domain/interfaces/services/ISlotValidationService";
import { IEditSlotUsecase } from "../../../../domain/interfaces/usecases/doctor/slotManagement/IEditSlotUsecase";
import { slotDTO } from "../../../DTOs/slotDTO";
import { SlotMapper } from "../../../mappers/slotMapper";

export class EditSlotUsecase implements IEditSlotUsecase {
  constructor(
    private _slotRepository: ISlotRepository,
    private _slotValidationService: ISlotValidationService
  ) {}

  async execute(slot: slotDTO): Promise<slotDTO> {
    const existingSlot = await this._slotRepository.findById(slot.id!);
    if (existingSlot) {
      if (existingSlot.isBooked) {
        throw new CustomError(
          HttpStatusCodes.FORBIDDEN,
          MESSAGES.SLOT_ALREADY_BOOKED
        );
      } else {
        existingSlot.title = slot.title;
        existingSlot.start = slot.start;
        existingSlot.end = slot.end;
        existingSlot.mode = slot.mode;

        const start = new Date(existingSlot.start);
        const end = new Date(existingSlot.end);

        this._slotValidationService.validateTime(start, end);
        this._slotValidationService.validateDateRange(start);

        const allSlots = await this._slotRepository.findByDoctorId(
          existingSlot.doctorId
        );
        this._slotValidationService.validateOverlap(existingSlot, allSlots);

        const returnValue = await this._slotRepository.save(existingSlot);
        return SlotMapper.toSlotDTOFromEntity(returnValue);
      }
    } else {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, MESSAGES.SLOT_NOT_FOUND);
    }
  }
}
