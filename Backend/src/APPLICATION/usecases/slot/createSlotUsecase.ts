import Slot from "../../../domain/entities/slot";
import { ISlotRepository } from "../../../domain/interfaces/repositories/ISlotRepository";
import { ISlotValidationService } from "../../../domain/interfaces/services/ISlotValidationService";
import { ICreateSlotUsecase } from "../../../domain/interfaces/usecases/slot/ICreateSlotUsecase";
import { slotDTO } from "../../DTOs/slot/slotDTO";
import { SlotMapper } from "../../mappers/slotMapper";
import { CustomError } from "../../../domain/entities/customError";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { SlotStatus } from "../../../domain/enums/slotStatus";

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

    if (start < new Date()) {
      throw new CustomError(
        HttpStatusCodes.BAD_REQUEST,
        "Cannot create slots in the past",
      );
    }

    this._slotValidationService.validateTime(start, end);
    this._slotValidationService.validateDateRange(start);

    const existingSlots = await this._slotRepository.findByDoctorId(doctorId);

    // Find and delete any overlapping BLOCKED slots to allow this new slot creation
    const overlappingBlocked = existingSlots.filter(
      (s) =>
        s.status === SlotStatus.BLOCKED &&
        start < s.end &&
        end > s.start,
    );

    for (const blockedSlot of overlappingBlocked) {
      if (blockedSlot.id) {
        await this._slotRepository.deleteById(blockedSlot.id);
      }
    }

    // Filter out deleted BLOCKED slots so validation passes
    const remainingSlots = existingSlots.filter(
      (s) =>
        !(s.status === SlotStatus.BLOCKED && start < s.end && end > s.start),
    );

    this._slotValidationService.validateOverlap(newSlot, remainingSlots);

    const returnValue = await this._slotRepository.save(newSlot);
    return SlotMapper.toSlotDTOFromEntity(returnValue);
  }
}
