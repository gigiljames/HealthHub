import Slot from "../../../domain/entities/slot";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { ISlotValidationService } from "../../../domain/interfaces/services/ISlotValidationService";
import { ICreateSlotUsecase } from "../../../domain/interfaces/usecases/slot/ICreateSlotUsecase";
import { slotDTO } from "../../DTOs/slot/slotDTO";
import { SlotMapper } from "../../mappers/slotMapper";

export class CreateSlotUsecase implements ICreateSlotUsecase {
  constructor(
    private readonly _slotRepository: ISlotRepository,
    private readonly _slotValidationService: ISlotValidationService,
  ) {}

  async execute(slot: slotDTO, doctorId: string): Promise<slotDTO> {
    const newSlot = new Slot({
      doctorId: doctorId,
      title: slot.title,
      start: new Date(slot.start),
      end: new Date(slot.end),
      mode: slot.mode,
      practiceLocationId: slot.practiceLocationId,
    });

    const start = new Date(newSlot.start);
    const end = new Date(newSlot.end);

    this._slotValidationService.validateTime(start, end);
    this._slotValidationService.validateDateRange(start);

    const existingSlots = await this._slotRepository.findByDoctorId(doctorId);
    this._slotValidationService.validateOverlap(newSlot, existingSlots);

    const returnValue = await this._slotRepository.save(newSlot);
    return SlotMapper.toSlotDTOFromEntity(returnValue);
  }
}
