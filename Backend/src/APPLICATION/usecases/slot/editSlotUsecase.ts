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
    private readonly _slotRepository: ISlotRepository,
    private readonly _slotValidationService: ISlotValidationService,
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
        if (existingSlot.start < new Date()) {
          throw new CustomError(
            HttpStatusCodes.BAD_REQUEST,
            "Cannot edit past slots",
          );
        }

        const newStart = new Date(slot.start);
        if (newStart < new Date()) {
          throw new CustomError(
            HttpStatusCodes.BAD_REQUEST,
            "Cannot edit a slot to be in the past",
          );
        }

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

        // Find and delete any other overlapping BLOCKED slots to allow this edit
        const overlappingBlocked = allSlots.filter(
          (s) =>
            s.id !== existingSlot.id &&
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
        const remainingSlots = allSlots.filter(
          (s) =>
            !(
              s.id !== existingSlot.id &&
              s.status === SlotStatus.BLOCKED &&
              start < s.end &&
              end > s.start
            ),
        );

        this._slotValidationService.validateOverlap(existingSlot, remainingSlots);

        const returnValue = await this._slotRepository.save(existingSlot);
        return SlotMapper.toSlotDTOFromEntity(returnValue);
      }
    } else {
      throw new CustomError(HttpStatusCodes.NOT_FOUND, MESSAGES.SLOT.NOT_FOUND);
    }
  }
}
