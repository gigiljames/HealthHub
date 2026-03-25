import { MESSAGES } from "../../../domain/constants/messages";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { ISlotValidationService } from "../../../domain/interfaces/services/ISlotValidationService";
import { IEditSlotUsecase } from "../../../domain/interfaces/usecases/slot/IEditSlotUsecase";
import { SlotStatus } from "../../../domain/enums/slotStatus";
import { slotDTO } from "../../DTOs/slot/slotDTO";
import { SlotMapper } from "../../mappers/slotMapper";

export class EditSlotUsecase implements IEditSlotUsecase {
  constructor(
    private _slotRepository: ISlotRepository,
    private _slotValidationService: ISlotValidationService,
  ) {}

  async execute(slot: slotDTO): Promise<slotDTO> {
    const existingSlot = await this._slotRepository.findById(slot.id!);
    if (existingSlot) {
      if (existingSlot.status !== SlotStatus.AVAILABLE) {
        throw new CustomError(
          HttpStatusCodes.FORBIDDEN,
          MESSAGES.SLOT.ALREADY_BOOKED,
        );
      } else {
        existingSlot.title = slot.title;
        existingSlot.start = new Date(slot.start);
        existingSlot.end = new Date(slot.end);
        existingSlot.mode = slot.mode;
        existingSlot.practiceLocationId = slot.practiceLocationId;

        const start = new Date(existingSlot.start);
        const end = new Date(existingSlot.end);

        this._slotValidationService.validateTime(start, end);
        this._slotValidationService.validateDateRange(start);

        const allSlots = await this._slotRepository.findByDoctorId(
          existingSlot.doctorId,
        );
        this._slotValidationService.validateOverlap(existingSlot, allSlots);

        const returnValue = await this._slotRepository.save(existingSlot);
        return SlotMapper.toSlotDTOFromEntity(returnValue);
      }
    } else {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, MESSAGES.SLOT.NOT_FOUND);
    }
  }
}
